// Chamber names and seat counts for every state legislature.
// Used only for the plain-English explainer on the officials page
// ("Florida's Legislature has 40 senators and 120 representatives").
//
// These numbers are fixed in state constitutions and change very rarely,
// effectively only when a state amends its constitution.
//
// VERIFICATION (July 2026): every state's total was cross-checked against the
// openstates/people dataset, which is scraped from official state legislature
// websites, the same upstream source that feeds our live state-legislator
// lookup. All 52 matched within normal vacancy margins. Three expected
// deviations: New Hampshire's 400-seat House habitually carries ~10
// vacancies, Maine seats non-voting tribal representatives beyond its 151,
// and Puerto Rico adds at-large seats when one party wins too large a
// majority. NCSL publishes the canonical table but blocks automated
// requests (403), so re-verification is either manual or via openstates.
//
// To re-verify: count files per state under data/<st>/legislature/ in
// https://github.com/openstates/people and compare to upperSeats + lowerSeats.

const L = (name, upper, upperSeats, lower, lowerSeats) => ({
  name,
  upper,
  upperSeats,
  lower,
  lowerSeats
});

export const LEGISLATURES = {
  AL: L('Legislature', 'Senate', 35, 'House of Representatives', 105),
  AK: L('Legislature', 'Senate', 20, 'House of Representatives', 40),
  AZ: L('Legislature', 'Senate', 30, 'House of Representatives', 60),
  AR: L('General Assembly', 'Senate', 35, 'House of Representatives', 100),
  CA: L('State Legislature', 'Senate', 40, 'Assembly', 80),
  CO: L('General Assembly', 'Senate', 35, 'House of Representatives', 65),
  CT: L('General Assembly', 'Senate', 36, 'House of Representatives', 151),
  DE: L('General Assembly', 'Senate', 21, 'House of Representatives', 41),
  FL: L('Legislature', 'Senate', 40, 'House of Representatives', 120),
  GA: L('General Assembly', 'Senate', 56, 'House of Representatives', 180),
  HI: L('Legislature', 'Senate', 25, 'House of Representatives', 51),
  ID: L('Legislature', 'Senate', 35, 'House of Representatives', 70),
  IL: L('General Assembly', 'Senate', 59, 'House of Representatives', 118),
  IN: L('General Assembly', 'Senate', 50, 'House of Representatives', 100),
  IA: L('General Assembly', 'Senate', 50, 'House of Representatives', 100),
  KS: L('Legislature', 'Senate', 40, 'House of Representatives', 125),
  KY: L('General Assembly', 'Senate', 38, 'House of Representatives', 100),
  LA: L('State Legislature', 'Senate', 39, 'House of Representatives', 105),
  ME: L('Legislature', 'Senate', 35, 'House of Representatives', 151),
  MD: L('General Assembly', 'Senate', 47, 'House of Delegates', 141),
  MA: L('General Court', 'Senate', 40, 'House of Representatives', 160),
  MI: L('Legislature', 'Senate', 38, 'House of Representatives', 110),
  MN: L('Legislature', 'Senate', 67, 'House of Representatives', 134),
  MS: L('Legislature', 'Senate', 52, 'House of Representatives', 122),
  MO: L('General Assembly', 'Senate', 34, 'House of Representatives', 163),
  MT: L('Legislature', 'Senate', 50, 'House of Representatives', 100),
  // Nebraska is the only unicameral state legislature; its members are
  // called senators and it has no lower chamber.
  NE: { ...L('Legislature', 'Legislature', 49, null, 0), unicameral: true },
  NV: L('Legislature', 'Senate', 21, 'Assembly', 42),
  NH: L('General Court', 'Senate', 24, 'House of Representatives', 400),
  NJ: L('Legislature', 'Senate', 40, 'General Assembly', 80),
  NM: L('Legislature', 'Senate', 42, 'House of Representatives', 70),
  NY: L('State Legislature', 'Senate', 63, 'Assembly', 150),
  NC: L('General Assembly', 'Senate', 50, 'House of Representatives', 120),
  ND: L('Legislative Assembly', 'Senate', 47, 'House of Representatives', 94),
  OH: L('General Assembly', 'Senate', 33, 'House of Representatives', 99),
  OK: L('Legislature', 'Senate', 48, 'House of Representatives', 101),
  OR: L('Legislative Assembly', 'Senate', 30, 'House of Representatives', 60),
  PA: L('General Assembly', 'Senate', 50, 'House of Representatives', 203),
  RI: L('General Assembly', 'Senate', 38, 'House of Representatives', 75),
  SC: L('General Assembly', 'Senate', 46, 'House of Representatives', 124),
  SD: L('Legislature', 'Senate', 35, 'House of Representatives', 70),
  TN: L('General Assembly', 'Senate', 33, 'House of Representatives', 99),
  TX: L('Legislature', 'Senate', 31, 'House of Representatives', 150),
  UT: L('State Legislature', 'Senate', 29, 'House of Representatives', 75),
  VT: L('General Assembly', 'Senate', 30, 'House of Representatives', 150),
  VA: L('General Assembly', 'Senate', 40, 'House of Delegates', 100),
  WA: L('State Legislature', 'Senate', 49, 'House of Representatives', 98),
  WV: L('Legislature', 'Senate', 34, 'House of Delegates', 100),
  WI: L('State Legislature', 'Senate', 33, 'Assembly', 99),
  WY: L('Legislature', 'Senate', 31, 'House of Representatives', 62),
  // DC and PR have no state legislature; these are their equivalents.
  DC: { ...L('Council of the District of Columbia', 'Council', 13, null, 0), unicameral: true },
  PR: L('Legislative Assembly', 'Senate', 27, 'House of Representatives', 51)
};

