import { congressPhoto, congressPhotoLarge } from './federal';

// The federal government beyond your own senators and representative.
//
// Organised by branch, and split on a line that matters: whether voters
// elected the person. You elect the President and Vice President nationally,
// so they render as ordinary cards alongside your members of Congress. You do
// not elect a Cabinet secretary, a judge, or a party leader, so those sit in a
// separate block that says so.
//
// SOURCES, each scraped directly from the body that publishes it:
//   President, VP, Cabinet   https://www.whitehouse.gov/administration/the-cabinet/
//   Supreme Court            https://www.supremecourt.gov/about/biographies.aspx
//   House leadership         https://www.house.gov/leadership
//
// VERIFIED: 31 July 2026. Those three serve plain HTML to a browser user
// agent, so re-checking is one command:
//
//   curl -sL -A 'Mozilla/5.0' https://www.whitehouse.gov/administration/the-cabinet/ \
//     | python3 -c "import sys,re,html;print(html.unescape(re.sub(r'<[^>]+>','\n',sys.stdin.read())))" \
//     | grep -vE '^\s*$'
//
// ⚠️ SENATE LEADERSHIP IS THE ONE WEAK SPOT. senate.gov and congress.gov both
// return 403 to automated requests, the same as NCSL and vote.gov, so those
// three names came from secondary sources rather than the Senate itself.
// Confirm them by hand at https://www.senate.gov/senators/leadership.htm.
//
// MAINTENANCE:
//   Cabinet             changes several times a term as secretaries turn over.
//   Congressional leadership  re-elected every Congress, so January 2027.
//   President and VP    January 2029.
//   Supreme Court       only on death or retirement.
//
// Titles are recorded exactly as published, including "Secretary of War" and
// the Acting prefix on the Attorney General. Do not normalise them to what you
// expect them to be.

const WH = 'https://www.whitehouse.gov';

// Justice portraits: https://www.supremecourt.gov/about/justice_pictures.
// The Court pairs each image with the justice's name in the alt and title
// attributes, the same verification standard used for the NGA governor
// photos in lib/governors.js. All nine confirmed HTTP 200 on 2026-09-22.
// Two traps: the Kavanaugh filename has a literal space (kept escaped below),
// and the same page also serves portraits of the retired Kennedy and Breyer,
// which must not be pulled in here.
const SC = 'https://www.supremecourt.gov/about/justice_pictures';

// Shaped for RepCard, so the President and Vice President get the same
// treatment as any other official the reader actually voted for.
export const PRESIDENT = {
  name: 'Donald J. Trump',
  party: 'Republican',
  role: 'President of the United States',
  website: `${WH}/administration/donald-j-trump/`,
  contactForm: `${WH}/contact/`,
  phone: null,
  email: null,
  // The original is a 3.5 MB PNG, which is absurd for an 88px avatar.
  // whitehouse.gov runs WordPress, so ?w= returns a resized copy: 21 KB at
  // 400px. Full resolution is kept for the enlarged portrait view.
  photo: `${WH}/wp-content/uploads/2025/06/President-Donald-Trump-Official-Presidential-Portrait.png?w=400`,
  photoLarge: `${WH}/wp-content/uploads/2025/06/President-Donald-Trump-Official-Presidential-Portrait.png?w=1000`,
  facts: [
    '45th and 47th President',
    'Took office January 2025',
    'Elected 2024',
    'Term ends January 2029'
  ],
  // The 22nd Amendment bars anyone from being elected President more than
  // twice. State the rule and the count, and leave it there.
  note: 'Elected to the presidency twice, in 2016 and 2024. The 22nd Amendment bars anyone from being elected President more than twice.',
  level: 'federal-executive'
};

export const VICE_PRESIDENT = {
  name: 'JD Vance',
  party: 'Republican',
  role: 'Vice President of the United States',
  website: `${WH}/administration/jd-vance/`,
  contactForm: `${WH}/contact/`,
  phone: null,
  email: null,
  // No official portrait was identifiable on the VP page, so this falls back
  // to a monogram rather than guessing at a shared image.
  photo: null,
  photoLarge: null,
  facts: ['Took office January 2025', 'Elected 2024', 'Term ends January 2029'],
  note: 'Presides over the Senate and casts the deciding vote there on a tie. No term limit applies to the vice presidency.',
  level: 'federal-executive'
};

