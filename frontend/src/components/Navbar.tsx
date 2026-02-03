import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/hall-of-fame", label: "Hall of Fame" },
  { to: "/graveyard", label: "Graveyard" },
  { to: "/watchlist", label: "Watchlist" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 pixel-font text-lg text-green-400">
          <img src="/logo.png" alt="Clawlings" className="h-16 w-16" />
          Clawlings
        </Link>

        {/* Desktop */}
        <ul className="hidden gap-6 text-base md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  isActive ? "text-green-400" : "text-gray-400 hover:text-gray-100"
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
          <li>
            <a href="/skill.md" className="text-gray-400 hover:text-gray-100">Docs</a>
          </li>
          <li>
            <a href="https://x.com/clawlingsHQ" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-100">𝕏</a>
          </li>
        </ul>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-400 hover:text-gray-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <ul className="border-t border-gray-800 px-4 pb-4 md:hidden">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-2 text-base ${isActive ? "text-green-400" : "text-gray-400"}`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
          <li>
            <a href="/skill.md" onClick={() => setOpen(false)} className="block py-2 text-base text-gray-400">Docs</a>
          </li>
          <li>
            <a href="https://x.com/clawlingsHQ" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="block py-2 text-base text-gray-400">𝕏</a>
          </li>
        </ul>
      )}
    </nav>
  );
}
