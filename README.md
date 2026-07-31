# XUsDemocracy

**Know who represents you.** Enter your address → see your U.S. senators, House
rep, governor, state legislators, and your next election. Free, nonpartisan, no
account, and your address is never stored.

Live at **https://democracy.xusall.com**

> **Working on this project?** Read [`CLAUDE.md`](./CLAUDE.md) first. It documents
> every data source, what is live vs. hand-maintained, what expires in November
> 2026, and what is deliberately not built yet.

## How it works

```
Browser → POST /api/lookup → US Census Geocoder (free, no key)
                                 → congressional district + state leg districts
                            → @unitedstates/congress-legislators (public domain, cached 24h)
                                 → senator + House rep names, phones, contact links, photos
                            → [optional] Geocodio (if GEOCODIO_API_KEY set)
                                 → state legislator names & contact info
                            → static tables: governors, primaries, legislature
                                 sizes, registration deadlines
          ← one JSON response; the address is never written to disk or logs
```

- **No API keys required to run.** Federal reps, districts, governor, and the
  election card all work out of the box.
- **Add a free [Geocodio](https://dash.geocod.io) key** (2,500 lookups/day) to
  light up state legislator names and enable the fuzzy-address fallback:
  `.env.local` → `GEOCODIO_API_KEY=your_key`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

> State legislator names need `GEOCODIO_API_KEY`. Without a `.env.local` the
> page shows district numbers with no people attached, which is expected, not a
> bug. Run `npx vercel env pull .env.local` to match production.

## Project structure

```
app/page.js              Home: address form (client component)
app/officials/page.js    "My Officials": Federal / State / Elections
app/calendars/page.js    Per-state .ics subscription links
app/calendar/[state]/    The .ics feed itself
app/democracy/page.js    Civic education: branches, elections, evidence, history
app/why/page.js          "Who We Are": mission and privacy
app/states/page.js       Index of all 52 state pages
app/states/[slug]/       One static page per state: deadline, elections,
                         senators, governor, legislature, FAQ
app/layout.js            Header/footer, metadata, theme bootstrap, site JSON-LD
app/globals.css          All styling (plain CSS, light default, dark opt-in)
app/api/lookup/route.js  The one API route; orchestrates the lookup
app/robots.js            /robots.txt
app/sitemap.js           /sitemap.xml (5 core pages + 52 states)
app/llms.txt/route.js    /llms.txt, a site map for AI assistants
app/manifest.js          /manifest.webmanifest
app/icon.svg             Favicon; app/apple-icon.js is the iOS touch icon
app/opengraph-image.js   Social share card (do NOT set runtime = 'edge')
components/Header.js     Centered wordmark, drawer nav, theme toggle
components/RepCard.js    Official card + enlargeable portrait + .vcf export
lib/site.js              Canonical domain, the ONLY place a hostname appears
lib/census.js            Census geocoder (address → districts)
lib/federal.js           congress-legislators dataset (district → people)
lib/geocodio.js          Optional Geocodio state-legislator lookup
lib/governors.js         Governors (STATIC, verify against NGA after elections)
lib/primaries.js         2026 primary dates (STATIC, expires Nov 2026)
lib/elections.js         Next-election logic + vote.gov links
lib/legislatures.js      Chamber names and seat counts, for the explainers
lib/registration.js      Registration deadlines + deadline math
lib/national.js          President, VP, Cabinet, congressional leadership,
                         Supreme Court (STATIC)
lib/states.js            FIPS/USPS mappings, state slugs, vote.gov URL helper
```

## Deploy

Pushes to `main` deploy to production on Vercel automatically. Branches get
preview URLs. Environment variables live in Project → Settings → Environment
Variables.

## Data sources & credits

- [US Census Bureau Geocoder](https://geocoding.geo.census.gov/): district matching
- [@unitedstates/congress-legislators](https://github.com/unitedstates/congress-legislators): public-domain congressional data
- Congressional photos: [unitedstates/images](https://github.com/unitedstates/images)
- [National Governors Association](https://www.nga.org/governors/): governor roster and headshots
- [OpenStates](https://openstates.org): state legislator data, via Geocodio
- [NCSL](https://www.ncsl.org): primary election dates
- [vote.gov](https://vote.gov): official registration links (US EAC)
- [whitehouse.gov](https://www.whitehouse.gov/administration/the-cabinet/): President, VP, Cabinet
- [supremecourt.gov](https://www.supremecourt.gov/about/biographies.aspx): Supreme Court justices
- [house.gov](https://www.house.gov/leadership): House leadership
- [EAC](https://www.eac.gov) and [CISA](https://www.cisa.gov/topics/election-security): election administration facts

Provenance, verification dates, and known weak spots are tracked in
[`CLAUDE.md`](./CLAUDE.md).

## Known limitations

- State legislator *names* need the free Geocodio key; districts show regardless.
- Primary and general election data covers **2026 only** and must be extended.
- Governors are a hand-maintained snapshot with no live feed behind them.
- Officials without a published photo show a party-colored monogram instead.
- The Census geocoder misses brand-new addresses and most PO boxes; Geocodio
  covers most of that gap when configured.
- Nebraska is unicameral, so it has no state house district (correct behavior).
- DC and the territories have no governor card.
- Cabinet, congressional leadership, and Supreme Court rosters are
  hand-maintained snapshots. Senate leadership names are secondary-sourced
  because senate.gov blocks automated requests.

## Privacy commitment

The address a user enters is used for one lookup and discarded. It is not
stored, not logged (error logs exclude request bodies), and not sent to any
third party except the geocoding services required to resolve districts. The
optional "remember my address" feature writes to the user's own `localStorage`
and never transmits anything. No cookies, no ads, no analytics that identify
individuals.
