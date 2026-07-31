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

// Collapsible so a reader can fold away what they do not need and get to what
// they want. Native details, open every time, nothing persisted.
function MajorSection({ id, title, lede, children }) {
  return (
    <details className="major" id={id} open>
      <summary className="major-title">
        <span className="caret" aria-hidden="true" />
        {title}
      </summary>
      <div className="major-body">
        {lede && <p className="major-lede">{lede}</p>}
        {children}
      </div>
    </details>
  );
}

// One level down, and collapsible for the same reason: Federal carries a lot,
// and a reader who wants the Cabinet should not have to scroll past Congress.
function SubSection({ title, lede, children }) {
  return (
    <details className="sub" open>
      <summary className="sub-title">
        <span className="caret caret-sm" aria-hidden="true" />
        {title}
      </summary>
      {lede && <p className="sub-lede">{lede}</p>}
      {children}
    </details>
  );
}

// The Elections action blocks use this instead of SubSection. Each one ends in
// a button, so collapsing them would hide the point of the section.
function SubTitle({ children }) {
  return <h3 className="sub-title">{children}</h3>;
}

// Offered once, after a successful lookup, when nothing is saved yet.
// Everything stays in this browser. There is no account and no server copy.
function SavePrompt({ address, onSaved, onDismiss }) {
  return (
    <div className="save-prompt" role="region" aria-label="Save this address">
      <div>
        <strong>Want to skip the search next time?</strong>
        <p>
          We can remember this address on this device so XUsDemocracy opens straight to your
          officials. It stays in your browser, with no account and nothing sent to us.
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

function PersonList({ people, numbered = false }) {
  return (
    <ol className="national-list">
      {people.map((m, i) => (
        <li key={m.name}>
          {numbered && <span className="national-rank">{i + 1}</span>}
          <span className="national-entry">
            <span className="national-name">{m.name}</span>
            <span className="national-role">{m.role}</span>
            {m.does && <span className="national-does">{m.does}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

// Everyone here reached office without voters choosing them, which is the
// whole reason this block is separate from the cards above it. Grouped by
// branch so the Cabinet reads as part of the executive rather than a list
// floating on its own.
function NationalBlock({ national }) {
  if (!national) return null;
  const { departments, cabinetRank, leadership, supremeCourt } = national;

  return (
    <div className="national-block">
      <h3 className="national-heading">The rest of the federal government</h3>
      <p className="national-lede">
        Nobody below is elected by voters. They are appointed, confirmed, or chosen by other
        officials, and they still shape a great deal of federal policy.
      </p>

      <div className="branch-group">
        <h4 className="branch-label">Judicial</h4>
        <details className="national-details">
          <summary>
            <span className="caret caret-sm" aria-hidden="true" />
            The Supreme Court <span className="national-count">{supremeCourt.length}</span>
          </summary>
          <p className="national-note">
            Nominated by a President, confirmed by the Senate, and seated for life. They have
            the final say on what federal law and the Constitution mean.
          </p>
          <ul className="national-list">
            {supremeCourt.map((j) => (
              <li key={j.name}>
                <span className="national-entry">
                  <span className="national-name">{j.name}</span>
                  <span className="national-role">
                    {j.role}, seated {j.seated} under {j.nominatedBy}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </details>
        <p className="branch-note">
          The Supreme Court is the top of a much larger system. Roughly 870 other federal
          judges hear the cases that never reach it, and they are appointed for life too.{' '}
          <a href="/democracy#branches">How the courts fit in</a>
        </p>
      </div>

      <div className="branch-group">
        <h4 className="branch-label">Executive</h4>
        <details className="national-details">
          <summary>
            <span className="caret caret-sm" aria-hidden="true" />
            The Cabinet{' '}
            <span className="national-count">{departments.length + cabinetRank.length}</span>
          </summary>
          <p className="national-note">
            Appointed by the President and confirmed by the Senate. The 15 executive
            departments are listed in the order they would succeed to the presidency, which is
            set by law and is why the list is ordered the way it is.
          </p>
          <PersonList people={departments} numbered />
          <p className="national-note national-note-tight">
            Cabinet rank, but outside the departments and outside the line of succession.
          </p>
          <PersonList people={cabinetRank} />
        </details>
      </div>

      <div className="branch-group">
        <h4 className="branch-label">Legislative</h4>
        <details className="national-details">
          <summary>
            <span className="caret caret-sm" aria-hidden="true" />
            Congressional leadership <span className="national-count">{leadership.length}</span>
          </summary>
          <p className="national-note">
            You elect these people to Congress, but their colleagues elect them to these roles.
            They decide what reaches a vote at all, which is why they matter when you are
            trying to be heard.{' '}
            <a href="/democracy#congress">How Congress organizes itself</a>
          </p>
          <PersonList people={leadership} />
        </details>
      </div>

      <p className="branch-crosslink">
        <a href="/democracy#branches">Learn how the three branches fit together →</a>
      </p>
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
    // Normally the home page hands us a query. Landing here directly, from
    // the "My Officials" nav link or a bookmark, falls back to the saved
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

        // Only offer to remember a typed address, since a one-off GPS fix is
        // not something we can re-run later.
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
    national,
    governor,
    legislature,
    stateDistricts,
    stateLegislators,
    elections,
    registrationUrl,
    registrationDeadline,
    note
  } = result;

  // cd is 0 for at-large states and negative when the geocoder could not pin
  // a district, so say less rather than something wrong.
  const districtPhrase =
    cd === 0
      ? `${stateFullName}'s at-large district`
      : cd > 0
        ? `${stateFullName}'s ${ordinal(cd)} district`
        : null;

  const federalLede =
    'Congress writes federal law, including taxes, immigration, the military, and the ' +
    'national budget. It has two chambers. Every state elects two U.S. senators, who ' +
    'represent the whole state and serve six-year terms. The House is divided by population ' +
    'into 435 districts, each electing one representative to a two-year term, so the entire ' +
    'House is up for election every other year.' +
    (districtPhrase ? ` You live in ${districtPhrase}.` : '');

  const stateLede = (() => {
    const base =
      'Your state government decides most of what you actually live with day to day: ' +
      'schools, roads, policing, housing, and health care rules. The governor runs the ' +
      'executive branch.';
    if (!legislature) return base;
    if (legislature.unicameral) {
      return `${base} ${stateFullName}'s ${legislature.name} is unicameral, meaning ${legislature.upperSeats} members in a single chamber with no house of representatives, so you have one legislator here.`;
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
          Every card below carries the contact details each official publishes: office phone,
          website, and a contact form where they offer one. <strong>Save contact</strong> drops
          them into your phone&apos;s address book, so reaching out later takes seconds instead
          of a search.
        </p>

        <MajorSection id="federal" title="Federal" lede={federalLede}>
          <SubSection title="Congress">
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
          </SubSection>

          {national && (
            <SubSection
              title="Executive"
              lede="You do not get your own President the way you get your own representative, but you do vote for this office, so it belongs here rather than below."
            >
              <RepCard rep={national.president} />
              <RepCard rep={national.vicePresident} />
            </SubSection>
          )}

          <NationalBlock national={national} />
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
          lede="Primaries decide who gets on the November ballot, and far fewer people vote in them, which makes each ballot cast there count for more. Here is what is next where you live."
        >
          {registrationDeadline && (
            <div className="deadline-box">
              <h3>{registrationDeadline.headline}</h3>
              <p>{registrationDeadline.detail}</p>
              <p className="deadline-pointer">
                The link to register or check your registration is below the dates.
              </p>
            </div>
          )}

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

          <div className="action-block">
            <SubTitle>Register to Vote</SubTitle>
            <p>
              Registrations lapse when you move and sometimes when you sit out a few elections.
              vote.gov is the federal government&apos;s official portal, and it hands you
              straight to {stateFullName}&apos;s election office.
            </p>
            <a className="cta-link" href={registrationUrl} target="_blank" rel="noopener noreferrer">
              Check or update my registration →
            </a>
          </div>

          <div className="action-block">
            <SubTitle>Election Calendars</SubTitle>
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
