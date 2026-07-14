'use client';

import { useState, useEffect } from 'react';
import Wordmark from './Wordmark';

const NAV = [
  { href: '/', icon: '🔎', label: 'Find my officials' },
  { href: '/calendars', icon: '📅', label: 'Election calendars' },
  { href: '/why', icon: '🏛️', label: 'Who we are & why this matters' }
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('xud-theme');
      if (saved) setTheme(saved);
    } catch {}
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('xud-theme', next);
    } catch {}
  }

  return (
    <>
      <header className="site-header">
        <div className="header-left">
          <button
            className="menu-btn"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            ☰
          </button>
          <Wordmark />
        </div>
        <div className="header-right">
          <nav>
            <a href="/why">Why this matters</a>
          </nav>
          <button className="theme-toggle" onClick={toggleTheme}>
            <span className="theme-dot" />
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      {open && <div className="drawer-overlay" onClick={() => setOpen(false)} />}
      <aside className={`drawer ${open ? 'drawer-open' : ''}`} aria-hidden={!open}>
        <div className="drawer-top">
          <Wordmark href={null} />
          <button className="drawer-close" onClick={() => setOpen(false)} aria-label="Close menu">
            ✕
          </button>
        </div>
        <nav className="drawer-nav">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <span className="drawer-icon">{item.icon}</span> {item.label}
            </a>
          ))}
        </nav>
        <p className="drawer-fine">Nonpartisan · Free · We never store your address</p>
      </aside>
    </>
  );
}
