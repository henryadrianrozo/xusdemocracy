'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// The query is passed to the results page via sessionStorage — NOT the URL —
// so the address never appears in browser history or server request logs.
export default function Home() {
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  function submitAddress(e) {
    e.preventDefault();
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
        <h1>Know who represents you.</h1>
        <p>
          Enter your address. See your elected officials and your next election.
          <br />
          <span className="hero-privacy">Your address is never stored. No account needed.</span>
        </p>
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
        <button className="location-btn" onClick={useMyLocation} disabled={locating}>
          {locating ? 'Getting your location…' : '📍 Or use my current location'}
        </button>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="pitch">
        <div className="pitch-item">
          <h2>🏛️ Every level</h2>
          <p>Congress and your state legislature today. Governors and local officials as we grow.</p>
        </div>
        <div className="pitch-item">
          <h2>🔒 Private by design</h2>
          <p>Your address is matched to districts and immediately forgotten. No account, no tracking.</p>
        </div>
        <div className="pitch-item">
          <h2>🗳️ Never miss an election</h2>
          <p>See what&apos;s coming and get registered — with links straight to official sources.</p>
        </div>
      </section>
    </div>
  );
}
