'use client';

import { useState } from 'react';
import { FIPS_TO_STATE } from '@/lib/states';

const STATES = Object.values(FIPS_TO_STATE).sort((a, b) => a[1].localeCompare(b[1]));

export default function Calendars() {
  const [copied, setCopied] = useState(null);

  async function copyUrl(code) {
    const url = `https://xusdemocracy.com/calendar/${code.toLowerCase()}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      prompt('Copy this URL:', url);
    }
  }

  return (
    <div className="container">
      <section className="hero">
        <h1>Election calendars</h1>
        <p>
          Subscribe once — your calendar app reminds you automatically, including one week
          before every Election Day. Free, no account, auto-updates as we add primaries and
          special elections.
        </p>
        <p className="hero-privacy">
          On iPhone/Mac: tap Subscribe. For Google Calendar: copy the link, then in Google
          Calendar choose “Other calendars → From URL” and paste it.
        </p>
      </section>

      <div className="calendar-grid">
        {STATES.map(([code, name]) => (
          <div key={code} className="calendar-item">
            <strong>{name}</strong>
            <div className="calendar-actions">
              <a href={`webcal://xusdemocracy.com/calendar/${code.toLowerCase()}`}>Subscribe</a>
              <button onClick={() => copyUrl(code)}>
                {copied === code ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="feedback-note">
        Spot a wrong or outdated date? Email{' '}
        <a href="mailto:xusalldevelopment@gmail.com">xusalldevelopment@gmail.com</a> — we&apos;ll
        fix it fast.
      </p>
    </div>
  );
}
