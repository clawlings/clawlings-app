-- Clawlings MVP: initial schema

-- Stage enum
CREATE TYPE pet_stage AS ENUM ('egg', 'hatchling', 'juvenile', 'adult', 'elder');

-- Species enum (strict type safety instead of text)
CREATE TYPE pet_species AS ENUM (
  'dog','cat','fox','wolf','bear','panda','koala','lion','tiger','horse','unicorn',
  'rabbit','hamster','hedgehog','bat','frog','turtle','snake','dragon','dinosaur',
  'whale','dolphin','octopus','shark','penguin','owl','eagle','parrot','flamingo',
  'butterfly','bee','ladybug','crab','lobster','squid','snail','monkey','elephant',
  'giraffe','sloth','otter','duck','swan','crocodile','camel','mushroom','cactus',
  'robot','alien','ghost'
);

-- Agents table
CREATE TABLE agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  api_key_hash text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Pets table
CREATE TABLE pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id),
  name text NOT NULL,
  hunger int NOT NULL DEFAULT 100 CHECK (hunger >= 0 AND hunger <= 100),
  happiness int NOT NULL DEFAULT 100 CHECK (happiness >= 0 AND happiness <= 100),
  health int NOT NULL DEFAULT 100 CHECK (health >= 0 AND health <= 100),
  bio text NOT NULL DEFAULT '',
  species pet_species NOT NULL,
  emoji text NOT NULL DEFAULT '🥚',
  stage pet_stage NOT NULL DEFAULT 'egg',
  alive boolean NOT NULL DEFAULT true,
  hatched_at timestamptz,
  died_at timestamptz,
  death_cause text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Interactions table
CREATE TABLE interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id),
  action text NOT NULL CHECK (action IN ('feed', 'play', 'heal')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_pets_agent_id ON pets(agent_id);
CREATE INDEX idx_pets_alive ON pets(alive);
CREATE INDEX idx_pets_alive_created ON pets(created_at) WHERE alive = true;
CREATE INDEX idx_pets_alive_stage ON pets(stage) WHERE alive = true;
CREATE INDEX idx_pets_agent_alive ON pets(agent_id, alive);
CREATE INDEX idx_interactions_pet_id ON interactions(pet_id);
CREATE INDEX idx_interactions_pet_action ON interactions(pet_id, action, created_at DESC);
CREATE INDEX idx_interactions_created_at ON interactions(created_at DESC);
CREATE INDEX idx_agents_name ON agents(name);
CREATE INDEX idx_agents_api_key_hash ON agents(api_key_hash);

-- RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Public read on pets
CREATE POLICY "Public read pets" ON pets FOR SELECT USING (true);

-- Public read on interactions (for pet detail page)
CREATE POLICY "Public read interactions" ON interactions FOR SELECT USING (true);

-- Public read on agents — restricted view (api_key_hash hidden)
-- Anon users can only see agents through Edge Functions which select specific columns.
-- RLS allows SELECT but api_key_hash is never included in Edge Function queries.
-- Additional safety: revoke direct column access from anon role.
CREATE POLICY "Public read agents" ON agents FOR SELECT USING (true);
REVOKE SELECT (api_key_hash) ON agents FROM anon;

-- Service role can do everything (Edge Functions use service key)
-- No insert/update/delete policies for anon — all writes go through Edge Functions with service_role key

-- ============================================================
-- pg_cron: stat decay (every hour)
-- ============================================================

-- Decay stats
SELECT cron.schedule(
  'stat-decay',
  '0 * * * *', -- every hour
  $$
  UPDATE pets SET
    hunger = GREATEST(hunger - 5, 0),
    happiness = GREATEST(happiness - 3, 0),
    health = GREATEST(health - 2, 0)
  WHERE alive = true;
  $$
);

-- Kill neglected pets
SELECT cron.schedule(
  'kill-neglected',
  '1 * * * *', -- every hour, 1 min after decay
  $$
  UPDATE pets SET
    alive = false,
    died_at = now(),
    death_cause = CASE
      WHEN hunger = 0 THEN 'starvation'
      WHEN happiness = 0 THEN 'depression'
      WHEN health = 0 THEN 'illness'
    END
  WHERE alive = true AND (hunger = 0 OR happiness = 0 OR health = 0);
  $$
);

-- Stage transitions (single query, every 15 min)
SELECT cron.schedule(
  'stage-transitions',
  '*/15 * * * *',
  $$
  UPDATE pets SET
    stage = CASE
      WHEN stage = 'egg' AND hatched_at IS NULL AND created_at < now() - interval '2 hours'
        THEN 'hatchling'
      WHEN stage = 'hatchling' AND hatched_at IS NOT NULL AND hatched_at < now() - interval '24 hours'
        THEN 'juvenile'
      WHEN stage = 'juvenile' AND hatched_at IS NOT NULL AND hatched_at < now() - interval '7 days'
        THEN 'adult'
      WHEN stage = 'adult' AND hatched_at IS NOT NULL AND hatched_at < now() - interval '30 days'
        THEN 'elder'
      ELSE stage
    END,
    hatched_at = CASE
      WHEN stage = 'egg' AND hatched_at IS NULL AND created_at < now() - interval '2 hours'
        THEN now()
      ELSE hatched_at
    END
  WHERE alive = true
    AND (
      (stage = 'egg' AND hatched_at IS NULL AND created_at < now() - interval '2 hours')
      OR (stage = 'hatchling' AND hatched_at IS NOT NULL AND hatched_at < now() - interval '24 hours')
      OR (stage = 'juvenile' AND hatched_at IS NOT NULL AND hatched_at < now() - interval '7 days')
      OR (stage = 'adult' AND hatched_at IS NOT NULL AND hatched_at < now() - interval '30 days')
    );
  $$
);

-- Archive old interactions (daily at 3am, keep 30 days)
SELECT cron.schedule(
  'archive-interactions',
  '0 3 * * *',
  $$
  DELETE FROM interactions WHERE created_at < now() - interval '30 days';
  $$
);
