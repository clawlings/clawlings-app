-- Add sleep cycle offset for each pet (0-23 hours)
ALTER TABLE pets ADD COLUMN sleep_offset INT DEFAULT 0 CHECK (sleep_offset >= 0 AND sleep_offset < 24);

-- Set random offset for existing pets
UPDATE pets SET sleep_offset = floor(random() * 24);
