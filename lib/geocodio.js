// Optional: Geocodio v2 integration for STATE legislators.
// Free tier: 2,500 lookups/day. Sign up at https://dash.geocod.io, create an
// API key with GEOCODING "Single and Batch" permission, then set
// GEOCODIO_API_KEY in .env.local (and in Vercel project settings).
// If no key is set, the app still works, it just shows federal reps only.
// Legislator data source: OpenStates (https://github.com/openstates/people).

import { legislatorFacts } from './legislatures';

export function geocodioEnabled() {
  return Boolean(process.env.GEOCODIO_API_KEY);
}

// `which` is 'upper' or 'lower', so the card can say how long the term is and
// when the seat is next up. Both come from lib/legislatures.js, not OpenStates.
function mapLegislators(chamber, roleLabel, state, which) {
  return (chamber || []).flatMap((d) =>
    (d.current_legislators || []).map((l) => ({
      name: [l.bio?.first_name, l.bio?.last_name].filter(Boolean).join(' '),
      party: l.bio?.party || null,
      role: `${roleLabel}${d.district_number ? `, District ${d.district_number}` : d.name ? `, ${d.name}` : ''}`,
      phone: l.contact?.phone || null,
      email: l.contact?.email || null,
      website: l.contact?.url || null,
      contactForm: l.contact?.contact_form || null,
      photo: l.bio?.photo_url || null,
      facts: legislatorFacts(state, which),
      level: 'state'
    }))
  );
}

// `knownState` is the two-letter code the caller already resolved (from the
// Census match). It is preferred over Geocodio's own address_components: the first
// deploy that read the state from there produced no facts in production, and
// the cause was not tracked down.
async function queryGeocodio(endpoint, q, knownState) {
  const key = process.env.GEOCODIO_API_KEY;
  if (!key) return null;

  const url =
    `https://api.geocod.io/v2/${endpoint}` +
    `?q=${encodeURIComponent(q)}` +
    '&fields=stateleg' +
    `&api_key=${key}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();

  const sld = data?.results?.[0]?.fields?.state_legislative_districts;
  if (!sld) return null;

  const state = knownState || data.results[0].address_components?.state;

  return {
    // Nebraska (unicameral) returns everything under "senate", which is the
    // upper chamber here too.
    stateSenators: mapLegislators(sld.senate, 'State Senator', state, 'upper'),
    stateReps: mapLegislators(sld.house, 'State Representative', state, 'lower')
  };
}

export async function getStateLegislators(address, state) {
  return queryGeocodio('geocode', address, state);
}

// Full fallback geocode: Geocodio completes partial/messy addresses
// ("1109 N Highland St, 22201" or "1109 N Highland St, Arlington VA")
// and returns the congressional district plus state legislators in one call.
// Used when the Census geocoder can't match the input.
export async function geocodeWithGeocodio(address) {
  const key = process.env.GEOCODIO_API_KEY;
  if (!key) return null;

  const url =
    'https://api.geocod.io/v2/geocode' +
    `?q=${encodeURIComponent(address)}` +
    '&fields=stateleg,cd&limit=1' +
    `&api_key=${key}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();

  const r = data?.results?.[0];
  if (!r?.address_components?.state) return null;

  const cd = r.fields?.congressional_districts?.[0];
  const sld = r.fields?.state_legislative_districts;

  return {
    matchedAddress: r.formatted_address,
    state: r.address_components.state,
    congressionalDistrict:
      cd && cd.district_number != null ? Number(cd.district_number) : null,
    stateLegislators: sld
      ? {
          stateSenators: mapLegislators(
            sld.senate,
            'State Senator',
            r.address_components.state,
            'upper'
          ),
          stateReps: mapLegislators(
            sld.house,
            'State Representative',
            r.address_components.state,
            'lower'
          )
        }
      : null
  };
}

export async function getStateLegislatorsByCoords(lat, lon, state) {
  return queryGeocodio('reverse', `${lat},${lon}`, state);
}
