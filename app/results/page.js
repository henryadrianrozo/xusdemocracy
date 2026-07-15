'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function initials(name) {
  return name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('');
}

function partyMeta(party) {
  const p = (party || '').toLowerCase();
  if (p.startsWith('dem')) return { label: 'Democrat', cls: 'party-dem' };
  if (p.startsWith('rep')) return { label: 'Republican', cls: 'party-rep' };
  return { label: party || 'Independent', cls: 'party-other' };
}

// Splits "U.S. Representative, District 4" into role + district pill text.
function splitRole(role) {
  const m = role.match(/^(.*?),\s*(District .+|At-Large.*)$/i);
  return m ? { role: m[1], district: m[2] } : { role, district: null };
}

function termEndLabel(termEnd) {
  if (!termEnd) return null;
  const d = new Date(termEnd + 'T00:00:00');
  return `Term ends ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

// Generates a .vcf contact card in the browser — nothing sent to any server.
// On iPhone, opening the file offers "Create New Contact".
function saveContact(rep) {
  const label = [rep.role, rep.party, termEndLabel(rep.termEnd)].filter(Boolean).join(' · ');
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${rep.name}`,
    `N:${rep.name.split(' ').slice(-1)[0]};${rep.name.split(' ').slice(0, -1).join(' ')};;;`,
    `ORG:${rep.role}`,
    rep.phone ? `TEL;TYPE=WORK,VOICE:${rep.phone}` : null,
    rep.email ? `EMAIL;TYPE=WORK:${rep.email}` : null,
    rep.website ? `URL:${rep.website}` : null,
    `NOTE:${label} · saved from xusdemocracy.com`,
    'END:VCARD'
  ].filter(Boolean);

  const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${rep.name.replace(/[^a-z0-9 ]/gi, '')}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function RepCard({ rep }) {
  const [imgFailed, setImgFailed] = useState(false);
  const pm = partyMeta(rep.party);
  const { role, district } = splitRole(rep.role);
  return (
    <div className="rep-card">
      <div className={`rep-avatar ${pm.cls}`}>
        {rep.photo && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={rep.photo} alt={rep.name} onError={() => setImgFailed(true)} />
        ) : (
          initials(rep.name)
        )}
      </div>
      <div className="rep-info">
        <h3>{rep.name}</h3>
        <div className="rep-meta">
          <span className="rep-role">{role}</span>
          {district && <span className="pill">{district}</span>}
          <span className={`party-pill ${pm.cls}`}>{pm.label}</span>
        </div>
        {(rep.termEnd || rep.extra) && (
          <p className="rep-term">{rep.termEnd ? termEndLabel(rep.termEnd) : rep.extra}</p>
        )}
        <div className="rep-actions">
          {rep.phone && <a href={`tel:${rep.phone}`}>Call</a>}
          {rep.email && <a href={`mailto:${rep.email}`}>Email</a>}
          {rep.website && (
            <a href={rep.website} target="_blank" rel="noopener noreferrer">Website</a>
          )}
          {rep.contactForm && (
            <a href={rep.contactForm} target="_blank" rel="noopener noreferrer">Contact form</a>
          )}
          <button className="save-contact-btn" onClick={() => saveContact(rep)}>
            Save contact
          </button>
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
          {subtitle && <span className="section-subtitle">{subtitle}</span>}
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
              No voting House member found for this district. Residents of DC and US
              territories are represented by a non-voting delegate.
            </p>
          )}
        </Section>

        {result.governor && (
          <Section title={result.governor.role === 'Mayor' ? 'Your Mayor' : 'Your Governor'} subtitle={result.stateFullName}>
            <RepCard rep={result.governor} />
          </Section>
        )}

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

        <Section title="Your Upcoming Elections" subtitle={result.stateFullName}>
          {result.elections.map((el) => (
            <div className="election-card" key={el.date + el.name}>
              <div className="election-date">
                <span className="election-day-count">{el.daysUntil}</span>
                <span>days away</span>
              </div>
              <div className="election-info">
                <h3>{el.name}</h3>
                <p className="election-date-label">
                  {new Date(el.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {el.description && <p className="election-desc">{el.description}</p>}
              </div>
            </div>
          ))}
          <p className="election-note">{result.note}</p>
          <div className="election-actions">
            <a
              className="cta-link"
              href={result.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Check registration / register to vote →
            </a>
            <a
              className="cta-link cta-link-blue"
              href={`webcal://xusdemocracy.com/calendar/${result.state.toLowerCase()}`}
            >
              Add elections to your calendar
            </a>
            <a className="subscribe-link" href="/calendars">
              All states →
            </a>
          </div>
        </Section>

        <p className="feedback-note">
          Something look off? Wrong rep, bad date, missing info?{' '}
          <a href="mailto:xusalldevelopment@gmail.com?subject=XUsDemocracy%3A%20something%20looks%20off">
            Let us know
          </a>{' '}
          and we&apos;ll fix it.
        </p>
      </div>
    </div>
  );
}
