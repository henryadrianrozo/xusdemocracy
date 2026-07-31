// The parts of the federal government you do not elect district by district:
// the President and Vice President, the Cabinet, and the Supreme Court.
//
// These are shown on the officials page but deliberately kept subordinate to
// a person's own senators and representative, because those are the offices
// where an individual constituent actually has standing.
//
// SOURCES, both scraped directly from the government sites that publish them:
//   President, VP, Cabinet  https://www.whitehouse.gov/administration/the-cabinet/
//   Supreme Court           https://www.supremecourt.gov/about/biographies.aspx
//
// VERIFIED: 31 July 2026. Both sites serve plain HTML to a browser user agent,
// so re-checking is one command:
//
//   curl -sL -A 'Mozilla/5.0' https://www.whitehouse.gov/administration/the-cabinet/ \
//     | python3 -c "import sys,re,html;t=re.sub(r'<[^>]+>','\n',sys.stdin.read());print(html.unescape(t))" \
//     | grep -vE '^\s*$'
//
// MAINTENANCE: the Cabinet changes whenever a secretary resigns or is replaced,
// which happens several times a term, so re-check it a few times a year. The
// President and Vice President change every four years (next: January 2029).
// Supreme Court seats change only on death or retirement.
//
// Note on titles: these are recorded exactly as the White House publishes them,
// including "Secretary of War" and the "Acting" prefix on the Attorney General.
// Do not normalize them to what you expect the titles to be.

export const PRESIDENT = {
  name: 'Donald J. Trump',
  role: 'President of the United States',
  website: 'https://www.whitehouse.gov/administration/donald-j-trump/',
  termEnd: '2029-01-20'
};

export const VICE_PRESIDENT = {
  name: 'JD Vance',
  role: 'Vice President of the United States',
  website: 'https://www.whitehouse.gov/administration/jd-vance/',
  termEnd: '2029-01-20'
};

// Ordered by the traditional precedence of the executive departments, then the
// other officials who hold Cabinet rank.
export const CABINET = [
  { name: 'Marco Rubio', role: 'Secretary of State' },
  { name: 'Scott Bessent', role: 'Secretary of the Treasury' },
  { name: 'Pete Hegseth', role: 'Secretary of War' },
  { name: 'Todd Blanche', role: 'Acting Attorney General' },
  { name: 'Doug Burgum', role: 'Secretary of the Interior' },
  { name: 'Brooke Rollins', role: 'Secretary of Agriculture' },
  { name: 'Howard Lutnick', role: 'Secretary of Commerce' },
  { name: 'Keith E. Sonderling', role: 'Secretary of Labor' },
  { name: 'Robert F. Kennedy, Jr.', role: 'Secretary of Health and Human Services' },
  { name: 'Scott Turner', role: 'Secretary of Housing and Urban Development' },
  { name: 'Sean Duffy', role: 'Secretary of Transportation' },
  { name: 'Chris Wright', role: 'Secretary of Energy' },
  { name: 'Linda McMahon', role: 'Secretary of Education' },
  { name: 'Doug Collins', role: 'Secretary of Veterans Affairs' },
  { name: 'Markwayne Mullin', role: 'Secretary of Homeland Security' },
  { name: 'Jamieson Greer', role: 'United States Trade Representative' },
  { name: 'William J. Pulte', role: 'Director of National Intelligence' },
  { name: 'John Ratcliffe', role: 'Director of the Central Intelligence Agency' },
  { name: 'Russ Vought', role: 'Director of the Office of Management and Budget' },
  { name: 'Lee Zeldin', role: 'Administrator of the Environmental Protection Agency' },
  { name: 'Kelly Loeffler', role: 'Administrator of the Small Business Administration' }
];

// Seated in order of seniority, which is how the Court itself lists them.
// `seated` is the year each justice took their seat, as stated by the Court.
export const SUPREME_COURT = [
  { name: 'John G. Roberts, Jr.', role: 'Chief Justice', seated: 2005, nominatedBy: 'George W. Bush' },
  { name: 'Clarence Thomas', role: 'Associate Justice', seated: 1991, nominatedBy: 'George H. W. Bush' },
  { name: 'Samuel A. Alito, Jr.', role: 'Associate Justice', seated: 2006, nominatedBy: 'George W. Bush' },
  { name: 'Sonia Sotomayor', role: 'Associate Justice', seated: 2009, nominatedBy: 'Barack Obama' },
  { name: 'Elena Kagan', role: 'Associate Justice', seated: 2010, nominatedBy: 'Barack Obama' },
  { name: 'Neil M. Gorsuch', role: 'Associate Justice', seated: 2017, nominatedBy: 'Donald J. Trump' },
  { name: 'Brett M. Kavanaugh', role: 'Associate Justice', seated: 2018, nominatedBy: 'Donald J. Trump' },
  { name: 'Amy Coney Barrett', role: 'Associate Justice', seated: 2020, nominatedBy: 'Donald J. Trump' },
  { name: 'Ketanji Brown Jackson', role: 'Associate Justice', seated: 2022, nominatedBy: 'Joseph R. Biden' }
];

export function getNational() {
  return {
    president: PRESIDENT,
    vicePresident: VICE_PRESIDENT,
    cabinet: CABINET,
    supremeCourt: SUPREME_COURT
  };
}
