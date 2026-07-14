'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function initials(name) {
  return name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('');
}

function partyClass(party) {
  if (!party) return 'party-other';
  const p = party.toLowerCase();
  if (p.startsWith('dem')) return 'party-dem';
  if (p.startsWith('rep')) return 'party-rep';
  return 'party-other';
}

function RepCard({ rep }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div className="rep-card">
      {rep.photo && !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={rep.photo} alt={rep.name} className="rep-photo" onError={() => setImgFailed(true)} />
      ) : (
        <div className="rep-photo rep-photo-fallback">{initials(rep.name)}</div>
      )}
      <div className="rep-info">
        <h3>{rep.name}</h3>
        <p className="rep-role">
          <span className={`party-dot ${partyClass(rep.party)}`} />
          {rep.role}
          {rep.party ? ` · ${rep.party}` : ''}
        </p>
        <div className="rep-actions">
          {rep.phone && <a href={`tel:${rep.phone}`}>📞 {rep.phone}</a>}
          {rep.email && <a href={`mailto:${rep.email}`}>📧 Email</a>}
          {rep.website && (
            <a href={rep.website} target="_blank" rel="noopener noreferrer">🌐 Website</a>
          )}
          {rep.contactForm && (
            <a href={rep.contactForm} target="_blank" rel="noopener noreferrer">✉️ Contact</a>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="result-section">
      <button className="section-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>
          <strong>{title}</strong>
          {subtitle && <span className="section-subtitle"> — {subtitle}</span>}
        </span>
        <span className="chevron">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="section-body">{children}</div>}
    </section>
  );
}

export default function Results() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem('xud-query');
    if (!raw) {
      router.replace('/');
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: raw
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Lookup failed');
        setResult(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="container">
        <p className="loading-note">Finding your officials…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p className="error" style={{ marginTop: '2rem' }}>{error}</p>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a href="/">← Try another address</a>
        </p>
      </div>
    );
  }

  const districtLabel =
    result.congressionalDistrict === 0
      ? 'At-Large District'
      : `District ${result.congressionalDistrict}`;

  return (
    <div className="container">
      <div className="results">
        <p className="matched-address">
          Showing results for <strong>{result.matchedAddress}</strong> ·{' '}
          <a href="/">new search</a>
        </p>

        <Section title="Your U.S. Congress" subtitle={`${result.stateFullName} · ${districtLabel}`}>
          {result.federal.senators.map((s) => (
            <RepCard key={s.bioguide} rep={s} />
          ))}
          {result.federal.houseRep ? (
            <RepCard rep={result.federal.houseRep} />
          ) : (
            <p className="empty-note">
              No voting House member found for this district — residents of DC and US
              territories are represented by a non-voting delegate.
            </p>
          )}
        </Section>

        <Section title="Your State Legislature" subtitle={result.stateFullName}>
          {result.stateLegislators &&
          (result.stateLegislators.stateSenators.length > 0 ||
            result.stateLegislators.stateReps.length > 0) ? (
            <>
              {result.stateLegislators.stateSenators.map((s, i) => (
                <RepCard key={`ss-${i}`} rep={s} />
              ))}
              {result.stateLegislators.stateReps.map((s, i) => (
                <RepCard key={`sr-${i}`} rep={s} />
              ))}
            </>
          ) : (
            <div className="empty-note">
              {result.stateDistricts.senate && (
                <p>
                  Your state senate district: <strong>{result.stateDistricts.senate.name}</strong>
                </p>
              )}
              {result.stateDistricts.house && (
                <p>
                  Your state house district: <strong>{result.stateDistricts.house.name}</strong>
                </p>
              )}
              <p>
                Legislator names for state districts are coming soon.{' '}
                <a
                  href="https://openstates.org/find_your_legislator/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Look them up on OpenStates →
                </a>
              </p>
            </div>
          )}
        </Section>

        <Section title="Your Next Election">
          <div className="election-card">
            <div className="election-date">
              <span className="election-day-count">{result.election.daysUntil}</span>
              <span>days away</span>
            </div>
            <div>
              <h3>{result.election.name}</h3>
              <p>
                <strong>
                  {new Date(result.election.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </strong>
              </p>
              <p>{result.election.description}</p>
              <p className="election-note">{result.election.note}</p>
              <a
                className="cta-link"
                href={result.election.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Check your registration / register to vote ({result.stateFullName}) →
              </a>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
