import { FIPS_TO_STATE } from './states';

// Free, keyless US Census Bureau geocoder. Two modes:
//  - geocodeAddress(address): address string -> districts
//  - geocodeCoords(lat, lon): GPS coordinates -> districts ("use my location")
// The address/coords are sent to the Census Bureau for matching and are
// never stored or logged by us.

const BASE = 'https://geocoding.geo.census.gov/geocoder/geographies';
const PARAMS = '&benchmark=Public_AR_Current&vintage=Current_Current&layers=all&format=json';

function parseGeographies(geos, uspsFromAddress) {
  const findLayer = (pattern) => {
    const key = Object.keys(geos).find((k) => pattern.test(k));
    return key ? geos[key]?.[0] : null;
  };

  const cd = findLayer(/Congressional Districts/i);
  const sldu = findLayer(/State Legislative Districts - Upper/i);
  const sldl = findLayer(/State Legislative Districts - Lower/i);

  const stateFips = cd?.STATE || sldu?.STATE || sldl?.STATE;
  const usps = uspsFromAddress || FIPS_TO_STATE[stateFips]?.[0];
  const [, fullName] = Object.values(FIPS_TO_STATE).find(([abbr]) => abbr === usps) || [null, null];

  // Census uses '98'/'99' for delegate/resident-commissioner at-large seats
  // and '00' for at-large states. The legislators dataset uses district 0.
  let district = cd ? parseInt(cd.CD119 ?? cd.BASENAME, 10) : null;
  if (district === 98 || district === 99 || Number.isNaN(district)) district = 0;

  return {
    state: usps,
    stateFullName: fullName,
    congressionalDistrict: district,
    stateSenateDistrict: sldu ? { name: sldu.NAME, number: sldu.BASENAME } : null,
    stateHouseDistrict: sldl ? { name: sldl.NAME, number: sldl.BASENAME } : null
  };
}

export async function geocodeAddress(address) {
  const url = `${BASE}/onelineaddress?address=${encodeURIComponent(address)}${PARAMS}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Census geocoder unavailable');
  const data = await res.json();

  const match = data?.result?.addressMatches?.[0];
  if (!match) return null;

  return {
    matchedAddress: match.matchedAddress,
    coordinates: match.coordinates,
    ...parseGeographies(match.geographies || {}, match.addressComponents?.state)
  };
}

export async function geocodeCoords(lat, lon) {
  const url = `${BASE}/coordinates?x=${encodeURIComponent(lon)}&y=${encodeURIComponent(lat)}${PARAMS}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Census geocoder unavailable');
  const data = await res.json();

  const geos = data?.result?.geographies;
  if (!geos || Object.keys(geos).length === 0) return null;

  return {
    matchedAddress: 'your current location',
    coordinates: { x: lon, y: lat },
    ...parseGeographies(geos, null)
  };
}
