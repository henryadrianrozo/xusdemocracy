import { voteGovUrl } from './states';
import { pollingPlaceUrl } from './pollingplace';
import { PRIMARIES_2026 } from './primaries';
import { generalElectionDate } from './legislatures';

// Election data: 2026 primaries per state (NCSL) + the federal general.
// Sources are statutory but subject to change, so we always link users to
// their official state election office to verify.

// General elections are set by federal statute (the Tuesday after the first
// Monday in November), so they can be computed rather than hand-entered. That
// is what keeps the site from emptying out after 3 November 2026. Primary
// dates are different: each state sets its own, and the 2028 ones are not
// published yet, so none are listed. Silence is honest, a guessed date is not.
export const GENERALS = [
  {
    year: 2026,
    label: '2026 General Election (Midterms)',
    description:
      'All 435 U.S. House seats, 33+ U.S. Senate seats, most governorships, and thousands of state legislative seats.',
    why: 'Called the midterms because they fall in the middle of a president’s four year term. The presidency is not on this ballot. Control of Congress is.'
  },
  {
    year: 2028,
    label: '2028 General Election (Presidential)',
    description:
      'The presidency, all 435 U.S. House seats, about a third of the U.S. Senate, and many state and local offices.',
    why: 'A presidential election comes every four years. The presidency is on the ballot, and a new Congress is elected with it.'
  }
].map((g) => ({ ...g, date: isoDate(generalElectionDate(g.year)) }));

function isoDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysUntil(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
}

// Returns the next few elections (today onward) for a state, soonest first.
export function getUpcomingElections(state, stateFullName, limit = 3) {
  const events = [
    ...(PRIMARIES_2026[state] || []).map((e) => ({
      name: e.label,
      date: e.date,
      description: e.description ?? null
    })),
    ...GENERALS.map((g) => ({
      name: g.label,
      date: g.date,
      description: g.description,
      why: g.why
    }))
  ];

  const upcoming = events
    .map((e) => ({ ...e, daysUntil: daysUntil(e.date) }))
    .filter((e) => e.daysUntil >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);

  return {
    elections: upcoming,
    registrationUrl: stateFullName ? voteGovUrl(stateFullName) : 'https://vote.gov',
    pollingPlaceUrl: pollingPlaceUrl(state),
    note: 'Dates are set by state law but can change. Always verify with your official state election office.'
  };
}
