'use client';

import { useState, useEffect } from 'react';
import Wordmark from './Wordmark';

const icons = {
  find: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="11" cy="11" r="6.5" />
      <line x1="16" y1="16" x2="21" y2="21" strokeLinecap="round" />
    </svg>
  ),
  person: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5" strokeLinecap="round" />
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="4" y="5" width="16" height="15" rx="1.5" />
      <line x1="4" y1="10" x2="20" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" strokeLinecap="round" />
      <line x1="16" y1="3" x2="16" y2="7" strokeLinecap="round" />
    </svg>
  ),
  capitol: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <line x1="4" y1="21" x2="20" y2="21" />
      <rect x="6" y="10" width="12" height="11" />
      <polyline points="4,10 12,4 20,10" />
      <line x1="9" y1="14" x2="9" y2="18" />
      <line x1="15" y1="14" x2="15" y2="18" />
    </svg>
  )
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('xud-theme');
      if (saved) setTheme(saved);
      setHasSaved(Boolean(localStorage.getItem('xud-address')));
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

  // "My Officials" only appears once there's an address saved on this device.
  const nav = [
    { href: '/?new=1', icon: icons.find, label: 'Who represents me?' },
    hasSaved && { href: '/officials', icon: icons.person, label: 'My Officials' },
    { href: '/calendars', icon: icons.calendar, label: 'Election Calendars' },
    { href: '/why', icon: icons.capitol, label: 'Why this matters' }
  ].filter(Boolean);

  return (
    <>
      <header className="site-header">
        <div className="header-side">
          <button
            className="menu-btn"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            ☰
          </button>
        </div>
        <Wordmark />
        <div className="header-side header-side-end">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle color theme">
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
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <span className="drawer-icon">{item.icon}</span> {item.label}
            </a>
          ))}
        </nav>
        <p className="drawer-fine">Nonpartisan · Free · Created by XUsAll</p>
      </aside>
    </>
  );
}
