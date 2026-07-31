import { notFound } from 'next/navigation';
import RepCard from '@/components/RepCard';
import { getUpcomingElections } from '@/lib/elections';
import { getFederalReps } from '@/lib/federal';
import { getGovernor } from '@/lib/governors';
import { getLegislature } from '@/lib/legislatures';
import { getRegistrationDeadline } from '@/lib/registration';
import { googleCalendarUrl, SITE_URL, webcalUrl } from '@/lib/site';
import { ALL_STATES, DELEGATE_ONLY, stateFromSlug, stateSlug } from '@/lib/states';

// One page per state and territory, statically generated.
//
// WHY THESE EXIST: /officials answers "who represents me" but needs an address
// and is noindex, so the site had four indexable pages and none of them
// answered the question people actually type into a search box, which is some
// version of "when is the registration deadline in Ohio". Everything here is
// composed from the same lib/ functions /api/lookup already uses. No new data.
//
// Revalidated hourly rather than daily because the registration copy contains
// a live countdown ("you have 12 days left"). The absolute date in the
// headline is what matters and never drifts, but an hour keeps the relative
// count honest across midnight.
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_STATES.map(([, fullName]) => ({ slug: stateSlug(fullName) }));
}

function longDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Everything a page needs, assembled once so generateMetadata and the page
// itself cannot drift apart.
async function loadState(slug) {
  const match = stateFromSlug(slug);
  if (!match) return null;
  const [code, name] = match;

  // District -1 matches no House seat, so this returns senators only. A state
  // page has no way to know which of a state's districts the reader lives in.
  const { senators } = await getFederalReps(code, -1);
  const { elections, registrationUrl, note } = getUpcomingElections(code, name);

  return {
    code,
    name,
    senators,
    elections,
    registrationUrl,
    note,
    governor: getGovernor(code),
    legislature: getLegislature(code),
    deadline: getRegistrationDeadline(code, name, elections)
  };
}

