// Optional: Geocodio v2 integration for STATE legislators.
// Free tier: 2,500 lookups/day. Sign up at https://dash.geocod.io, create an
// API key with GEOCODING "Single and Batch" permission, then set
// GEOCODIO_API_KEY in .env.local (and in Vercel project settings).
// If no key is set, the app still works — it just shows federal reps only.
// Legislator data source: OpenStates (https://github.com/openstates/people).

export function geocodioEnabled() {
  return Boolean(process.env.GEOCODIO_API_KEY);
}

function mapLegislators(chamber, roleLabel) {
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
      level: 'state'
    }))
  );
}

async function queryGeocodio(endpoint, q) {
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

  return {
    // Nebraska (unicameral) returns everything under "senate".
    stateSenators: mapLegislators(sld.senate, 'State Senator'),
    stateReps: mapLegislators(sld.house, 'State Representative')
  };
}

export async function getStateLegislators(address) {
  return queryGeocodio('geocode', address);
}

export async function getStateLegislatorsByCoords(lat, lon) {
  return queryGeocodio('reverse', `${lat},${lon}`);
}
