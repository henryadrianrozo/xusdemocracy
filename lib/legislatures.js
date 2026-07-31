// Chamber names and seat counts for every state legislature.
// Used only for the plain-English explainer on the officials page
// ("Florida's Legislature has 40 senators and 120 representatives").
//
// These numbers are fixed in state constitutions and change very rarely —
// effectively only when a state amends its constitution.
//
// VERIFICATION (July 2026): every state's total was cross-checked against the
// openstates/people dataset, which is scraped from official state legislature
// websites — the same upstream source that feeds our live state-legislator
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