export async function generateMetadata({ params }) {
  const data = await loadState(params.slug);
  if (!data) return {};
  const { name, deadline, elections } = data;

  const next = elections[0];
  const description = [
    deadline?.headline,
    next ? `The next election is the ${next.name} on ${longDate(next.date)}.` : null,
    `See ${name}'s U.S. senators, governor, and legislature, and subscribe to the state election calendar.`
  ]
    .filter(Boolean)
    .join(' ');

  const title = `${name} Voter Registration Deadline and Elections`;
  const url = `/states/${stateSlug(name)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url }
  };
}

export default async function StatePage({ params }) {
  const data = await loadState(params.slug);
  if (!data) notFound();

  const {
    code,
    name,
    senators,
    elections,
    registrationUrl,
    note,
    governor,
    legislature,
    deadline
  } = data;

  const next = elections[0];
  const govRole = code === 'DC' ? 'mayor' : 'governor';

  // Answers stated once and reused for both the visible page and the FAQ
  // schema, so a language model and a reader can never be told different
  // things by the same page.
  const faq = [
    deadline && {
      q: `What is the voter registration deadline in ${name}?`,
      a: `${deadline.headline} ${deadline.detail}`
    },
    next && {
      q: `When is the next election in ${name}?`,
      a: `The next election in ${name} is the ${next.name} on ${longDate(next.date)}.`
    },
    senators.length > 0 && {
      q: `Who are ${name}'s U.S. senators?`,
      a: `${name} is represented in the U.S. Senate by ${senators
        .map((s) => `${s.name} (${s.party})`)
        .join(' and ')}.`
    },
    governor && {
      q: `Who is the ${govRole} of ${name}?`,
      a: `${governor.name} (${governor.party}) is the ${govRole} of ${name}.`
    }
  ].filter(Boolean);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: `${name} elections and officials`,
        url: `${SITE_URL}/states/${stateSlug(name)}`,
        inLanguage: 'en-US',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        about: { '@type': 'AdministrativeArea', name }
      },
      // Google restricts FAQ rich results to government and health sites, so
      // this is not here for a rich snippet. It is here so an assistant asked
      // about this state gets a clean question and answer pair instead of
      // inferring one from the prose.
      {
        '@type': 'FAQPage',
        mainEntity: faq.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a }
        }))
      }
    ]
  };

  return (
    <div className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="officials-page">
        <header className="officials-head">
          <p className="crumb">
            <a href="/states">All states</a>
          </p>
          <h1>{name} elections and officials</h1>
          <p className="matched-address">
            Statewide information for {name}.{' '}
            <a href="/?new=1">Search your address</a> to add your House district and state
            legislators.
          </p>
        </header>

        {deadline && (
          <div className="deadline-box">
            <h2>{deadline.headline}</h2>
            <p>{deadline.detail}</p>
            <p className="deadline-pointer">
              <a href={registrationUrl} target="_blank" rel="noopener noreferrer">
                Register or check your registration at vote.gov →
              </a>
            </p>
          </div>
        )}

        <details className="major" id="elections" open>
          <summary className="major-title">
            <span className="caret" aria-hidden="true" />
            Upcoming elections
          </summary>
          <div className="major-body">
            {elections.length > 0 ? (
              elections.map((el) => (
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
              ))
            ) : (
              <p className="empty-note">
                We do not have a confirmed upcoming election date for {name} yet. Your state
                election office publishes the official calendar.
              </p>
            )}
            <p className="election-note">{note}</p>

            <div className="action-block">
              <h3 className="sub-title">Election Calendars</h3>
              <p>
                Subscribe once and your calendar app fills in every {name} election date, plus a
                reminder a week before Election Day. It updates itself if a date moves.
              </p>
              <div className="cta-row">
                <a className="cta-link cta-link-blue" href={webcalUrl(code)}>
                  Apple Calendar / Outlook
                </a>
                <a
                  className="cta-link cta-link-blue"
                  href={googleCalendarUrl(code)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Calendar
                </a>
              </div>
            </div>
          </div>
        </details>

        <details className="major" id="federal" open>
          <summary className="major-title">
            <span className="caret" aria-hidden="true" />
            U.S. senators
          </summary>
          <div className="major-body">
            {senators.length > 0 ? (
              <>
                <p className="major-lede">
                  Every state elects two U.S. senators, who represent the whole state and serve
                  six-year terms. These two are yours no matter where in {name} you live.
                </p>
                {senators.map((s) => (
                  <RepCard key={s.bioguide} rep={s} />
                ))}
              </>
            ) : (
              <p className="empty-note">
                {DELEGATE_ONLY.has(code)
                  ? `${name} does not elect voting members of Congress. It sends a delegate who serves on committees but cannot vote on final passage.`
                  : `We could not load senators for ${name} right now.`}
              </p>
            )}
            <p className="branch-crosslink">
              <a href="/?new=1">Find your U.S. representative and state legislators →</a>
            </p>
          </div>
        </details>

        <details className="major" id="state" open>
          <summary className="major-title">
            <span className="caret" aria-hidden="true" />
            State government
          </summary>
          <div className="major-body">
            <p className="major-lede">
              Your state government decides most of what you actually live with day to day:
              schools, roads, policing, housing, and health care rules.
              {legislature
                ? legislature.unicameral
                  ? ` ${name}'s ${legislature.name} is unicameral, meaning ${legislature.upperSeats} members in a single chamber with no house of representatives.`
                  : ` ${name}'s ${legislature.name} has ${legislature.upperSeats} senators and ${legislature.lowerSeats} members of the ${legislature.lower}.`
                : ''}
            </p>
            {governor ? (
              <RepCard rep={governor} />
            ) : (
              <p className="empty-note">No executive listed for {name}.</p>
            )}
          </div>
        </details>

        <details className="major" id="faq" open>
          <summary className="major-title">
            <span className="caret" aria-hidden="true" />
            Common questions
          </summary>
          <div className="major-body">
            {faq.map(({ q, a }) => (
              <div className="faq-item" key={q}>
                <h3>{q}</h3>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </details>

        <p className="feedback-note">
          Registration deadlines and primary dates are set by state law and can change.{' '}
          <strong>
            Always confirm with your{' '}
            <a href={registrationUrl} target="_blank" rel="noopener noreferrer">
              official {name} election office
            </a>
          </strong>{' '}
          before you rely on a date. Spot an error?{' '}
          <a
            href={`mailto:xusalldevelopment@gmail.com?subject=XUsDemocracy%3A%20${encodeURIComponent(name)}`}
          >
            Let us know
          </a>{' '}
          and we will fix it.
        </p>
      </div>
    </div>
  );
}
