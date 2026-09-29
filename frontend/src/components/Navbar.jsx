import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'My Projects' },
  { to: '/editor', label: 'Add Project' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const cls = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}`;

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-blue-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-sm text-white">IP</span>
          InternShowcase
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={cls}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/editor" className="btn-primary hidden sm:inline-flex">+ New Project</Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="rounded-lg border border-slate-200 p-2 md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={cls} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
