import { geocodeAddress, geocodeCoords } from '@/lib/census';
import { getFederalReps } from '@/lib/federal';
import {
  getStateLegislators,
  getStateLegislatorsByCoords,
  geocodioEnabled
} from '@/lib/geocodio';
import { getNextElection } from '@/lib/elections';

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
      return Response.json({ error: 'Please enter a full street address.' }, { status: 400 });
    }

    const geo = hasCoords ? await geocodeCoords(lat, lon) : await geocodeAddress(address);
    if (!geo || !geo.state) {
      return Response.json(
        {
          error: hasCoords
            ? "We couldn't match your location to a US district. Try entering your street address instead."
            : "We couldn't match that address. Try adding your city and state (e.g. \"123 Main St, Springfield, IL\")."
        },
        { status: 404 }
      );
    }

    let stateLegsPromise = Promise.resolve(null);
    if (geocodioEnabled()) {
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
      stateDistricts: {
        senate: geo.stateSenateDistrict,
        house: geo.stateHouseDistrict
      },
      stateLegislators: stateLegs, // null when Geocodio key not configured
      election: getNextElection(geo.stateFullName)
    });
  } catch (err) {
    console.error('lookup failed:', err.message); // message only — never the address
    return Response.json(
      { error: 'Something went wrong on our end. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
