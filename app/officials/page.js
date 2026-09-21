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

// One step down from a major title. Used as a plain heading for the Elections
// action blocks, which have one thing each under them and nothing to fold.
function SubTitle({ children }) {
  return <h3 className="sub-title">{children}</h3>;
}

// Congress and Executive are the only subheadings carrying a stack of cards, so
// they are the only ones that fold. The affordance is the count pill, never a
// caret. An earlier attempt gave these two their own triangles and it read as
// clutter: a second row of arrows under the Federal arrow, on a page that also
// has the Cabinet and Court dropdowns below. The pill says "there is more here"
// without adding a third arrow to look at, which is what the national block
// already does further down.
function SubSection({ id, title, count, collapsed, onToggle, children }) {
  return (
    <details
      className="sub-section"
      open={!collapsed}
      onToggle={(e) => onToggle(id, !e.currentTarget.open)}
    >
      <summary className="sub-title sub-title-toggle">
        {title} <span className="national-count">{count}</span>
      </summary>
      {children}
    </details>
  );
}

// Opens the Elections section if the reader folded it away, then scrolls to the
// part they asked for. Without the open step the browser would scroll to a
// collapsed summary and appear to do nothing.
function jumpTo(id) {
  const section = document.getElementById('elections');
  if (section) section.open = true;
  // Wait a frame before scrolling. Opening the section changes the height of
  // everything below it, and measuring before that reflow lands sends the
  // scroll to the wrong place, or nowhere at all.
  requestAnimationFrame(() => {
    const target = document.getElementById(id) || section;
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// Whole days from today to an ISO date, counted from midnight so the number does
// not tick down partway through the day.
function daysFrom(iso) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(iso + 'T00:00:00') - today) / 86400000);
}

function plural(n, one, many) {
  return n === 1 ? one : many;
}

// What goes in the blue block on the left of an alert card. A number wherever
// there is a date to count toward, since that is what a reader takes in at a
// glance. States with no date to count (same-day registration, early voting that
// needs an excuse) get a short word instead, marked `word` so it sets smaller.
function earlyBadge(w) {
  if (w.status === 'open' && w.end) {
    const n = daysFrom(w.end);
    return n === 0 ? { big: 'Last', small: 'day' } : { big: n, small: plural(n, 'day left', 'days left') };
  }
  if (w.status === 'upcoming' && w.start && w.chip.fact !== 'Opening now') {
    const n = daysFrom(w.start);
    return { big: n, small: plural(n, 'day to go', 'days to go') };
  }
  const words = { upcoming: 'Now', closed: 'Closed', 'excuse-required': 'Excuse' };
  return { big: words[w.status] || w.chip.fact, word: true };
}

function registrationBadge(d) {
  if (!d.deadlineDate) return { big: d.chip.fact === 'Same day' ? 'Same day' : 'None', word: true };
  if (d.daysLeft < 0) return { big: 'Closed', word: true };
  if (d.daysLeft === 0) return { big: 'Today', word: true };
  return { big: d.daysLeft, small: plural(d.daysLeft, 'day left', 'days left') };
}

// One alert card: a compact election card, the key number on the left and the
// fact on the right. The body is a button that jumps down to the matching block
// in Elections, where the same thing is said in full. The link under it does the
// thing directly, so what a reader came to do never depends on the scroll. They
// are siblings rather than nested because a link inside a button is invalid and
// unreliable for keyboards and screen readers.
function AlertCard({ badge, label, fact, sub, jump, action }) {
  return (
    <div className="alert-card">
      <span className={`alert-badge${badge.word ? ' alert-badge-word' : ''}`} aria-hidden="true">
        <span className="alert-badge-big">{badge.big}</span>
        {badge.small && <span>{badge.small}</span>}
      </span>
      <div className="alert-body">
        <button className="alert-main" onClick={() => jumpTo(jump)}>
          <span className="alert-label">{label}</span>
          <span className="alert-fact">{fact}</span>
          {sub && <span className="alert-sub">{sub}</span>}
        </button>
        {action}
      </div>
    </div>
  );
}

