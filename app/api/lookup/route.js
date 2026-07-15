import { geocodeAddress, geocodeCoords } from '@/lib/census';
import { getFederalReps } from '@/lib/federal';
import {
  getStateLegislators,
  getStateLegislatorsByCoords,
  geocodeWithGeocodio,
  geocodioEnabled
} from '@/lib/geocodio';
import { getUpcomingElections } from '@/lib/elections';
import { getGovernor } from '@/lib/governors';
import { FIPS_TO_STATE } from '@/lib/states';

// PRIVACY: The address/coordinates are used only for this lookup. They are
// not stored, not logged, and not sent anywhere except the geocoding
// services needed to match districts (US Census Bureau; Geocodio if configured).
export async function POST(request) {
  try {
    const body = await request.json();
    const address = body.address?.trim();
    const { lat, lon } = body;
    const hasCoords = typeof lat === 'number' && typeof lon === 'number';

    if (!hasCoords && (!address || address.length < 5)) {
      return Response.json({ error: 'Please enter a street address.' }, { status: 400 });
    }

    let geo = hasCoords ? await geocodeCoords(lat, lon) : await geocodeAddress(address);
    let prefetchedStateLegs = null;

    // Census is strict; Geocodio completes partial or misspelled addresses.
    if ((!geo || !geo.state) && !hasCoords && geocodioEnabled()) {
      const g = await geocodeWithGeocodio(address);
      if (g?.state) {
        const [, fullName] =
          Object.values(FIPS_TO_STATE).find(([abbr]) => abbr === g.state) || [];
        geo = {
          matchedAddress: g.matchedAddress,
          state: g.state,
          stateFullName: fullName || g.state,
          congressionalDistrict: g.congressionalDistrict ?? -1,
          stateSenateDistrict: null,
          stateHouseDistrict: null
        };
        prefetchedStateLegs = g.stateLegislators;
      }
    }

    if (!geo || !geo.state) {
      return Response.json(
        {
          error: hasCoords
            ? "We couldn't match your location to a US district. Try entering your street address instead."
            : "We couldn't match that address. Try your street plus a ZIP code (e.g. \"123 Main St, 62704\") or street plus city and state."
        },
        { status: 404 }
      );
    }

    let stateLegsPromise = Promise.resolve(prefetchedStateLegs);
    if (!prefetchedStateLegs && geocodioEnabled()) {
      stateLegsPromise = hasCoords
        ? getStateLegislatorsByCoords(lat, lon)
        : getStateLegislators(address);
    }

    const [federal, stateLegs] = await Promise.all([
      getFederalReps(geo.state, geo.congressionalDistrict),
      stateLegsPromise
    ]);

    return Response.json({
      matchedAddress: geo.matchedAddress,
      state: geo.state,
      stateFullName: geo.stateFullName,
      congressionalDistrict: geo.congressionalDistrict,
      federal,
      governor: getGovernor(geo.state),
      stateDistricts: {
        senate: geo.stateSenateDistrict,
        house: geo.stateHouseDistrict
      },
      stateLegislators: stateLegs, // null when Geocodio key not configured
      ...getUpcomingElections(geo.state, geo.stateFullName)
    });
  } catch (err) {
    console.error('lookup failed:', err.message); // message only, never the address
    return Response.json(
      { error: 'Something went wrong on our end. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