export function getLegislature(state) {
  return LEGISLATURES[state] || null;
}

// ---------------------------------------------------------------------------
// Election cycles, used for the "4-year term / Next election November 2027"
// facts on state legislator cards.
//
// A cycle is one of:
//   { term, first, every }   the whole chamber is elected in `first` and every
//                            `every` years after
//   { term, staggered: true } only part of the chamber is up each cycle, and we
//                            do not know which seats belong to this voter, so we
//                            state the term and no year
//   { term }                 the term is known but the next year is not confirmed
// A missing chamber means we say nothing at all.
//
// SOURCE (verified 21 September 2026): the per-state tables of seats up, seats
// total and term length in "2026 United States state legislative elections" and
// "2024 United States state legislative elections" on Wikipedia, which cite
// Ballotpedia's "State legislative elections" pages as their source.
// Ballotpedia itself sits behind an AWS bot challenge that curl, WebFetch and
// the Wayback Machine could not pass, so the check went through those tables and
// the 2027 elections page instead of the Ballotpedia chamber pages.
//
//   Whole chamber, 2026:   every seat up in 2026 (seats up equals total).
//   Whole chamber, 2027:   0 seats up in 2026 and the 2027 elections page lists
//                          LA, MS, NJ and VA (Kentucky's 2027 races are not
//                          legislative).
//   Whole chamber, 2028:   KS, NM and SC senates had every seat up in 2024 on a
//                          4-year term and none in 2026.
//   Staggered:             about half of the seats up in 2026, 4-year term.
//
// DELIBERATELY EMPTY: the upper chambers of AR, DE, FL, HI, IL, MN, NJ and TX use
// a 2-4-4 term system, so the length of a senator's term depends on which
// election put them there. A fixed "4-year term" would sometimes be wrong, so
// they get no facts. PR is term-only because its 2028 year was not confirmed.
//
// This rots on a constitutional change, a legislature switching term lengths, or
// the 2-4-4 sequence shifting after redistricting. Recheck after each census.

const whole = (term, first) => ({ term, first, every: term });
const staggered = (term) => ({ term, staggered: true });

const EVEN_YEAR_HOUSE = whole(2, 2026);

const UPPER = {
  // 2-year terms, whole chamber, even years.
  ...Object.fromEntries(
    ['AZ', 'CT', 'GA', 'ID', 'ME', 'MA', 'NH', 'NY', 'NC', 'RI', 'SD', 'VT'].map((st) => [
      st,
      whole(2, 2026)
    ])
  ),
  // 4-year terms, whole chamber.
  ...Object.fromEntries(['AL', 'MD', 'MI'].map((st) => [st, whole(4, 2026)])),
  ...Object.fromEntries(['LA', 'MS', 'VA'].map((st) => [st, whole(4, 2027)])),
  ...Object.fromEntries(['KS', 'NM', 'SC'].map((st) => [st, whole(4, 2028)])),
  // 4-year terms, about half the chamber up each cycle.
  ...Object.fromEntries(
    [
      'AK', 'CA', 'CO', 'IN', 'IA', 'KY', 'MO', 'MT', 'NE', 'NV', 'ND', 'OH', 'OK',
      'OR', 'PA', 'TN', 'UT', 'WA', 'WV', 'WI', 'WY', 'DC'
    ].map((st) => [st, staggered(4)])
  ),
  PR: { term: 4 }
};

const LOWER = {
  // Every state not listed here elects its whole House in even years to a
  // 2-year term. See lowerCycle().
  AL: whole(4, 2026),
  MD: whole(4, 2026),
  LA: whole(4, 2027),
  MS: whole(4, 2027),
  NJ: whole(2, 2027),
  VA: whole(2, 2027),
  ND: staggered(4),
  PR: { term: 4 }
};

function lowerCycle(state) {
  const leg = LEGISLATURES[state];
  // Nebraska and DC have no lower chamber.
  if (!leg || !leg.lower) return null;
  return LOWER[state] || EVEN_YEAR_HOUSE;
}

export function electionCycle(state, which) {
  return which === 'lower' ? lowerCycle(state) : UPPER[state] || null;
}

// The general election is the Tuesday after the first Monday in November.
export function generalElectionDate(year) {
  const dow = new Date(year, 10, 1).getDay(); // 0 is Sunday
  const firstMonday = 1 + ((8 - dow) % 7);
  return new Date(year, 10, firstMonday + 1);
}

// The next year, counting today, in which a whole-chamber cycle holds its
// election. Independent of the site's election calendar so it keeps working
// after November 2026: an even-year House reads 2026 until 3 November, then 2028.
export function nextElectionYear({ first, every }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let year = first;
  while (generalElectionDate(year) < today) year += every;
  return year;
}

// The facts shown on a state legislator card: `which` is 'upper' or 'lower'.
// Returns [] when we would be guessing.
export function legislatorFacts(state, which) {
  const cycle = electionCycle(state, which);
  if (!cycle) return [];
  const facts = [`${cycle.term}-year term`];
  if (cycle.first != null && cycle.every) {
    facts.push(`Next election November ${nextElectionYear(cycle)}`);
  }
  return facts;
}