// The three things a reader with an election coming up wants at a glance, at the
// top where they get read: whether they can vote early and where, whether they
// can still register, and how far off the election is. Each card carries a direct
// link and jumps to the block in Elections that says the same thing in full. The
// link labels are the ones those blocks and the state pages use; keep them in step.
function ElectionAlerts({ election, deadline, votingWindow, registrationUrl, pollingPlaceUrl }) {
  // Time-bound on purpose. Out of season this is noise, so it simply is not
  // there. 90 days is about when a general election starts having deadlines a
  // reader can actually act on.
  if (!election || election.daysUntil > 90) return null;

  const dayLabel = new Date(election.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
  const today = election.daysUntil === 0;
  const earlyFirst = votingWindow?.status === 'open';

  const early = votingWindow && (
    <AlertCard
      badge={earlyBadge(votingWindow)}
      label="Early voting"
      fact={votingWindow.chip.fact}
      sub={votingWindow.chip.sub}
      jump="election-early"
      action={
        <a className="alert-action" href={pollingPlaceUrl} target="_blank" rel="noopener noreferrer">
          Find my polling place →
        </a>
      }
    />
  );
  const reg = deadline && (
    <AlertCard
      badge={registrationBadge(deadline)}
      // Only a real cutoff date can be said to "close". Same-day and
      // no-registration states carry a phrase instead of a date, and the
      // days-left count already sits in the badge.
      label={deadline.deadlineDate ? 'Registration closes' : 'Registration'}
      fact={deadline.chip.fact}
      sub={deadline.deadlineDate ? null : deadline.chip.sub}
      jump="election-register"
      action={
        <a className="alert-action" href={registrationUrl} target="_blank" rel="noopener noreferrer">
          Check or register to vote →
        </a>
      }
    />
  );

  return (
    <div className="election-alerts" role="region" aria-label="Your next election">
      {/* In date order. Registration almost always closes before early voting
          opens, so it leads, unless early voting is already under way. */}
      {earlyFirst && early}
      {reg}
      {!earlyFirst && early}

      <AlertCard
        badge={
          today
            ? { big: 'Today', word: true }
            : { big: election.daysUntil, small: plural(election.daysUntil, 'day away', 'days away') }
        }
        label="Election Day"
        fact={dayLabel}
        jump="elections"
        action={
          <button className="alert-action" onClick={() => jumpTo('election-calendars')}>
            Add to my calendar →
          </button>
        }
      />
    </div>
  );
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
  // Which subheadings the reader has folded away, remembered between visits.
  // Safe to read during the first render: that render is the loading note, so
  // the server and the client agree on the markup either way.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const raw = localStorage.getItem('xud-collapsed');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });
  const router = useRouter();

  function toggleSection(id, isCollapsed) {
    setCollapsed((prev) => {
      if (prev.has(id) === isCollapsed) return prev;
      const next = new Set(prev);
      if (isCollapsed) next.add(id);
      else next.delete(id);
      try {
        localStorage.setItem('xud-collapsed', JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

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
    pollingPlaceUrl,
    registrationDeadline,
    votingWindow,
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

  // Kept to about three lines at full width. Long enough to say what the level
  // does, short enough that the cards are what the reader sees first.
  const federalLede =
    'Congress writes federal law, from taxes to the military. Each state elects two U.S. ' +
    'senators to six-year terms, and each of 435 House districts elects one representative ' +
    'every two years.' +
    (districtPhrase ? ` You live in ${districtPhrase}.` : '');

  const stateLede = (() => {
    const base =
      'Your state decides most of what you live with day to day: schools, roads, policing, ' +
      'housing, and health care. The governor runs the executive branch.';
    if (!legislature) return base;
    if (legislature.unicameral) {
      return `${base} ${stateFullName}'s ${legislature.name} is unicameral, with ${legislature.upperSeats} members in one chamber, so you have one legislator here.`;
    }
    return `${base} ${stateFullName}'s ${legislature.name} has ${legislature.upperSeats} senators and ${legislature.lowerSeats} members of the ${legislature.lower}, and you have one of each.`;
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

        <ElectionAlerts
          election={elections[0]}
          deadline={registrationDeadline}
          votingWindow={votingWindow}
          registrationUrl={registrationUrl}
          pollingPlaceUrl={pollingPlaceUrl}
        />

        {askSave && (
          <SavePrompt address={queryAddress} onSaved={saveAddress} onDismiss={declineSave} />
        )}

        <MajorSection id="federal" title="Federal" lede={federalLede}>
          <SubSection
            id="congress"
            title="Congress"
            count={federal.senators.length + (federal.houseRep ? 1 : 0)}
            collapsed={collapsed.has('congress')}
            onToggle={toggleSection}
          >
            {federal.senators.map((s) => (
              <RepCard key={s.bioguide} rep={s} />
            ))}
            {federal.houseRep ? (
              <RepCard rep={federal.houseRep} />
            ) : (
              <p className="empty-note">
                No voting House member for this district. Washington, DC and the U.S.
                territories elect a delegate who serves on committees but cannot vote on final
                passage.
              </p>
            )}
          </SubSection>

          {national && (
            <SubSection
              id="executive"
              title="Executive"
              count={2}
              collapsed={collapsed.has('executive')}
              onToggle={toggleSection}
            >
              <p className="sub-lede">
                You do not get your own President the way you get your own representative, but
                you do vote for this office.
              </p>
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
          lede="A general election fills the seat: every voter picks among the candidates on the ballot. A primary comes earlier and decides who those candidates are. Far fewer people vote in primaries, so each ballot counts for more. Here is what is next where you live."
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

          <div className="action-block" id="election-register">
            <SubTitle>Register to Vote</SubTitle>
            {registrationDeadline && (
              <p className="action-lead">
                <strong>{registrationDeadline.headline}</strong> {registrationDeadline.detail}
              </p>
            )}
            <p>
              Registrations lapse when you move and sometimes when you sit out a few elections.
              vote.gov is the federal government&apos;s official portal, and it hands you
              straight to {stateFullName}&apos;s election office.
            </p>
            <div className="cta-row">
              <a className="cta-link" href={registrationUrl} target="_blank" rel="noopener noreferrer">
                Check or register to vote →
              </a>
            </div>
          </div>

          <div className="action-block" id="election-early">
            <SubTitle>Where and When to Vote</SubTitle>
            {votingWindow && (
              <p className="action-lead">
                <strong>{votingWindow.headline}</strong> {votingWindow.detail}
              </p>
            )}
            <p>
              The polling place link goes to {stateFullName}&apos;s own lookup, where you enter
              your address to see where you vote.
            </p>
            <div className="cta-row">
              <a className="cta-link" href={pollingPlaceUrl} target="_blank" rel="noopener noreferrer">
                Find my polling place →
              </a>
            </div>
          </div>

          <div className="action-block" id="election-calendars">
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
          Something looks off? Wrong rep, bad date, missing info?{' '}
          <a href="mailto:hello@xusall.com?subject=XUsDemocracy%3A%20something%20looks%20off">
            Let us know
          </a>{' '}
          and we&apos;ll fix it.
        </p>
      </div>
    </div>
  );
}
