# XUsDemocracy project brain

Read this first. It records what the project is, where every piece of data comes
from, what rots and when, and what is deliberately not built yet.

**Live:** https://democracy.xusall.com (primary) · xusdemocracy.com (legacy, still attached)
**Repo:** github.com/henryadrianrozo/xusdemocracy · **Host:** Vercel project `xusdemocracy`
**Stack:** Next.js 14 App Router, plain CSS, zero UI dependencies. No database. No accounts.

## The mission, in one line

Type your address, learn who represents you at every level, and know when your
next election is. Free, nonpartisan, no account, address never stored.

---

## How a lookup actually works

```
Browser  ──POST /api/lookup──▶  US Census Geocoder        (free, keyless)
                                  └─ congressional + state legislative districts
                              ▶  congress-legislators     (public domain, 24h cache)
                                  └─ senators + House rep: names, phones, contact links, photos
                              ▶  Geocodio  [needs key]    (wraps OpenStates)
                                  └─ state legislator names + contact info
                              ▶  local static tables      (governors, primaries, legislature sizes,
                                                           registration deadlines)
         ◀── one JSON response; the address is never written to disk or logged
```

**Fallback chain:** the Census geocoder is strict and rejects partial or
misspelled addresses. When it fails and a Geocodio key is present, Geocodio
re-geocodes and returns district + state legislators in one call
(`lib/geocodio.js → geocodeWithGeocodio`). Without a key, the user gets an
error asking for street + ZIP.

**Privacy is a real constraint, not a slogan.** `app/api/lookup/route.js` logs
`err.message` only, never the request body. Nothing is persisted server-side.
The one piece of state that exists, the saved address, lives in the user's
own `localStorage` and never leaves the browser.

---

## Data inventory: READ BEFORE TRUSTING ANYTHING