// `website` is the department/agency's own official homepage, linked from
// the title (not the person's name -- see the comment on PersonList's
// rendering in app/officials/page.js for why only the title gets a link).
// These are the 21 top-level .gov domains themselves, not a bio subpage:
// stable, unambiguous, and about as low-risk a URL as exists on the federal
// web. Checked reachable from this machine everywhere the network allowed a
// direct request; several (state.gov, defense.gov, several others) block
// automated requests the same way NCSL and vote.gov already do elsewhere in
// this codebase, so those are asserted from general knowledge of a domain
// that has not moved in decades, the same evidentiary standard this file
// already applies to governors' NGA links.
const D = (name, role, does, website) => ({ name, role, does, website });

// The 15 executive departments, in the statutory order of presidential
// succession. That order is the reason this list is not arbitrary, and it is
// worth showing. Succession attaches to the office, not the person: acting
// officials are generally not eligible.
export const DEPARTMENTS = [
  D('Marco Rubio', 'Secretary of State', 'Foreign policy, embassies, treaties, and passports.', 'https://www.state.gov/'),
  D('Scott Bessent', 'Secretary of the Treasury', 'Federal finances, tax collection, and the currency.', 'https://home.treasury.gov/'),
  D('Pete Hegseth', 'Secretary of War', 'The armed forces and military operations.', 'https://www.defense.gov/'),
  D('Todd Blanche', 'Acting Attorney General', 'Federal law enforcement and prosecutions.', 'https://www.justice.gov/'),
  D('Doug Burgum', 'Secretary of the Interior', 'Public lands, national parks, and tribal affairs.', 'https://www.doi.gov/'),
  D('Brooke Rollins', 'Secretary of Agriculture', 'Farming, food safety, and nutrition programs.', 'https://www.usda.gov/'),
  D('Howard Lutnick', 'Secretary of Commerce', 'Trade, business, the census, and weather services.', 'https://www.commerce.gov/'),
  D('Keith E. Sonderling', 'Secretary of Labor', 'Workplace rules, wages, and unemployment data.', 'https://www.dol.gov/'),
  D('Robert F. Kennedy, Jr.', 'Secretary of Health and Human Services', 'Public health, Medicare, Medicaid, and the FDA.', 'https://www.hhs.gov/'),
  D('Scott Turner', 'Secretary of Housing and Urban Development', 'Housing programs and fair housing law.', 'https://www.hud.gov/'),
  D('Sean Duffy', 'Secretary of Transportation', 'Highways, aviation, rail, and transit safety.', 'https://www.transportation.gov/'),
  D('Chris Wright', 'Secretary of Energy', 'Energy policy, research labs, and the nuclear stockpile.', 'https://www.energy.gov/'),
  D('Linda McMahon', 'Secretary of Education', 'Federal education funding and student loans.', 'https://www.ed.gov/'),
  D('Doug Collins', 'Secretary of Veterans Affairs', 'Veterans health care and benefits.', 'https://www.va.gov/'),
  D('Markwayne Mullin', 'Secretary of Homeland Security', 'Borders, immigration enforcement, and disaster response.', 'https://www.dhs.gov/')
];

// Cabinet rank, but outside the executive departments and outside the line of
// succession.
export const CABINET_RANK = [
  D('Jamieson Greer', 'United States Trade Representative', 'Negotiates trade agreements with other countries.', 'https://ustr.gov/'),
  D('William J. Pulte', 'Director of National Intelligence', 'Coordinates the intelligence agencies.', 'https://www.dni.gov/'),
  D('John Ratcliffe', 'Director of the Central Intelligence Agency', 'Foreign intelligence collection and analysis.', 'https://www.cia.gov/'),
  D('Russ Vought', 'Director of the Office of Management and Budget', "Writes the President's budget and reviews regulations.", 'https://www.whitehouse.gov/omb/'),
  D('Lee Zeldin', 'Administrator of the Environmental Protection Agency', 'Air, water, and pollution rules.', 'https://www.epa.gov/'),
  D('Kelly Loeffler', 'Administrator of the Small Business Administration', 'Loans and support for small businesses.', 'https://www.sba.gov/')
];

export const CABINET = [...DEPARTMENTS, ...CABINET_RANK];

// Members of Congress elected to these roles by their colleagues, not by
// voters. They decide what reaches a vote at all, which is why they belong on
// the page even though nobody casts a ballot for them.
//
// All eight are sitting members, so they already have portraits in the
// @unitedstates image set that lib/federal.js uses; congressPhoto() builds
// the same URL from the bioguide ID rather than hand-typing a second one.
// Bioguide IDs and party resolved against legislators-current.json on
// 2026-09-22. That lookup happens to be a second source for Grassley, Thune
// and Schumer, the three names CLAUDE.md flags as this roster's weak spot
// because senate.gov returns 403 to automated requests, but it is not a
// primary source, so the "confirm by hand" note there still stands.
const L = (name, role, chamber, does, bioguide, party) => ({
  name,
  role,
  chamber,
  does,
  party,
  photo: congressPhoto(bioguide),
  photoLarge: congressPhotoLarge(bioguide)
});

