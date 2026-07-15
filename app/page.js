'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Wordmark from '@/components/Wordmark';

export default function Home() {
  const [address, setAddress] = useState('');
  const [remember, setRemember] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Prefill from a previously remembered address (stored only in this browser).
  useEffect(() => {
    try {
      const saved = localStorage.getItem('xud-address');
      if (saved) {
        setAddress(saved);
        setRemember(true);
      }
    } catch {}
  }, []);

  function submitAddress(e) {
    e.preventDefault();
    try {
      if (remember) localStorage.setItem('xud-address', address);
      else localStorage.removeItem('xud-address');
    } catch {}
    sessionStorage.setItem('xud-query', JSON.stringify({ address }));
    router.push('/results');
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError('Your browser does not support location. Please type your address instead.');
      return;
    }
    setError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sessionStorage.setItem(
          'xud-query',
          JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        );
        router.push('/results');
      },
      () => {
        setLocating(false);
        setError("We couldn't get your location. Please type your address instead.");
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className="container">
      <section className="hero">
        <div className="eyebrow">Nonpartisan · Free · For everyone</div>
        <div className="hero-wordmark">
          <Wordmark href={null} />
        </div>
        <h1>Know who represents you.</h1>
        <p>Enter your address. See your elected officials and your upcoming elections.</p>
        <span className="hero-privacy">No account needed. Free forever.</span>
        <form onSubmit={submitAddress} className="lookup-form">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, Springfield, IL"
            aria-label="Your street address"
            autoComplete="street-address"
            required
          />
          <button type="submit">Find my officials</button>
        </form>
        <label className="remember-row">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember my address on this device
        </label>
        <button className="location-btn" onClick={useMyLocation} disabled={locating}>
          <span className="location-dot" />
          {locating ? 'Getting your location…' : 'Use my current location'}
        </button>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="pitch">
        <div className="pitch-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.4">
            <line x1="4" y1="21" x2="20" y2="21" />
            <rect x="6" y="10" width="12" height="11" />
            <polyline points="4,10 12,4 20,10" />
            <line x1="9" y1="14" x2="9" y2="18" />
            <line x1="15" y1="14" x2="15" y2="18" />
          </svg>
          <h2>Every level of government</h2>
          <p>Congress, your governor, and your state legislature today. Local officials as we grow.</p>
        </div>
        <div className="pitch-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.4">
            <circle cx="12" cy="8" r="3.4" />
            <path d="M5 20c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5" strokeLinecap="round" />
          </svg>
          <h2>Contact &amp; accountability</h2>
          <p>
            Direct phone, email, and office links for every official — so you can reach them and
            hold them accountable.
          </p>
        </div>
        <div className="pitch-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.4">
            <rect x="4" y="5" width="16" height="15" rx="1.5" />
            <polyline points="8,12 11,15 16,9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2>Never miss an election</h2>
          <p>Primaries, runoffs, and Election Day — see what&apos;s coming and subscribe to your state&apos;s calendar.</p>
        </div>
      </section>
    </div>
  );
}