| What | File | Source | Live or static? | Rots when |
|---|---|---|---|---|
| Address → districts | `lib/census.js` | US Census Bureau geocoder | **Live** | Field name `CD119` is hardcoded (falls back to `BASENAME`). Becomes `CD120` after the 2030 census. |
| Senators + House rep | `lib/federal.js` | [@unitedstates/congress-legislators](https://github.com/unitedstates/congress-legislators) | **Live**, 24h cache | Self-maintaining. Community-run, usually updated within days of a change. |
| Congressional photos | `lib/federal.js` | unitedstates/images | **Live** | Self-maintaining. New members lag by weeks. |
| State legislators | `lib/geocodio.js` | Geocodio → OpenStates | **Live** *(needs `GEOCODIO_API_KEY`)* | Self-maintaining. Free tier = 2,500 lookups/day. |
| **Governors** | `lib/governors.js` | [NGA roster](https://www.nga.org/governors/) | **STATIC, hand-maintained** | **After every gubernatorial election and any mid-term succession.** Most volatile thing here. |
| Governor photos | `lib/governors.js` | NGA headshots, hotlinked | Static URLs | If NGA moves a file. `RepCard` falls back to a monogram on image error, so it degrades quietly. |
| **President, Cabinet, SCOTUS** | `lib/national.js` | [whitehouse.gov](https://www.whitehouse.gov/administration/the-cabinet/), [supremecourt.gov](https://www.supremecourt.gov/about/biographies.aspx) | **STATIC, hand-maintained** | Cabinet churns a few times per term. President and VP change Jan 2029. Court changes on death or retirement. |
| **Congressional leadership** | `lib/national.js` | [house.gov](https://www.house.gov/leadership) for the House. **Senate names are secondary-sourced.** | **STATIC, hand-maintained** | **Re-elected every Congress, so January 2027.** |
| **Primary dates** | `lib/primaries.js` | NCSL 2026 table | **STATIC, 2026 only** | **Hard-expires after Nov 2026.** No 2027/2028 data exists yet. |
| **General election** | `lib/elections.js` | Statute | **STATIC, 2026 only** | **Hard-expires 3 Nov 2026.** `GENERAL_2026` is a single hardcoded object. |
| Legislature sizes | `lib/legislatures.js` | Verified vs openstates/people | Static, ~constitutional | Once a decade, or on constitutional amendment. |
| Registration deadlines | `lib/registration.js` | CEIR 2026 survey | Static, statutory | When a legislature amends election law. Re-check each spring. |
| FIPS ↔ state | `lib/states.js` | Census | Static | Never. |

### Source-quality notes

Sourcing is deliberately biased toward government and government-derived data.
Two authoritative sources **block automated requests (HTTP 403)** and can only
be checked by hand in a browser: **NCSL** (`ncsl.org`) and **vote.gov**. That is
why the two datasets derived from them carry the weakest provenance.

Verification status as of **30 July 2026**:

- **Governors: fully verified.** All 50 names and parties re-checked against
  the live NGA roster; every entry matched. NGA is fetchable, so repeat this
  cheaply and often.
- **Legislature sizes: fully verified.** Every state's total cross-checked
  against `openstates/people`, which is scraped from official state legislature
  websites. All 52 matched within vacancy margins. Three expected deviations
  are documented in the file header.
- **Registration deadlines: spot-verified only.** Florida confirmed against
  the Florida Department of State's own deadline notice (20 July for the
  18 Aug primary = exactly 29 days, which also validates the "N days before any
  election" model). California confirmed via vote.gov. **The other 48 are
  single-sourced.**
- **Primary dates: spot-verified only.** Florida's 18 Aug 2026 primary
  confirmed against the Florida Department of State. The rest come from NCSL's
  statute-cited table and have not been individually re-checked.
- **Governor photos: fully verified (31 July 2026).** NGA pairs each headshot
  with the governor's name in the image `alt` attribute, so all 51 were matched
  on exact name rather than guessed, and every URL was confirmed to return 200.
- **President, Cabinet, Supreme Court: fully verified (31 July 2026).** Scraped
  directly from whitehouse.gov and supremecourt.gov. Both serve plain HTML to a
  browser user agent, so re-checking is one curl command (recorded in the header
  of `lib/national.js`). Note the roster holds details that are easy to get
  wrong from memory: the department is currently **Secretary of War**, the
  Attorney General is listed as **Acting**, and Markwayne Mullin is at DHS.
  Record titles exactly as published; do not normalize them.
- **Congressional leadership: House verified, Senate not.** house.gov serves
  plain HTML, so the Speaker, leaders, and whips came from the primary source.
  **senate.gov and congress.gov both return 403**, so Grassley, Thune, and
  Schumer came from secondary sources and should be confirmed by hand.
- **`/democracy` claims are individually sourced.** Paper records and audits
  from the EAC, critical-infrastructure designation from CISA, health outcomes
  from The Lancet, growth from the Journal of Political Economy. Every one is
  linked in the page body. Journal links point at the free NIH and NBER copies,
  because the publishers paywall and bot-block. **If you add a claim to that
  page, source it the same way or leave it out.**

Every screen that shows a date also tells the user to confirm with their state
election office, and links them there. Keep that. It is the honest hedge for
single-sourced data.

### The maintenance cliff: November 2026

This is the single most important thing to know about the project. On
**4 November 2026** three static datasets go stale simultaneously:

1. `lib/elections.js`: `GENERAL_2026` is in the past, so the elections list
   empties out and the officials page loses its Elections section content.
2. `lib/primaries.js`: every 2026 date is in the past, so `.ics` feeds go empty.
3. `lib/governors.js`: 36 governorships are decided, so names and parties change.
4. `lib/national.js`: congressional leadership is re-elected when the new
   Congress seats in January 2027, so the Speaker and both parties' leaders
   may all change.

**The blast radius got bigger on 31 July 2026.** This used to degrade one
dynamic view that a person had to type an address to reach. It now also
degrades **52 statically generated, publicly indexed pages**, whose titles
promise registration deadlines and election dates. After 4 November 2026 every
one of them will show an empty election list and no deadline, and Google will
still be serving them. Fixing the multi-cycle restructure is no longer just a
data chore, it is a credibility problem with a public deadline.

Fixing this properly means replacing the hardcoded 2026 objects with a
multi-cycle structure. See "Next moves" below.

---

## Routes

| Path | What it is |
|---|---|
| `/` | Address form. Redirects returning visitors straight to `/officials`. `/?new=1` forces the form. |
| `/officials` | The main result page: Federal / State / Elections. Was `/results` (301 redirect kept). |
| `/calendars` | Every state's `.ics` subscription link. |
| `/calendar/[state]` | The `.ics` feed itself. `webcal://` for Apple/Outlook, Google's add-by-URL for Google. |
| `/democracy` | Civic education: the system, the three branches, how elections are run, the evidence, suffrage history. Anchors `#branches` and `#congress` are cross-linked from `/officials`. |
| `/why` | "Who We Are": the project's mission and privacy commitments. |
| `/states` | Index of all 52 state pages. Linked from the footer, which is the crawl path. |
| `/states/[slug]` | **52 statically generated pages**, slug = full state name (`/states/new-hampshire`). Registration deadline, upcoming elections, both US senators, governor, legislature, calendar links, FAQ. `revalidate = 3600`. |
| `/api/lookup` | The one API route. POST `{address}` or `{lat,lon}`. |

## SEO and crawler surface

Added 31 July 2026. The site had no robots.txt, no sitemap, no canonicals, no
favicon, and no structured data before this.

| Route | File | Notes |
|---|---|---|
| `/robots.txt` | `app/robots.js` | Allows all. Disallows `/api/`, `/calendar/`, `/officials`. Names AI agents explicitly. |
| `/sitemap.xml` | `app/sitemap.js` | 57 URLs: 5 core + 52 states. Submit this to Search Console and Bing. |
| `/llms.txt` | `app/llms.txt/route.js` | Site map for language models, llmstxt.org convention. |
| `/manifest.webmanifest` | `app/manifest.js` | |
| `/icon.svg`, `/apple-icon` | `app/icon.svg`, `app/apple-icon.js` | |
| `/opengraph-image` | `app/opengraph-image.js` | |

**Things that will bite you if you forget them:**

- **The root layout sets `alternates.canonical: '/'`, and that is inherited.**
  Any page that does not set its own canonical will declare the home page as
  its canonical, which tells Google to index the home page instead of it. Every
  new page must set `alternates: { canonical: '/its-own-path' }`. `/officials`
  needed this even though it is noindex, because a noindex page pointing its
  canonical elsewhere is a contradictory instruction.
- **The root layout sets a title template (`%s | XUsDemocracy`).** Page titles
  must be bare. Writing `title: 'Thing | XUsDemocracy'` renders as
  `Thing | XUsDemocracy | XUsDemocracy`.
- **`/officials` and `/calendars` are client components and cannot export
  metadata.** Each has a sibling `layout.js` that carries it. Do not "fix" this
  by splitting the pages.
- **Do not add `runtime = 'edge'` to `opengraph-image.js`.** Edge opts the route
  out of static generation, so the image gets rendered per request and slow
  social crawlers sometimes give up, producing link previews that intermittently
  fail to appear.
- **Do not add an `.action-block h3` rule to `globals.css`.** It outranks
  `.sub-title` on specificity and silently shrinks the Elections headings. That
  exact bug shipped once.
- Verification tokens come from `GOOGLE_SITE_VERIFICATION` and
  `BING_SITE_VERIFICATION` env vars and are omitted entirely when unset. No
  placeholder is ever committed.

**The state pages raise the stakes on registration data.** `lib/registration.js`
is spot-verified for Florida and California only; the other 48 are
single-sourced from the CEIR survey. That number is now the headline of 52
indexable pages and the first answer in their FAQ structured data, so an error
propagates into search results and AI answers rather than being seen by one
person. Each page links its state election office directly under the deadline
and again in the footer note. **Re-verifying all 50 deadlines is the highest
value data task on the list.**

## Client-side state (all `localStorage`, all optional)

| Key | Meaning |
|---|---|
| `xud-address` | The saved address. Its presence is what makes `/` redirect to `/officials` and reveals "My Officials" in the drawer. |
| `xud-save-declined` | User said "Not now" to the save prompt; don't ask again. |
| `xud-theme` | `light` (default) or `dark`. Applied pre-paint by an inline script in `layout.js` to avoid a flash. |

## Conventions

- **Plain CSS in one file** (`app/globals.css`), themed with CSS custom
  properties. Light is `:root`; dark is `[data-theme='dark']`. Add colors as
  variables so both themes stay in sync.
- **The domain lives in exactly one place:** `lib/site.js`. Never hardcode a
  hostname. Client-side calendar links use the current origin so preview
  deploys and the legacy domain both work.
- **Voice:** professional and plainspoken. Explain, don't lecture. Short
  sentences. No jargon without a gloss, no exclamation points beyond the one on
  the home page, and no partisanship of any kind, ever.
- **No em dashes or en dashes anywhere.** Not in copy, comments, docs, or commit
  messages. They read as AI-generated and undermine the site's credibility.
  Rewrite the sentence with a comma, colon, or period instead of swapping in a
  hyphen. Check before committing:

  ```bash
  find app components lib . -maxdepth 4 \
    \( -name '*.js' -o -name '*.md' -o -name '*.css' -o -name '*.mjs' -o -name '*.svg' \) \
    -not -path '*/node_modules/*' -not -path '*/.next/*' -not -path '*/.git/*' -print0 \
    | xargs -0 grep -n '[—–]' | sort -u
  ```

  The only legitimate hit is the line just above, which has to contain the
  characters in order to match them. Anything else is a regression.

  ⚠️ **This command used to be `grep -rn ... --include="*.js" ...` and it was
  silently broken.** `grep` on this machine is **ugrep 7.5.0**, not GNU or BSD
  grep, and under ugrep that invocation matches nothing at all, even on a file
  that provably contains the characters. It never failed loudly; it just always
  returned clean, so the project's most important style rule had a guardrail
  that could not fire. Verify any replacement actually catches a known dash
  before trusting it:

  ```bash
  printf 'em—dash\n' | grep -n '[—–]'    # must print a match
  ```

  `git grep -n '[—–]'` also works, but only searches tracked files, so it
  misses newly added ones. Prefer the `find` form above.
- Comments explain *why*, especially for anything data-source or
  privacy-related. Future maintainers need the provenance more than the syntax.

## Environment

| Variable | Required? | Effect |
|---|---|---|
| `GEOCODIO_API_KEY` | Optional but important | Without it, no state legislator names and no fuzzy-address fallback. Free tier: 2,500/day at [dash.geocod.io](https://dash.geocod.io). |
| `NEXT_PUBLIC_SITE_HOST` | Optional | Overrides the canonical host. Defaults to `democracy.xusall.com`. |
| `GOOGLE_SITE_VERIFICATION` | Optional | Emits the Search Console meta tag. Omitted entirely when unset. |
| `BING_SITE_VERIFICATION` | Optional | Emits the `msvalidate.01` meta tag for Bing Webmaster Tools. |

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

Node v24 is installed at `/usr/local/bin/node` (added 31 July 2026).

**Known gotcha: state legislators look broken on localhost.** There is no
`.env.local` in the repo, so `GEOCODIO_API_KEY` is unset and
`lib/geocodio.js → geocodioEnabled()` returns false. Census still returns the
district *numbers*, so the page shows "State Senate District 3" with no person
attached. This is not a bug and production is unaffected. To match production
locally:

```bash
npx vercel link && npx vercel env pull .env.local   # both interactive
```

Do not re-diagnose this as a data problem. Check for `.env.local` first.

---

## Next moves

**Fix before November 2026 (not optional):**
1. Restructure elections to be multi-cycle instead of `GENERAL_2026` +
   `PRIMARIES_2026`. A flat, dated list keyed by state that simply filters to
   "future" would survive every cycle without a rewrite.
2. Add 2027 and 2028 primary dates.
3. Re-verify all 50 governors against NGA the week after the election.

**Product:**
4. **Local officials.** The most-requested missing layer and the hardest data
   problem, because there is no national feed for ~19,000 municipalities. The
   realistic path is top-N cities by population, hand-curated, expanding over
   time, with honest "not covered yet" messaging everywhere else.
5. **Issue → official routing.** "Potholes" → city council; "taxes" → Congress.
   This is the killer feature and it depends entirely on #4 existing first.
6. Message tracking and representative accountability, the long-term vision.
   Needs accounts, which breaks the current no-database promise. Design that
   trade-off deliberately when the time comes.

**Search, once the site is submitted:**
7. Verify the domain in Google Search Console and Bing Webmaster Tools, set
   `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` in Vercel, redeploy,
   then submit `https://democracy.xusall.com/sitemap.xml` to both. Bing can
   import the property straight from Search Console once Google is verified.
8. Re-verify all 50 registration deadlines. See the warning in the SEO section:
   this data is now public and indexed.
9. Per-city pages would be the natural follow-on to the state pages, but they
   depend on the local officials data problem below being solved first.

**Reliability:**
10. No rate limiting on `/api/lookup`. A bored script can burn the 2,500/day
    Geocodio tier in minutes and silently degrade the site to federal-only.
11. Some officials still render a monogram instead of a photo: state
    legislators with no OpenStates image, and the Vice President, whose
    official portrait could not be identified on whitehouse.gov. The monogram
    is deliberate, because showing the wrong face on a civic site is worse than
    showing initials. (Governors were fixed in July 2026; all 51 now carry NGA
    headshots.)
