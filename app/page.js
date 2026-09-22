'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Wordmark from '@/components/Wordmark';
import { CourthouseIcon, GroupIcon } from '@/components/icons';

function Home() {
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const params = useSearchParams();
  // /?new=1 means "I want to look up a different address", so skip the
  // auto-redirect that normally sends returning visitors to their officials.
  const forceNew = params.get('new') === '1';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('xud-address');
      if (!saved) return;
      if (forceNew) {
        setAddress(saved);
        return;
      }
      // Returning visitor with a saved address: go straight to their officials.
      sessionStorage.setItem('xud-query', JSON.stringify({ address: saved }));
      router.replace('/officials');
    } catch {}
  }, [router, forceNew]);

  function submitAddress(e) {
    e.preventDefault();
    // A deliberate new search re-opens the offer to save. Declining once
    // should quiet the prompt for that result, not silence it forever.
    try {
      localStorage.removeItem('xud-save-declined');
    } catch {}
    sessionStorage.setItem('xud-query', JSON.stringify({ address }));
    router.push('/officials');
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
        router.push('/officials');
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
        <div className="hero-wordmark">
          <Wordmark href={null} />
        </div>
        <h1>Know who represents you.</h1>
        <p>Enter your address and see your officials and upcoming elections in seconds.</p>
        <span className="hero-privacy">
          Knowing is the first step to doing. Keep your representatives accountable!
        </span>
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
          <button type="submit">Who represents me?</button>
        </form>
        <button className="location-btn" onClick={useMyLocation} disabled={locating}>
          <span className="location-dot" />
          {locating ? 'Getting your location…' : 'Use my current location'}
        </button>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="pitch">
        <div className="pitch-item">
          <CourthouseIcon size={28} />
          <h2>Every level of government</h2>
          <p>Congress, your governor, and your state legislature today. Local officials as we grow.</p>
        </div>
        <div className="pitch-item">
          <GroupIcon size={28} />
          <h2>Contact &amp; accountability</h2>
          <p>
            Direct phone, email, and office links for every official, so you can reach them and
            hold them accountable.
          </p>
        </div>
        <div className="pitch-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.4">
            <rect x="4" y="5" width="16" height="15" rx="1.5" />
            <polyline points="8,12 11,15 16,9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2>Never miss an election</h2>
          <p>Primaries, runoffs, and Election Day. See what&apos;s coming and subscribe to your state&apos;s calendar.</p>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="container" />}>
      <Home />
    </Suspense>
  );
}
