# XUsDemocracy

**Know who represents you.** Enter your address → see your U.S. senators, House rep, state legislative districts, and your next election. Free, nonpartisan, no account, and your address is never stored.

Live at: https://xusdemocracy.com (once DNS is pointed)

## How it works

```
Browser → POST /api/lookup → US Census Geocoder (free, no key)
                                 → congressional district + state leg districts
                            → @unitedstates/congress-legislators (public domain, cached 24h)
                                 → senator + House rep names, phones, contact links
                            → [optional] Geocodio (if GEOCODIO_API_KEY set)
                                 → state legislator names & contact info
          ← one JSON response; the address is never written to disk or logs
```

- **No API keys required to run.** Federal reps + districts + election card work out of the box.
- **Add a free [Geocodio](https://dash.geocod.io) key** (2,500 lookups/day free) to light up state legislator names: create `.env.local` with `GEOCODIO_API_KEY=your_key`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy (Vercel, free tier)

1. Push this folder to a GitHub repo.
2. vercel.com → Add New Project → import the repo. No config needed; it auto-detects Next.js.
3. (Optional) Project → Settings → Environment Variables → add `GEOCODIO_API_KEY`.
4. Buy `xusdemocracy.com` → Vercel Project → Settings → Domains → add it, follow the DNS instructions at your registrar.

## Project structure

```
app/page.js            Main page: address form + results UI (client component)
app/why/page.js        "Why this matters" — civic engagement essay
app/layout.js          Header/footer, metadata, privacy statement
app/globals.css        All styling (plain CSS, no framework — easy to restyle)
app/api/lookup/route.js  The one API route; orchestrates the lookup
lib/census.js          Census Bureau geocoder (address → districts)
lib/federal.js         congress-legislators dataset (district → people)
lib/geocodio.js        Optional Geocodio state-legislator lookup
lib/elections.js       Next-election data + vote.gov links
lib/states.js          FIPS/USPS mappings, vote.gov URL helper
```

## Iterating with AI tools

- **Claude Code** (terminal): `cd` into this folder, run `claude`, and describe changes ("add a governor card", "make rep cards shareable as images"). The codebase is deliberately small and dependency-light so Claude Code can hold all of it in context.
- **Claude Design** (claude.ai/design): import this repo so it learns the existing look, then generate new screens/components in the same design system; bring the React output back in via Claude Code.

## Data sources & credits

- [US Census Bureau Geocoder](https://geocoding.geo.census.gov/) — district matching (public, free)
- [@unitedstates/congress-legislators](https://github.com/unitedstates/congress-legislators) — public-domain congressional data maintained by the open-gov community
- Congressional photos: [unitedstates/images](https://github.com/unitedstates/images)
- [vote.gov](https://vote.gov) — official registration links (US EAC)
- [Geocodio](https://www.geocod.io) — optional state legislator data

## Roadmap (see project docs)

Phase 1.5: per-state `.ics` election calendar feeds (subscribe once, your calendar reminds you) · shareable rep cards · email reminders. Phase 2+: governors & local officials (CTCL Governance Project), sample ballots, bill tracking via congress.gov, PWA install, then iOS via Capacitor.

## Known limitations (MVP)

- State legislator *names* need the free Geocodio key; districts show regardless.
- "Next election" shows the federal general; state primaries/specials come with the Phase 2 elections source.
- Census geocoder can miss brand-new addresses and some PO boxes — try a nearby street address.
- Nebraska is unicameral: its "house" district will be empty (correct behavior).

## Privacy commitment

The address a user enters is used for one lookup and discarded. It is not stored, not logged (error logs exclude request bodies), and not sent to any third party except the geocoding services required to resolve districts. No cookies, no analytics that identify individuals, no ads. If analytics are added, use a cookieless privacy-first tool (Plausible/Umami).
