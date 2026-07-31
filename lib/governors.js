// Current governors, from the National Governors Association roster
// (https://www.nga.org/governors/), which is the governors' own membership
// organization and the closest thing to an authoritative live list.
//
// VERIFIED: 30 July 2026. All 50 names and parties re-checked against the
// NGA roster and every entry matched. NGA serves plain HTML and does not
// block automated requests, so this check is cheap to repeat.
//
// PHOTOS are NGA's own headshots, hotlinked. NGA pairs each image with the
// governor's name in the alt attribute, so these were matched on exact name
// rather than guessed, and all 51 URLs were confirmed to return HTTP 200 on
// 31 July 2026. If NGA ever moves a file, RepCard falls back to a monogram
// on the image error, so a dead link degrades quietly instead of breaking.
//
// nextElection is the year of the next regular gubernatorial election and
// termYears the length of a term. Both are set by state law rather than
// published by NGA. Every state runs 4-year terms except New Hampshire and
// Vermont, which elect governors every 2 years.
//
// WARNING: this is the most perishable data in the project. It is a
// hand-maintained snapshot with no live feed behind it. Re-verify against NGA:
//   1. immediately after the 3 Nov 2026 general election (36 seats are up)
//   2. after Nov 2027 (KY, LA, MS), Nov 2028 (2024 class), Nov 2029 (NJ, VA)
//   3. any time a governor resigns, dies, or is succeeded mid-term
//
// NOT COVERED: DC's mayor and the territorial governors (GU, VI, AS, MP), so
// DC and those territories render no executive card.

const G = (name, party, nextElection, slug, photo, termYears = 4) => ({
  name,
  party,
  nextElection,
  termYears,
  photo: photo || null,
  url: `https://www.nga.org/governors/${slug}/`
});

