import { voteGovUrl } from './states';
import { PRIMARIES_2026 } from './primaries';

// Election data: 2026 primaries per state (NCSL) + the federal general.
// Sources are statutory but subject to change — we always link users to
// their official state election office to verify.

const GENERAL_2026 = {
  date: '2026-11-03',
  label: '2026 General Election (Midterms)',
  description:
    'All 435 U.S. House seats, 33+ U.S. Senate seats, most governorships, and thousands of state legislative seats.'
};

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
      description: null
    })),
    { name: GENERAL_2026.label, date: GENERAL_2026.date, description: GENERAL_2026.description }
  ];

  const upcoming = events
    .map((e) => ({ ...e, daysUntil: daysUntil(e.date) }))
    .filter((e) => e.daysUntil >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);

  return {
    elections: upcoming,
    registrationUrl: stateFullName ? voteGovUrl(stateFullName) : 'https://vote.gov',
    note: 'Dates are set by state law but can change. Always verify with your official state election office.'
  };
}
