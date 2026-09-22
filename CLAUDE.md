# XUsDemocracy project brain

<!-- STATUS:BEGIN -->
**Updated:** 2026-09-22 · `acb8193`  
**State:** Live at democracy.xusall.com. Address to representatives, nonpartisan, nothing stored. Early voting for all 50 states and DC, three election alert cards at the top of `/officials`, a polling place link for every state, and a multi-cycle election list (2026 and 2028) that survives 3 November.  
**Last shipped:** Brand pass. The favicon, apple-icon, and the "Every level of government" pitch icon are now the same courthouse mark (three pillars, built as filled shapes so it survives 16px), replacing the old X glyph and vague house shape. "Contact & accountability" is now three non-overlapping figures instead of one. Both new glyphs live once in `components/icons.js` so the pitch row and the drawer nav can no longer drift the way the old hand-duplicated capitol and person paths did. The drawer picked up an "All States" link (new map-pin icon), which now carries the crawl-path job to the 52 state pages that the footer's five-link nav used to do; that nav is gone, and the footer is three quiet lines with the XUsAll attribution as an actual link to xusall.com. The share card (`opengraph-image.js`) is repainted in the light palette to match the page instead of the old dark ground, and its description is now one short sentence instead of the long SEO copy, via a new `SHARE_DESCRIPTION` split from `DESCRIPTION` in `app/layout.js` (metadata and JSON-LD keep the long one). `CONTACT_EMAIL` is now hello@xusall.com everywhere (`lib/site.js`, `/calendars`, `/why`, `llms.txt`), closing out the last item below.  
**Missing:** 15 of the 51 polling links are not confirmed (list in the header of `lib/pollingplace.js`). Adrian chose to assume they work for now. Click NM and OK first: both returned 403 even in a real browser. Puerto Rico early voting (not in CEIR). Odd-year 2027 elections and 2028 primaries (not published yet). Legislator facts for eight 2-4-4 senates. The election alert cards' clicks scrolling to their blocks still need one tap by hand to confirm, since the automated tab never runs animation frames. Social link-preview caches (LinkedIn, Facebook/Instagram/WhatsApp) still hold the old dark share card until re-scraped by hand; see "Next."  
**Blocked:** Nothing on our side.  
**Next:** Adrian clicks the NM and OK polling links, and the other unconfirmed ones when convenient. Re-scrape democracy.xusall.com in LinkedIn's Post Inspector and Facebook's Sharing Debugger so the new light share card replaces the cached dark one (Adrian has to be signed in; not something Claude can do). Week of 9 November: re-verify all 50 governors against NGA. January 2027: re-check congressional leadership (the newly added leadership photos ride along with that check, since they come from the same bioguide lookup).
<!-- STATUS:END -->

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
| Justice photos | `lib/national.js` | supremecourt.gov, hotlinked from `justice_pictures/` | Static URLs, verified 22 Sept 2026 | Only on a Court change, same as the roster above. Each URL was matched against the justice's name in the source page's own `alt` attribute, the same standard used for governor photos. `PersonList`/`FaceAvatar` fall back to initials on image error. |
| **Congressional leadership** | `lib/national.js` | [house.gov](https://www.house.gov/leadership) for the House. **Senate names are secondary-sourced.** | **STATIC, hand-maintained** | **Re-elected every Congress, so January 2027.** All eight now carry `bioguide` and `party`, so their photos come from `congressPhoto()` in `lib/federal.js`, the same self-maintaining source as senators and representatives; resolving those bioguide IDs on 22 Sept 2026 also served as an independent second source for Grassley, Thune, and Schumer, though not a primary one. |
| **Primary dates** | `lib/primaries.js` | NCSL 2026 table | **STATIC, 2026 only** | 2026 dates pass by 15 Sep. 2028 primaries are not published yet, so none are listed and the site shows only the 2028 general. Add them when NCSL publishes. |
| **General elections** | `lib/elections.js` (`GENERALS`) | Statute: Tuesday after the first Monday in November | **Computed**, 2026 and 2028 | Add the next year to `GENERALS` before Nov 2028. Dates come from `generalElectionDate()`, so only the label and description are typed by hand. |
| Legislature sizes | `lib/legislatures.js` | Verified vs openstates/people | Static, ~constitutional | Once a decade, or on constitutional amendment. |
| Registration deadlines | `lib/registration.js` | CEIR 2026 survey | Static, statutory | When a legislature amends election law. Re-check each spring. |
| **Polling place lookups** | `lib/pollingplace.js` | NASS "Find Your Polling Place", each link a state's own tool | Static, links only | State sites reorganize portals without notice. Re-check each spring with the registration deadlines. 36 loaded in a browser, 15 unconfirmed (header lists them). FL, GA and WY were moved from NASS's links to where those redirect. |
| **Early + mail voting windows** | `lib/earlyvoting.js` | CEIR "2026 Early and Mail Voting Dates", Sept 2026 | **STATIC, 2026 only** | **Hard-expires 3 Nov 2026**, but goes quiet rather than wrong. 51 jurisdictions loaded; Puerto Rico is not in CEIR. |
| Legislature election cycles | `lib/legislatures.js` (`ELECTION_CYCLES`) | 2026 and 2024 state legislative election tables citing Ballotpedia, verified 21 Sept 2026 | Static, verified | A constitutional change, a term-length change, or a 2-4-4 shift after redistricting. The year is computed, so it does not go stale each November. |
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

### The maintenance cliff: November 2026 (partly fixed 2026-09-21)

On **4 November 2026** several datasets go stale. What was fixed and what was not:

**Fixed.** `lib/elections.js` now holds a `GENERALS` list (2026 and 2028) with
dates computed from the statutory rule, so after 3 November the elections list
shows the 2028 general instead of emptying out. Registration deadlines are
computed from whichever election is next, so they follow. `lib/earlyvoting.js`
returns null for any election other than the 2026 general, so 2026 windows never
appear against 2028. The `.ics` feeds emit a one-week reminder and Election Day
for every entry in `GENERALS`. Verified by faking the clock to 2026-11-05 and
checking Ohio: one election (2028-11-07), a 2028 registration cutoff, no
early-voting window.

**Not fixed, needs a human on a date:**
1. `lib/governors.js`: 36 governorships are decided on 3 November. Re-verify all
   50 against NGA the week after (NGA is fetchable, so this is cheap).
2. `lib/national.js`: congressional leadership is re-chosen when the new Congress
   seats in January 2027. House from house.gov; Senate is secondary-sourced.
3. Primaries for 2027 and 2028 are not published, so the site lists only the
   2028 general for those. Add them when NCSL publishes.
4. Odd-year elections in 2027 (VA and NJ legislatures, KY, LA and MS state
   offices) are not on the site at all. Add them as state-specific entries only
   with dates confirmed against each state's election office.
5. `/officials` and the 52 state pages now say "next election 2028" for a while,
   which is true but thin. That is the cost of not guessing.

---

## The election-season push (September 2026, SHIPPED)

Started 2026-09-20, 44 days before the general, and shipped 2026-09-21.

### Why it happened

Early voting for the 3 November general was already underway when this started.
Virginia, Minnesota, and South Dakota opened in-person early voting on
18 September, North Carolina mailed absentee ballots on 4 September, and
Illinois opened on 24 September. The site said nothing about any of it, because
the model had no concept of an election being *in progress*: every election was
a single-day point event with a `daysUntil` count, and there was no
early-voting, absentee, or mail data anywhere in the repo.

### What shipped in this pass

1. **`lib/earlyvoting.js` (new).** Per-state early in-person and mail windows,
   with `getVotingWindow(state, stateFullName, electionDate)` returning a
   status of `open` / `upcoming` / `closed` / `excuse-required`, plus a
   sentence for the deadline box and a `chip` for the election bar. Wired
   through `/api/lookup` as `votingWindow`.
2. **The election alert cards** at the top of `/officials`. They began as three
   chips, became one banner, then three red cards; on 2026-09-21 they were tried
   as stacked horizontal cards with a blue badge and Adrian took them back to the
   red cards. Every card has the same shape: a red title (`--red-ink`), the date as
   the big fact, the countdown muted under it, the link pinned to the bottom so
   the links line up. They are small and side by side on desktop, stacked on a
   phone, in date order: registration
   leads unless early voting is already open. Each carries a direct link, and
   clicking a card runs `jumpTo()`, which opens Elections and scrolls to the
   matching block: registration to `#election-register`, early voting to
   `#election-early`, Election Day to the top of the section. **Keep the link
   labels in step:** the same strings appear on the cards, in those Elections
   blocks and on the state pages. Renders only inside 90 days of an election, so
   it disappears out of season.
3. **Congress and Executive now fold**, remembered in `xud-collapsed`. See the
   note below, this reverses an earlier decision on purpose.
4. **Elections has no red box any more.** Registration and early voting each
   lead a plain action block, "Register to Vote" and "Where and When to Vote",
   with a `CountdownCard`: the election card's shape with a red block
   (`.election-date-deadline`, `--red-fill`) holding the days left
   (`registrationBadge()`, `earlyBadge()`, a short word where there is no date to
   count) and the full sentence beside it, then one link. Blue marks an election,
   red a deadline the reader acts on. `--red-ink` and `--red-fill` exist because
   `--red` is too light for small white text or red text on the pink wash; `--red`
   itself (buttons, wordmark, party pills) is unchanged. A red box holding a facts grid plus both links, repeated again just
   below, was tried on 2026-09-21 and read as a jumble. The state pages still use
   `.deadline-box`.
5. **The Elections lede explains general elections**, not just primaries. The
   old copy only described primaries, which read as a non sequitur in a year
   when most states have none left.
6. **Removed** the "Every card below carries the contact details..." explainer
   and its now-dead `.page-note` rule.
7. `html { scroll-behavior: smooth }` under `prefers-reduced-motion`, the first
   anchor navigation in the codebase.

### Why Congress and Executive fold now, when they deliberately did not before

`SubTitle` used to carry a comment saying these two were made into dropdowns
once and reverted as clutter. That is still true, and the reason it is safe to
revisit is that the earlier attempt gave them **carets**, which put a second row
of triangles under the Federal triangle on a page that also has the Cabinet and
Court dropdowns. This version uses the **count pill** instead, which is the
affordance the national block already established, and which the CSS comment on
`.caret` had already argued was sufficient on its own. One disclosure idiom per
level. If you are tempted to add an arrow to these, read that comment first.

`.sub-title` is shared with the Elections action blocks, which must stay plain
headings, so the folding variant is `.sub-title-toggle` on a `<summary>` rather
than a change to `.sub-title` itself.

### Finished 2026-09-21

1. **Early voting covers all 51 jurisdictions.** The table came from the CEIR
   spreadsheet. The derivation rules (required over authorized dates, county
   and varying starts, in-person absentee for ID, MI, MN and ND, the later date
   of a mail-out range, `mailExcuse`) are in the header of `lib/earlyvoting.js`.
   Puerto Rico is not in CEIR and renders nothing.
2. **State legislators show term and next election**, from `ELECTION_CYCLES` in
   `lib/legislatures.js`. `mapLegislators()` in `lib/geocodio.js` emits `facts`
   in the shape `['4-year term', 'Next election November 2027']`. The year is
   computed from the general election date, so an even-year House reads 2026
   until 3 November and 2028 after. Staggered chambers get the term alone. The
   upper chambers of AR, DE, FL, HI, IL, MN, NJ and TX use a 2-4-4 term system
   and get no facts. Puerto Rico gets term only.
   **Ballotpedia was unreachable** (an AWS bot challenge that curl, WebFetch and
   the Wayback Machine could not pass), so the cycles were checked against the
   Wikipedia tables for the 2026 and 2024 legislative elections, which cite
   Ballotpedia, and the 2027 elections page. Recheck against Ballotpedia by hand
   when a browser is available.

### Still open

3. **The calendar scroll works.** Confirmed live on 2026-09-21: "Add to my
   calendar" opens the Elections section and lands on the Election Calendars
   block. The card clicks use the same `jumpTo()`; card 1 was confirmed landing
   on the deadline box, card 3 could not be watched to the end because the
   automated tab was in the background, where `requestAnimationFrame` never
   fires. Tap the Election Day card once by hand.
4. **Not checked in the live app:** dark theme, the 375px layout (both checked
   only as static HTML in headless Chrome), and the banner for states other
   than Virginia. The API output was
   checked for FL, WI, TX, AL, CO, ND and IL, and the date-dependent branches
   were exercised with a faked clock. The legislator facts were confirmed in the
   production API for VA, WI and TX; the pulled Vercel env gave no working
   Geocodio key locally. `queryGeocodio` takes the state from the lookup route,
   because reading it from Geocodio's response produced no facts on the first
   deploy and the cause was not tracked down.

## Routes

| Path | What it is |
|---|---|
| `/` | Address form. Redirects returning visitors straight to `/officials`. `/?new=1` forces the form. |
| `/officials` | The main result page: Federal / State / Elections. Was `/results` (301 redirect kept). |
| `/calendars` | Every state's `.ics` subscription link. |
| `/calendar/[state]` | The `.ics` feed itself. `webcal://` for Apple/Outlook, Google's add-by-URL for Google. |
| `/democracy` | Civic education: the system, the three branches, how elections are run, the evidence, suffrage history. Anchors `#branches` and `#congress` are cross-linked from `/officials`. |
| `/why` | "Who We Are": the project's mission and privacy commitments. |
| `/states` | Index of all 52 state pages. Linked from the drawer nav ("All States"), which is the crawl path: the drawer is in the DOM on every route whether or not it is open. |
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
| `xud-collapsed` | JSON array of folded subheading ids on `/officials`, currently `congress`, `executive`, and `national` (the "Appointed and Chosen" subsection). Absent means everything is open. |

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

**The September 2026 election push is shipped.** See that section above for
the open checks (polling links, dark theme and 375px in the live app).

**Dates to remember (Adrian sets the reminders):**
- **Now:** click the NM and OK polling links; they returned 403 in a browser.
- **3 November 2026, Election Day:** nothing to do. The early-voting window and
  the banner's early-voting line go quiet by themselves, and the site switches
  to the 2028 general. Glance at `/officials` once on 4 November.
- **Week of 9 November 2026:** ask Claude to re-verify all 50 governors against
  NGA (36 governorships were decided on 3 November).
- **January 2027:** ask Claude to re-check congressional leadership.
- **Spring 2027:** re-check registration deadlines and polling links.
- **Whenever published:** 2027 odd-year elections and 2028 primaries.
- **Before November 2028:** add 2030 to `GENERALS`.

**Before and after November 2026:**
1. Done 2026-09-21: elections are multi-cycle (`GENERALS`), see the maintenance
   cliff section for what that did and did not fix.
2. Week of 9 November: re-verify all 50 governors against NGA.
3. January 2027: re-check congressional leadership.
4. When published: 2027 odd-year elections and 2028 primary dates.
5. Before November 2028: add 2030 to `GENERALS`.

**Product:**
3a. **Sample ballots.** Google's Civic Information API still serves
    `voterInfoQuery` (free, 25,000 queries/day) and returns the real contests
    and candidates on a ballot by address. The Representatives API turndown in
    April 2025 did not touch Elections. Parked deliberately during the election
    push: it needs a new API key and a live dependency, and Voting Information
    Project ballot coverage is patchy and often populates only days before an
    election, which is a credibility risk on a nonpartisan site. Build the
    honest empty state before the happy path.
3b. **Simplified view.** A toggle that shows the cards alone, without the ledes
    and explainers, for readers who just want the names and numbers.
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

## Status block

At the end of a session, and in the same commit as any feature-sized piece of
work, update the `STATUS:BEGIN`/`STATUS:END` block at the top of
`CLAUDE.md`: the date, the current commit hash, and the
State / Blocked / Next lines. Keep it to those few lines; the detail belongs in
the prose below it.

`~/Projects/PROJECT_STATUS.md` is generated from that block, so it is the only
place this project's status needs to be written. Nothing is copied anywhere
else by hand.
