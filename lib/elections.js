import { voteGovUrl } from './states';

// MVP election data: the next federal general election plus official
// state links. Primaries/specials come in Phase 2 (Democracy Works or
// a maintained per-state table).
const NEXT_GENERAL = {
  name: '2026 General Election (Midterms)',
  date: '2026-11-03',
  description:
    'All 435 U.S. House seats, 33+ U.S. Senate seats, most governorships, and thousands of state legislative seats.'
};

export function getNextElection(stateFullName) {
  const electionDate = new Date(NEXT_GENERAL.date + 'T00:00:00');
  const today = new Date();
  const daysUntil = Math.ceil((electionDate - today) / (1000 * 60 * 60 * 24));

  return {
    ...NEXT_GENERAL,
    daysUntil,
    registrationUrl: stateFullName ? voteGovUrl(stateFullName) : 'https://vote.gov',
    note: 'Your state may also hold primaries or special elections before this date. Check your official state election site for the complete list.'
  };
}
