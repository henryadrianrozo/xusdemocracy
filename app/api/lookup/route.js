import { geocodeAddress, geocodeCoords } from '@/lib/census';
import { getFederalReps } from '@/lib/federal';
import {
  getStateLegislators,
  getStateLegislatorsByCoords,
  geocodeWithGeocodio,
  geocodioEnabled
} from '@/lib/geocodio';
import { getUpcomingElections } from '@/lib/elections';
import { getVotingWindow } from '@/lib/earlyvoting';
import { getGovernor } from '@/lib/governors';
import { getLegislature } from '@/lib/legislatures';
import { getNational } from '@/lib/national';
import { getRegistrationDeadline } from '@/lib/registration';
import { FIPS_TO_STATE } from '@/lib/states';

// PRIVACY: The address/coordinates are used only for this lookup. They are
// not stored, not logged, and not sent anywhere except the geocoding
// services needed to match districts (US Census Bureau; Geocodio if configured).
export async function POST(request) {
  // Parsed outside the main try/catch and never logged: a malformed body
  // throws a SyntaxError whose message embeds the start of the raw body,
  // which would otherwise reach the address-never-logged catch below.
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Please enter a street address.' }, { status: 400 });
  }

  try {
    const address = typeof body?.address === 'string' ? body.address.trim() : '';
    const { lat, lon } = body ?? {};
    const hasCoords =
      typeof lat === 'number' &&
      Number.isFinite(lat) &&
      lat >= -90 &&
      lat <= 90 &&
      typeof lon === 'number' &&
      Number.isFinite(lon) &&
      lon >= -180 &&
      lon <= 180;

    if (!hasCoords && (!address || address.length < 5)) {
      return Response.json({ error: 'Please enter a street address.' }, { status: 400 });
    }

    // A Census outage throws rather than returning null (see lib/census.js),
    // which used to escape straight to the outer catch and skip the Geocodio
    // fallback below entirely -- exactly when that fallback is supposed to
    // matter. Catching it here and falling through to `geo = null` lets the
    // existing `(!geo || !geo.state)` fallback check handle it like any other
    // no-match.
    let geo = null;
    try {
      geo = hasCoords ? await geocodeCoords(lat, lon) : await geocodeAddress(address);
    } catch (err) {
      console.error('census geocode failed:', err.message);
      geo = null;
    }
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
        ? getStateLegislatorsByCoords(lat, lon, geo.state)
        : getStateLegislators(address, geo.state);
    }

    const [federal, stateLegs] = await Promise.all([
      getFederalReps(geo.state, geo.congressionalDistrict),
      stateLegsPromise
    ]);

    const elections = getUpcomingElections(geo.state, geo.stateFullName);

    return Response.json({
      matchedAddress: geo.matchedAddress,
      state: geo.state,
      stateFullName: geo.stateFullName,
      congressionalDistrict: geo.congressionalDistrict,
      federal,
      national: getNational(),
      governor: getGovernor(geo.state),
      legislature: getLegislature(geo.state),
      stateDistricts: {
        senate: geo.stateSenateDistrict,
        house: geo.stateHouseDistrict
      },
      stateLegislators: stateLegs, // null when Geocodio key not configured
      ...elections,
      registrationDeadline: getRegistrationDeadline(
        geo.state,
        geo.stateFullName,
        elections.elections
      ),
      votingWindow: getVotingWindow(
        geo.state,
        geo.stateFullName,
        elections.elections[0]?.date
      )
    });
  } catch (err) {
    console.error('lookup failed:', err.message); // message only, never the address
    return Response.json(
      { error: 'Something went wrong on our end. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
