'use client';

import { useState } from 'react';
import { FIPS_TO_STATE } from '@/lib/states';
import { googleCalendarUrl, icsUrl, webcalUrl } from '@/lib/site';

const STATES = Object.values(FIPS_TO_STATE).sort((a, b) => a[1].localeCompare(b[1]));

export default function Calendars() {
  const [copied, setCopied] = useState(null);

  async function copyUrl(code) {
    const url = icsUrl(code);
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
      <section className="hero hero-compact">
        <h1>Election calendars</h1>
        <p>
          Subscribe once and your calendar app reminds you automatically, including one week
          before every Election Day. Includes your state&apos;s 2026 primaries and runoffs.
          Free, no account, auto-updates as dates change.
        </p>
        <span className="hero-privacy">
          Apple Calendar and Outlook take the subscribe link directly. Google opens its
          &ldquo;add by URL&rdquo; screen — confirm there and it&apos;s in.
        </span>
      </section>

      <div className="calendar-grid">
        {STATES.map(([code, name]) => (
          <div key={code} className="calendar-item">
            <strong>{name}</strong>
            <div className="calendar-actions">
              <a href={webcalUrl(code)}>Apple</a>
              <a href={googleCalendarUrl(code)} target="_blank" rel="noopener noreferrer">
                Google
              </a>
              <button onClick={() => copyUrl(code)}>
                {copied === code ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="feedback-note">
        Spot a wrong or outdated date? Email{' '}
        <a href="mailto:xusalldevelopment@gmail.com">xusalldevelopment@gmail.com</a> and
        we&apos;ll fix it.
      </p>
    </div>
  );
}
