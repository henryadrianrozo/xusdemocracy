// Federal legislators from the public-domain @unitedstates project.
// https://github.com/unitedstates/congress-legislators
// Fetched server-side and cached in memory for 24h. No API key needed.

const DATA_URL = 'https://unitedstates.github.io/congress-legislators/legislators-current.json';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let cache = { data: null, fetchedAt: 0 };

async function getLegislators() {
  const now = Date.now();
  if (cache.data && now - cache.fetchedAt < CACHE_TTL_MS) return cache.data;
  const res = await fetch(DATA_URL, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('Could not load legislator data');
  const data = await res.json();
  cache = { data, fetchedAt: now };
  return data;
}

function currentTerm(legislator) {
  const terms = legislator.terms || [];
  return terms[terms.length - 1];
}

// Start of the member's current unbroken run. Walks backwards while each term
// picks up where the last one left off, so a member who served, lost, and came
// back later shows the year they came back.
//
// `sameChamberOnly` stops the walk at a chamber change. Without it a senator
// who spent decades in the House reads as having been a senator that whole
// time, which is the kind of small wrongness that erodes trust in the page.
function serviceStart(terms, sameChamberOnly = false) {
  const last = terms[terms.length - 1];
  let start = last?.start;
  for (let i = terms.length - 1; i > 0; i--) {
    const prev = terms[i - 1];
    if (sameChamberOnly && prev.type !== last.type) break;
    const gapDays = (new Date(terms[i].start) - new Date(prev.end)) / 86400000;
    if (gapDays > 40) break;
    start = prev.start;
  }
  return start;
}

// How this person got their current seat. Most arrive by regular election the
// November before the term starts, but senators can be appointed to fill a
// vacancy or win a special election, and saying "last elected" about an
// appointee would be plainly wrong.
function arrivalFact(term) {
  const startYear = Number(term.start?.slice(0, 4));
  if (!startYear) return null;
  if (term.how === 'appointment') return `Appointed ${startYear}`;
  if (term.how === 'special-election') return `Won a special election in ${startYear}`;
  return `Last elected ${startYear - 1}`;
}

function toCard(legislator, term, terms) {
  const bioguide = legislator.id?.bioguide;
  const since = serviceStart(terms);
  const sinceYear = since ? Number(since.slice(0, 4)) : null;
  const chamberSince = serviceStart(terms, true);
  const chamberYear = chamberSince ? Number(chamberSince.slice(0, 4)) : null;
  const seat = term.type === 'sen' ? 'Senator' : 'Representative';
  // Someone who switched chambers gets both facts: how long in this seat, and
  // how long in Congress overall. Everyone else gets the single line.
  const tenure =
    chamberYear && sinceYear && chamberYear !== sinceYear
      ? [`${seat} since ${chamberYear}`, `In Congress since ${sinceYear}`]
      : [sinceYear ? `In office since ${sinceYear}` : null];
  const endLabel = term.end
    ? `Term ends ${new Date(term.end + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })}`
    : null;
  return {
    name: legislator.name?.official_full ||
      `${legislator.name?.first || ''} ${legislator.name?.last || ''}`.trim(),
    party: term.party || null,
    role: term.type === 'sen'
      ? `U.S. Senator${term.state_rank ? ` (${term.state_rank})` : ''}`
      : term.district === 0 && ['DC', 'PR', 'GU', 'VI', 'AS', 'MP'].includes(term.state)
        ? 'Delegate to the U.S. House'
        : `U.S. Representative, District ${term.district === 0 ? 'At-Large' : term.district}`,
    state: term.state,
    district: term.type === 'rep' ? term.district : null,
    phone: term.phone || null,
    website: term.url || null,
    contactForm: term.contact_form || null,
    termEnd: term.end || null,
    servingSince: sinceYear,
    facts: [...tenure, arrivalFact(term), endLabel].filter(Boolean),
    photo: bioguide
      ? `https://unitedstates.github.io/images/congress/225x275/${bioguide}.jpg`
      : null,
    // Full-resolution portrait, used when the photo is opened.
    photoLarge: bioguide
      ? `https://unitedstates.github.io/images/congress/original/${bioguide}.jpg`
      : null,
    bioguide,
    level: 'federal'
  };
}

export async function getFederalReps(state, district) {
  const legislators = await getLegislators();
  const senators = [];
  let houseRep = null;

  for (const leg of legislators) {
    const terms = leg.terms || [];
    const term = currentTerm(leg);
    if (!term || term.state !== state) continue;
    if (term.type === 'sen') senators.push(toCard(leg, term, terms));
    if (term.type === 'rep' && term.district === district) houseRep = toCard(leg, term, terms);
  }

  senators.sort((a, b) => (a.role > b.role ? 1 : -1));
  return { senators, houseRep };
}