export const CONGRESSIONAL_LEADERSHIP = [
  L('Mike Johnson', 'Speaker of the House', 'House', 'Elected by the whole House. Controls the floor schedule and is second in the line of presidential succession.', 'J000299', 'Republican'),
  L('Steve Scalise', 'House Majority Leader', 'House', 'Runs the majority party’s floor strategy.', 'S001176', 'Republican'),
  L('Tom Emmer', 'House Majority Whip', 'House', 'Counts and gathers votes before a bill reaches the floor.', 'E000294', 'Republican'),
  L('Hakeem Jeffries', 'House Democratic Leader', 'House', 'Leads the minority party in the House.', 'J000294', 'Democrat'),
  L('Katherine Clark', 'House Democratic Whip', 'House', 'Counts votes for the minority party.', 'C001101', 'Democrat'),
  L('Chuck Grassley', 'President pro tempore of the Senate', 'Senate', 'By tradition the senior member of the majority party. Third in the line of presidential succession.', 'G000386', 'Republican'),
  L('John Thune', 'Senate Majority Leader', 'Senate', 'Sets what the Senate votes on and when.', 'T000250', 'Republican'),
  L('Chuck Schumer', 'Senate Minority Leader', 'Senate', 'Leads the minority party in the Senate.', 'S000148', 'Democrat')
];

// Seated in order of seniority, which is how the Court lists them.
// `seated` is the year each justice took their seat, as stated by the Court.
// Justices get no `party`, not even inferred from `nominatedBy`: the site's
// party ring is reserved for elected office, and a justice's photo renders
// with the neutral --ind color instead.
export const SUPREME_COURT = [
  { name: 'John G. Roberts, Jr.', role: 'Chief Justice', seated: 2005, nominatedBy: 'George W. Bush', photo: `${SC}/Roberts_8807-16_Crop.jpg`, photoLarge: `${SC}/Roberts_8807-16_Crop.jpg` },
  { name: 'Clarence Thomas', role: 'Associate Justice', seated: 1991, nominatedBy: 'George H. W. Bush', photo: `${SC}/Thomas_9366-024_Crop.jpg`, photoLarge: `${SC}/Thomas_9366-024_Crop.jpg` },
  { name: 'Samuel A. Alito, Jr.', role: 'Associate Justice', seated: 2006, nominatedBy: 'George W. Bush', photo: `${SC}/Alito_9264-001-Crop.jpg`, photoLarge: `${SC}/Alito_9264-001-Crop.jpg` },
  { name: 'Sonia Sotomayor', role: 'Associate Justice', seated: 2009, nominatedBy: 'Barack Obama', photo: `${SC}/Sotomayor_Official_2025.jpg`, photoLarge: `${SC}/Sotomayor_Official_2025.jpg` },
  { name: 'Elena Kagan', role: 'Associate Justice', seated: 2010, nominatedBy: 'Barack Obama', photo: `${SC}/Kagan_10713-017-Crop.jpg`, photoLarge: `${SC}/Kagan_10713-017-Crop.jpg` },
  { name: 'Neil M. Gorsuch', role: 'Associate Justice', seated: 2017, nominatedBy: 'Donald J. Trump', photo: `${SC}/Gorsuch2.jpg`, photoLarge: `${SC}/Gorsuch2.jpg` },
  { name: 'Brett M. Kavanaugh', role: 'Associate Justice', seated: 2018, nominatedBy: 'Donald J. Trump', photo: `${SC}/Kavanaugh%2012221_005_crop.jpg`, photoLarge: `${SC}/Kavanaugh%2012221_005_crop.jpg` },
  { name: 'Amy Coney Barrett', role: 'Associate Justice', seated: 2020, nominatedBy: 'Donald J. Trump', photo: `${SC}/Barrett_102535_w151.jpg`, photoLarge: `${SC}/Barrett_102535_w151.jpg` },
  { name: 'Ketanji Brown Jackson', role: 'Associate Justice', seated: 2022, nominatedBy: 'Joseph R. Biden', photo: `${SC}/KBJackson3.jpg`, photoLarge: `${SC}/KBJackson3.jpg` }
];

export function getNational() {
  return {
    president: PRESIDENT,
    vicePresident: VICE_PRESIDENT,
    departments: DEPARTMENTS,
    cabinetRank: CABINET_RANK,
    leadership: CONGRESSIONAL_LEADERSHIP,
    supremeCourt: SUPREME_COURT
  };
}