export const GOVERNORS = {
  AL: G('Kay Ivey', 'Republican', 2026, 'alabama', 'https://www.nga.org/wp-content/uploads/2018/01/Governor-Ivey-2019-Headshot-scaled.jpg'),
  AK: G('Mike Dunleavy', 'Republican', 2026, 'alaska', 'https://www.nga.org/wp-content/uploads/2019/09/Gov_Dunleavy_Sep2023_square-scaled.jpg'),
  AZ: G('Katie Hobbs', 'Democrat', 2026, 'arizona', 'https://www.nga.org/wp-content/uploads/2023/01/governor-katie-hobbs-scaled.jpeg'),
  AR: G('Sarah Huckabee Sanders', 'Republican', 2026, 'arkansas', 'https://www.nga.org/wp-content/uploads/2023/01/Governor-Headshot-sanders-e1756131825437.jpg'),
  CA: G('Gavin Newsom', 'Democrat', 2026, 'california', 'https://www.nga.org/wp-content/uploads/2019/09/1200px-Gavin_Newsom_official_photo_square.jpg'),
  CO: G('Jared Polis', 'Democrat', 2026, 'colorado', 'https://www.nga.org/wp-content/uploads/2019/01/Colorado-Jared-Polis-November-2019.jpg'),
  CT: G('Ned Lamont', 'Democrat', 2026, 'connecticut', 'https://www.nga.org/wp-content/uploads/2019/09/govlamont-scaled.jpg'),
  DE: G('Matt Meyer', 'Democrat', 2028, 'delaware', 'https://www.nga.org/wp-content/uploads/2025/01/matt-meyer_800x600.jpg'),
  FL: G('Ron DeSantis', 'Republican', 2026, 'florida', 'https://www.nga.org/wp-content/uploads/2019/09/Ron_DeSantis_Official_Portrait_113th_Congress.jpg'),
  GA: G('Brian Kemp', 'Republican', 2026, 'georgia', 'https://www.nga.org/wp-content/uploads/2019/09/GovBrianKemp_2024WEB.jpg'),
  HI: G('Josh Green', 'Democrat', 2026, 'hawaii', 'https://www.nga.org/wp-content/uploads/2022/12/Governor_Josh_Green.jpg'),
  ID: G('Brad Little', 'Republican', 2026, 'idaho', 'https://www.nga.org/wp-content/uploads/2019/09/governor_little_square.jpg'),
  IL: G('JB Pritzker', 'Democrat', 2026, 'illinois', 'https://www.nga.org/wp-content/uploads/2019/09/2026-JB-Headshot.jpg'),
  IN: G('Mike Braun', 'Republican', 2028, 'indiana', 'https://www.nga.org/wp-content/uploads/2025/01/GMB-Official-Headshot-scaled.jpg'),
  IA: G('Kim Reynolds', 'Republican', 2026, 'iowa', 'https://www.nga.org/wp-content/uploads/2019/09/Governor-Reynolds-2025-Headshot_square.jpg'),
  KS: G('Laura Kelly', 'Democrat', 2026, 'kansas', 'https://www.nga.org/wp-content/uploads/2019/09/kelly_square.jpg'),
  KY: G('Andy Beshear', 'Democrat', 2027, 'kentucky', 'https://www.nga.org/wp-content/uploads/2019/12/Governor-Beshear_Official-Picture_square-scaled.jpg'),
  LA: G('Jeff Landry', 'Republican', 2027, 'louisiana', 'https://www.nga.org/wp-content/uploads/2024/01/Governor-Landry-Official-Portrait_square-scaled.jpg'),
  ME: G('Janet Mills', 'Democrat', 2026, 'maine', 'https://www.nga.org/wp-content/uploads/2019/09/3218_Gov-Janet-Mills-20230307_square-scaled.jpg'),
  MD: G('Wes Moore', 'Democrat', 2026, 'maryland', 'https://www.nga.org/wp-content/uploads/2023/01/governor-wes-moore-official-portrait_square.jpg'),
  MA: G('Maura Healey', 'Democrat', 2026, 'massachusetts', 'https://www.nga.org/wp-content/uploads/2023/01/Maura_Healey_square.jpg'),
  MI: G('Gretchen Whitmer', 'Democrat', 2026, 'michigan', 'https://www.nga.org/wp-content/uploads/2019/09/GovWhitmerPortMaster_square-scaled.jpg'),
  MN: G('Tim Walz', 'Democrat', 2026, 'minnesota', 'https://www.nga.org/wp-content/uploads/2019/09/Governor-Walz-2024_square.jpg'),
  MS: G('Tate Reeves', 'Republican', 2027, 'mississippi', 'https://www.nga.org/wp-content/uploads/2020/01/headshot-governor-tate-reeves_R_square.jpg'),
  MO: G('Mike Kehoe', 'Republican', 2028, 'missouri', 'https://www.nga.org/wp-content/uploads/2025/01/Governor-Mike-Kehoe_square-scaled.jpg'),
  MT: G('Greg Gianforte', 'Republican', 2028, 'montana', 'https://www.nga.org/wp-content/uploads/2020/11/Montana-Greg-Gianforte-January-2021.jpg'),
  NE: G('Jim Pillen', 'Republican', 2026, 'nebraska', 'https://www.nga.org/wp-content/uploads/2023/01/Governor_Pillen.png'),
  NV: G('Joe Lombardo', 'Republican', 2026, 'nevada', 'https://www.nga.org/wp-content/uploads/2023/01/Governor-Joe-Lombardo_Official-Photo-scaled.jpg'),
  NH: G('Kelly Ayotte', 'Republican', 2026, 'new-hampshire', 'https://www.nga.org/wp-content/uploads/2025/01/ayotte_portrait-for-online.jpg', 2),
  NJ: G('Mikie Sherrill', 'Democrat', 2029, 'new-jersey', 'https://www.nga.org/wp-content/uploads/2026/01/home-gov_official_square.jpg'),
  NM: G('Michelle Lujan Grisham', 'Democrat', 2026, 'new-mexico', 'https://www.nga.org/wp-content/uploads/2019/02/New-Mexico-Michelle-Lujan-Grisham-January-2018.jpg'),
  NY: G('Kathy Hochul', 'Democrat', 2026, 'new-york', 'https://www.nga.org/wp-content/uploads/2021/08/GovernorHochul.jpg'),
  NC: G('Josh Stein', 'Democrat', 2028, 'north-carolina', 'https://www.nga.org/wp-content/uploads/2025/01/Josh-Stein_NC.jpg'),
  ND: G('Kelly Armstrong', 'Republican', 2028, 'north-dakota', 'https://www.nga.org/wp-content/uploads/2024/12/GovernorArmstrong.jpg'),
  OH: G('Mike DeWine', 'Republican', 2026, 'ohio', 'https://www.nga.org/wp-content/uploads/2019/01/Gov-Mike-DeWine.jpg'),
  OK: G('Kevin Stitt', 'Republican', 2026, 'oklahoma', 'https://www.nga.org/wp-content/uploads/2019/06/Oklahoma-Kevin-Stitt-June-2019.jpg'),
  OR: G('Tina Kotek', 'Democrat', 2026, 'oregon', 'https://www.nga.org/wp-content/uploads/2023/01/Governor-Tina-Kotek_Official.jpg'),
  PA: G('Josh Shapiro', 'Democrat', 2026, 'pennsylvania', 'https://www.nga.org/wp-content/uploads/2023/01/JDS_headshot.png'),
  RI: G('Dan McKee', 'Democrat', 2026, 'rhode-island', 'https://www.nga.org/wp-content/uploads/2021/03/Gov-Dan-Mckee-400.png'),
  SC: G('Henry McMaster', 'Republican', 2026, 'south-carolina', 'https://www.nga.org/wp-content/uploads/2019/09/McMaster-Gov.-2025a-full-size_square-scaled.jpg'),
  SD: G('Larry Rhoden', 'Republican', 2026, 'south-dakota', 'https://www.nga.org/wp-content/uploads/2025/01/Governor-Rhoden-square-scaled.jpg'),
  TN: G('Bill Lee', 'Republican', 2026, 'tennessee', 'https://www.nga.org/wp-content/uploads/2019/09/GBL_2022_square.jpg'),
  TX: G('Greg Abbott', 'Republican', 2026, 'texas', 'https://www.nga.org/wp-content/uploads/2018/07/TX_Gov_Greg_Abbott.png'),
  UT: G('Spencer Cox', 'Republican', 2028, 'utah', 'https://www.nga.org/wp-content/uploads/2021/01/Governor_Cox_official_square-scaled.jpg'),
  VT: G('Phil Scott', 'Republican', 2026, 'vermont', 'https://www.nga.org/wp-content/uploads/2019/02/Vermont-Phil-Scott-November-2018.jpg', 2),
  VA: G('Abigail Spanberger', 'Democrat', 2029, 'virginia', 'https://www.nga.org/wp-content/uploads/2026/01/Abigail_Spanberger_2026.jpg'),
  WA: G('Bob Ferguson', 'Democrat', 2028, 'washington', 'https://www.nga.org/wp-content/uploads/2025/01/Bob_Ferguson.jpg'),
  WV: G('Patrick Morrisey', 'Republican', 2028, 'west-virginia', 'https://www.nga.org/wp-content/uploads/2025/01/Patrick-Morrisey-scaled-1.jpg'),
  WI: G('Tony Evers', 'Democrat', 2026, 'wisconsin', 'https://www.nga.org/wp-content/uploads/2019/09/Wisconsin-Tony-Evers-January-2019.jpg'),
  WY: G('Mark Gordon', 'Republican', 2026, 'wyoming', 'https://www.nga.org/wp-content/uploads/2019/01/Wyoming-Mark-Gordon-November-2019.jpg'),
  PR: G('Jenniffer González-Colón', 'New Progressive', 2028, 'puerto-rico', 'https://www.nga.org/wp-content/uploads/2025/01/Governor_Jenniffer_Gonzalez-scaled.jpg')
};

export function getGovernor(state) {
  const g = GOVERNORS[state];
  if (!g) return null;
  return {
    name: g.name,
    party: g.party,
    role: state === 'DC' ? 'Mayor' : 'Governor',
    website: g.url,
    facts: [`${g.termYears}-year term`, `Next election November ${g.nextElection}`],
    phone: null,
    email: null,
    contactForm: null,
    photo: g.photo,
    photoLarge: g.photo,
    level: 'state-executive'
  };
}
