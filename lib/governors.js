// Current governors (DC: mayor). Compiled July 2026 from the National
// Governors Association roster: https://www.nga.org/governors/
// nextElection = year of the next regular gubernatorial election.
// NOTE: static data — update after each gubernatorial election cycle
// (most seats: Nov 2026; KY/LA/MS: 2027; 2024-class: 2028; NJ/VA: 2029).

const G = (name, party, nextElection, slug) => ({
  name,
  party,
  nextElection,
  url: `https://www.nga.org/governors/${slug}/`
});

export const GOVERNORS = {
  AL: G('Kay Ivey', 'Republican', 2026, 'alabama'),
  AK: G('Mike Dunleavy', 'Republican', 2026, 'alaska'),
  AZ: G('Katie Hobbs', 'Democrat', 2026, 'arizona'),
  AR: G('Sarah Huckabee Sanders', 'Republican', 2026, 'arkansas'),
  CA: G('Gavin Newsom', 'Democrat', 2026, 'california'),
  CO: G('Jared Polis', 'Democrat', 2026, 'colorado'),
  CT: G('Ned Lamont', 'Democrat', 2026, 'connecticut'),
  DE: G('Matt Meyer', 'Democrat', 2028, 'delaware'),
  FL: G('Ron DeSantis', 'Republican', 2026, 'florida'),
  GA: G('Brian Kemp', 'Republican', 2026, 'georgia'),
  HI: G('Josh Green', 'Democrat', 2026, 'hawaii'),
  ID: G('Brad Little', 'Republican', 2026, 'idaho'),
  IL: G('JB Pritzker', 'Democrat', 2026, 'illinois'),
  IN: G('Mike Braun', 'Republican', 2028, 'indiana'),
  IA: G('Kim Reynolds', 'Republican', 2026, 'iowa'),
  KS: G('Laura Kelly', 'Democrat', 2026, 'kansas'),
  KY: G('Andy Beshear', 'Democrat', 2027, 'kentucky'),
  LA: G('Jeff Landry', 'Republican', 2027, 'louisiana'),
  ME: G('Janet Mills', 'Democrat', 2026, 'maine'),
  MD: G('Wes Moore', 'Democrat', 2026, 'maryland'),
  MA: G('Maura Healey', 'Democrat', 2026, 'massachusetts'),
  MI: G('Gretchen Whitmer', 'Democrat', 2026, 'michigan'),
  MN: G('Tim Walz', 'Democrat', 2026, 'minnesota'),
  MS: G('Tate Reeves', 'Republican', 2027, 'mississippi'),
  MO: G('Mike Kehoe', 'Republican', 2028, 'missouri'),
  MT: G('Greg Gianforte', 'Republican', 2028, 'montana'),
  NE: G('Jim Pillen', 'Republican', 2026, 'nebraska'),
  NV: G('Joe Lombardo', 'Republican', 2026, 'nevada'),
  NH: G('Kelly Ayotte', 'Republican', 2026, 'new-hampshire'),
  NJ: G('Mikie Sherrill', 'Democrat', 2029, 'new-jersey'),
  NM: G('Michelle Lujan Grisham', 'Democrat', 2026, 'new-mexico'),
  NY: G('Kathy Hochul', 'Democrat', 2026, 'new-york'),
  NC: G('Josh Stein', 'Democrat', 2028, 'north-carolina'),
  ND: G('Kelly Armstrong', 'Republican', 2028, 'north-dakota'),
  OH: G('Mike DeWine', 'Republican', 2026, 'ohio'),
  OK: G('Kevin Stitt', 'Republican', 2026, 'oklahoma'),
  OR: G('Tina Kotek', 'Democrat', 2026, 'oregon'),
  PA: G('Josh Shapiro', 'Democrat', 2026, 'pennsylvania'),
  RI: G('Dan McKee', 'Democrat', 2026, 'rhode-island'),
  SC: G('Henry McMaster', 'Republican', 2026, 'south-carolina'),
  SD: G('Larry Rhoden', 'Republican', 2026, 'south-dakota'),
  TN: G('Bill Lee', 'Republican', 2026, 'tennessee'),
  TX: G('Greg Abbott', 'Republican', 2026, 'texas'),
  UT: G('Spencer Cox', 'Republican', 2028, 'utah'),
  VT: G('Phil Scott', 'Republican', 2026, 'vermont'),
  VA: G('Abigail Spanberger', 'Democrat', 2029, 'virginia'),
  WA: G('Bob Ferguson', 'Democrat', 2028, 'washington'),
  WV: G('Patrick Morrisey', 'Republican', 2028, 'west-virginia'),
  WI: G('Tony Evers', 'Democrat', 2026, 'wisconsin'),
  WY: G('Mark Gordon', 'Republican', 2026, 'wyoming'),
  PR: G('Jenniffer González-Colón', 'New Progressive', 2028, 'puerto-rico')
};

export function getGovernor(state) {
  const g = GOVERNORS[state];
  if (!g) return null;
  return {
    name: g.name,
    party: g.party,
    role: state === 'DC' ? 'Mayor' : 'Governor',
    website: g.url,
    extra: `Next election: November ${g.nextElection}`,
    phone: null,
    email: null,
    contactForm: null,
    photo: null,
    level: 'state-executive'
  };
}
