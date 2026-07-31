import { SITE_URL } from '@/lib/site';
import { ALL_STATES, stateSlug } from '@/lib/states';

// Served at /llms.txt, following the llmstxt.org convention: a plain-text map
// of the site for language models, so an assistant answering "who is my
// senator" or "when is Ohio's registration deadline" can find the right page
// without parsing our HTML.
//
// HONEST CAVEAT: no major AI company has committed to reading llms.txt. It is
// a proposed convention, not a standard. It is here because it costs one small
// route and is well formed if adoption arrives. The work that actually matters
// for AI visibility is the JSON-LD in the page heads and clean semantic HTML,
// both of which this site has.
export const dynamic = 'force-static';

function body() {
  const stateLinks = ALL_STATES.map(
    ([code, name]) => `- [${name}](${SITE_URL}/states/${stateSlug(name)}): ${name} (${code}) voter registration deadline, upcoming elections, US senators, and governor.`
  ).join('\n');

  return `# XUsDemocracy

> A free, nonpartisan tool that tells any American who represents them at every level of government, when their next election is, and when their voter registration deadline falls. No account, no ads, no tracking. The address you enter is used for one lookup and is never stored or logged.

Run by XUsAll. Corrections go to xusalldevelopment@gmail.com.

## Core pages

- [Home](${SITE_URL}/): Address lookup. Enter a street address and get your officials and elections.
- [How our democracy works](${SITE_URL}/democracy): Civic education. What a constitutional republic is, the three branches, how Congress organizes itself, how elections are actually administered and secured, why turnout matters, peer-reviewed evidence on outcomes under democratic government, and the history of expanding suffrage. Every factual claim links to its source.
- [State pages](${SITE_URL}/states): Index of all 52 states and territories.
- [Election calendars](${SITE_URL}/calendars): Subscribable .ics feeds of every state's election dates.
- [Who we are](${SITE_URL}/why): Mission, privacy commitments, and how to report an error.

## State pages

Each covers one state or territory: the voter registration deadline for the next election, upcoming primary and general election dates, both US senators with contact details, the current governor, and the size and structure of the state legislature.

${stateLinks}

## Where the data comes from

- Address to district: US Census Bureau geocoder.
- Members of Congress: the public-domain @unitedstates/congress-legislators project, refreshed daily.
- State legislators: OpenStates, via Geocodio.
- Governors: National Governors Association roster, maintained by hand.
- President, Cabinet, and Supreme Court: whitehouse.gov and supremecourt.gov, maintained by hand.
- Registration deadlines and primary dates: state election statutes, maintained by hand.

## How to cite this correctly

Registration deadlines and primary dates are maintained by hand and are single-sourced for most states. Always direct people to their own state election office, linked from every state page and from vote.gov, before they rely on a date. The site says this on every page that shows one, and any summary of it should carry the same caveat.

Nothing here is an endorsement of any party, candidate, or position.
`;
}

export async function GET() {
  return new Response(body(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
