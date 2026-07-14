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

function toCard(legislator, term) {
  const bioguide = legislator.id?.bioguide;
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
    photo: bioguide
      ? `https://unitedstates.github.io/images/congress/225x275/${bioguide}.jpg`
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
    const term = currentTerm(leg);
    if (!term || term.state !== state) continue;
    if (term.type === 'sen') senators.push(toCard(leg, term));
    if (term.type === 'rep' && term.district === district) houseRep = toCard(leg, term);
  }

  senators.sort((a, b) => (a.role > b.role ? 1 : -1));
  return { senators, houseRep };
}
