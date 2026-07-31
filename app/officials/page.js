'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RepCard from '@/components/RepCard';
import { googleCalendarUrl, icsUrl, webcalUrl } from '@/lib/site';

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function longDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function MajorSection({ id, title, lede, children }) {
  return (
    <section className="major" id={id}>
      <h2 className="major-title">{title}</h2>
      {lede && <p className="major-lede">{lede}</p>}
      {children}
    </section>
  );
}

// Offered once, after a successful lookup, when nothing is saved yet.
// Everything stays in this browser — there is no account and no server copy.
function SavePrompt({ address, onSaved, onDismiss }) {
  return (
    <div className="save-prompt" role="region" aria-label="Save this address">
      <div>
        <strong>Want to skip the search next time?</strong>
        <p>
          We can remember this address on this device so XUsDemocracy opens straight to your
          officials. It stays in your browser — no account, nothing sent to us.
        </p>
      </div>
      <div className="save-prompt-actions">
        <button className="save-prompt-yes" onClick={() => onSaved(address)}>
          Remember my address
        </button>
        <button className="save-prompt-no" onClick={onDismiss}>
          Not now
        </button>
      </div>
    </div>
  );
}

export default function Officials() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [askSave, setAskSave] = useState(false);
  const [savedAddress, setSavedAddress] = useState(null);
  const [queryAddress, setQueryAddress] = useState(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Normally the home page hands us a query. Landing here directly — from
    // the "My Officials" nav link or a bookmark — falls back to the saved
    // address so the page still works instead of bouncing to the form.
    let raw = sessionStorage.getItem('xud-query');
    if (!raw) {
      let saved = null;
      try {
        saved = localStorage.getItem('xud-address');
      } catch {}
      if (!saved) {
        router.replace('/?new=1');
        return;
      }
      raw = JSON.stringify({ address: saved });
      sessionStorage.setItem('xud-query', raw);
    }
    let parsed = {};
    try {
      parsed = JSON.parse(raw);
    } catch {}
    setQueryAddress(parsed.address || null);

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

        // Only offer to remember a typed address — a one-off GPS fix isn't
        // something we can re-run later.
        try {
          const already = localStorage.getItem('xud-address');
          setSavedAddress(already);
          const declined = localStorage.getItem('xud-save-declined');
          if (parsed.address && !already && !declined) setAskSave(true);
        } catch {}
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  function saveAddress(address) {
    try {
      localStorage.setItem('xud-address', address);
      localStorage.removeItem('xud-save-declined');
    } catch {}
    setSavedAddress(address);
    setAskSave(false);
  }

  function declineSave() {
    try {
      localStorage.setItem('xud-save-declined', '1');
    } catch {}
    setAskSave(false);
  }

  function forgetAddress() {
    try {
      localStorage.removeItem('xud-address');
      localStorage.removeItem('xud-save-declined');
    } catch {}
    setSavedAddress(null);
  }

  async function copyFeed() {
    try {
      await navigator.clipboard.writeText(icsUrl(result.state));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

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
          <a href="/?new=1">← Try another address</a>
        </p>
      </div>
    );
  }

  const {
    state,
    stateFullName,
    congressionalDistrict: cd,
    federal,
    governor,
    legislature,
    stateDistricts,
    stateLegislators,
    elections,
    registrationUrl,
    registrationDeadline,
    note
  } = result;

  // cd is 0 for at-large states and negative when the geocoder couldn't
  // pin a district — say less rather than something wrong.
  const districtPhrase =
    cd === 0
      ? `${stateFullName}'s at-large district`
      : cd > 0
        ? `${stateFullName}'s ${ordinal(cd)} district`
        : null;

  const federalLede =
    `Congress writes federal law — taxes, immigration, the military, and the national budget. ` +
    `It has two chambers. Every state elects two U.S. senators who represent the whole state, ` +
    `and the House is divided by population into 435 districts, each electing one representative.` +
    (districtPhrase ? ` You live in ${districtPhrase}.` : '');

  const stateLede = (() => {
    const base =
      'Your state government decides most of what you actually live with day to day: schools, ' +
      'roads, policing, housing, and health care rules. The governor runs the executive branch.';
    if (!legislature) return base;
    if (legislature.unicameral) {
      return `${base} ${stateFullName}'s ${legislature.name} is unicameral — ${legislature.upperSeats} members, one chamber, no house of representatives — so you have a single legislator here.`;
    }
    return `${base} ${stateFullName}'s ${legislature.name} has ${legislature.upperSeats} senators and ${legislature.lowerSeats} members of the ${legislature.lower}, and you are represented by one of each.`;
  })();

  const hasStateLegs =
    stateLegislators &&
    (stateLegislators.stateSenators.length > 0 || stateLegislators.stateReps.length > 0);

  return (
    <div className="container">
      <div className="officials-page">
        <header className="officials-head">
          <h1>My Officials</h1>
          <p className="matched-address">
            {result.matchedAddress === 'your current location' ? (
              <>Based on your current location</>
            ) : (
              <>
                Based on <strong>{result.matchedAddress}</strong>
              </>
            )}{' '}
            · <a href="/?new=1">new search</a>
            {savedAddress && (
              <>
                {' '}
                ·{' '}
                <button className="linkish" onClick={forgetAddress}>
                  forget this address
                </button>
              </>
            )}
          </p>
        </header>

        {askSave && (
          <SavePrompt address={queryAddress} onSaved={saveAddress} onDismiss={declineSave} />
        )}

        <p className="page-note">
          Every card below carries the contact details each official publishes — office phone,
          website, and a contact form where they offer one. <strong>Save contact</strong> drops
          them into your phone&apos;s address book, so reaching out later takes seconds instead of
          a search.
        </p>

        <MajorSection id="federal" title="Federal" lede={federalLede}>
          {federal.senators.map((s) => (
            <RepCard key={s.bioguide} rep={s} />
          ))}
          {federal.houseRep ? (
            <RepCard rep={federal.houseRep} />
          ) : (
            <p className="empty-note">
              No voting House member for this district. Washington, DC and the U.S. territories
              elect a delegate who serves on committees but cannot vote on final passage.
            </p>
          )}
        </MajorSection>

        <MajorSection id="state" title="State" lede={stateLede}>
          {governor && <RepCard rep={governor} />}
          {hasStateLegs ? (
            <>
              {stateLegislators.stateSenators.map((s, i) => (
                <RepCard key={`ss-${i}`} rep={s} />
              ))}
              {stateLegislators.stateReps.map((s, i) => (
                <RepCard key={`sr-${i}`} rep={s} />
              ))}
            </>
          ) : (
            <div className="empty-note">
              {stateDistricts.senate && (
                <p>
                  Your state senate district: <strong>{stateDistricts.senate.name}</strong>
                </p>
              )}
              {stateDistricts.house && (
                <p>
                  Your state house district: <strong>{stateDistricts.house.name}</strong>
                </p>
              )}
              <p>
                We couldn&apos;t load legislator names for these districts right now.{' '}
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
        </MajorSection>

        <MajorSection
          id="elections"
          title="Elections"
          lede="Primaries decide who gets on the November ballot, and far fewer people vote in them — which makes each ballot cast there count for more. Here is what is next where you live."
        >
          {elections.map((el) => (
            <div className="election-card" key={el.date + el.name}>
              <div className="election-date">
                <span className="election-day-count">{el.daysUntil}</span>
                <span>days away</span>
              </div>
              <div className="election-info">
                <h3>{el.name}</h3>
                <p className="election-date-label">{longDate(el.date)}</p>
                {el.description && <p className="election-desc">{el.description}</p>}
              </div>
            </div>
          ))}
          <p className="election-note">{note}</p>

          {registrationDeadline && (
            <div className="deadline-box">
              <h3>{registrationDeadline.headline}</h3>
              <p>{registrationDeadline.detail}</p>
            </div>
          )}

          <div className="action-block">
            <h3>Register, or confirm you still are</h3>
            <p>
              Registrations lapse when you move and sometimes when you sit out a few elections.
              vote.gov is the federal government&apos;s official portal; it hands you straight to{' '}
              {stateFullName}&apos;s election office.
            </p>
            <a className="cta-link" href={registrationUrl} target="_blank" rel="noopener noreferrer">
              Check or update my registration →
            </a>
          </div>

          <div className="action-block">
            <h3>Put these dates in your calendar</h3>
            <p>
              Subscribe once and your own calendar app fills in every {stateFullName} election
              date, plus a reminder a week before Election Day. It updates itself if a date moves.
            </p>
            <div className="cta-row">
              <a className="cta-link cta-link-blue" href={webcalUrl(state)}>
                Apple Calendar / Outlook
              </a>
              <a
                className="cta-link cta-link-blue"
                href={googleCalendarUrl(state)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Calendar
              </a>
              <button className="save-contact-btn" onClick={copyFeed}>
                {copied ? 'Link copied!' : 'Copy feed link'}
              </button>
            </div>
            <a className="subscribe-link" href="/calendars">
              All state calendars →
            </a>
          </div>
        </MajorSection>

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
