// Voter registration cutoffs by state, expressed as "days before any election"
// because that is how the statutes are written — which lets us compute the
// deadline for whatever election is actually coming up, not just November.
//
// Source: Center for Election Innovation & Research's 2026 deadline survey,
// retrieved July 2026. NCSL publishes the canonical table but blocks
// automated requests (403), as does vote.gov.
//
// SPOT-VERIFIED against primary government sources:
//   FL — the Florida Department of State's own notice sets the deadline for
//        the 18 Aug 2026 primary at 20 July 2026, exactly 29 days out, which
//        confirms both the FL figure and the "N days before any election"
//        model this file is built on.
//   CA — vote.gov's California page states 15 days for online and mail.
// Every remaining state is single-sourced. Treat this as guidance, not legal
// advice: the UI always links to vote.gov to confirm.
// `days` is the strictest common cutoff (mail/online). Where in-person or
// same-day rules are looser we say so rather than encoding every variant —
// we always send people to vote.gov to confirm.
//
// MAINTENANCE: statutory, so it changes only when a legislature amends
// election law. Re-check each spring before primary season.

const R = (days, opts = {}) => ({ days, ...opts });

export const REGISTRATION = {
  AL: R(15),
  AK: R(30),
  AZ: R(29),
  AR: R(29),
  CA: R(15, { sameDay: true }),
  CO: R(null, { sameDay: true }),
  CT: R(null, { sameDay: true }),
  DE: R(24),
  DC: R(21, { sameDay: true }),
  FL: R(29),
  GA: R(29),
  HI: R(null, { sameDay: true }),
  ID: R(null, { sameDay: true }),
  IL: R(28, { sameDay: true, note: 'Online registration stays open until about 16 days out.' }),
  IN: R(29),
  IA: R(15, { sameDay: true }),
  KS: R(21),
  KY: R(29),
  LA: R(29),
  ME: R(null, { sameDay: true }),
  MD: R(21, { sameDay: true }),
  MA: R(10),
  MI: R(15, { sameDay: true }),
  MN: R(21, { sameDay: true }),
  MS: R(29),
  MO: R(27),
  MT: R(null, { sameDay: true }),
  NE: R(18, { note: 'In-person registration stays open about a week longer.' }),
  NV: R(null, { sameDay: true }),
  NH: R(null, { sameDay: true }),
  NJ: R(21, { sameDay: true }),
  NM: R(28, { sameDay: true }),
  NY: R(17),
  NC: R(25, { note: 'You can also register and vote during the early-voting period.' }),
  ND: R(null, { noRegistration: true }),
  OH: R(29),
  OK: R(25),
  OR: R(21),
  PA: R(15),
  RI: R(30),
  SC: R(30),
  SD: R(15),
  TN: R(29),
  TX: R(29),
  UT: R(11, { sameDay: true }),
  VT: R(null, { sameDay: true }),
  VA: R(21, { sameDay: true }),
  WA: R(8, { sameDay: true }),
  WV: R(21),
  WI: R(20, { sameDay: true }),
  WY: R(15, { sameDay: true }),
  PR: R(50)
};

function formatDate(d) {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

// Given a state and the next election date, returns a one-line, plain-English
// registration deadline — or null when we have no rule for the state.
export function getRegistrationDeadline(state, stateFullName, electionDate) {
  const rule = REGISTRATION[state];
  if (!rule) return null;
  const name = stateFullName || state;

  if (rule.noRegistration) {
    return {
      headline: `${name} does not require voter registration.`,
      detail: 'Bring valid ID to your polling place and you can vote.'
    };
  }

  if (rule.days == null) {
    return {
      headline: `${name} offers same-day registration.`,
      detail: `You can register and vote in the same trip, right through Election Day. Registering early still saves you time at the polls.`
    };
  }

  const election = new Date(electionDate + 'T00:00:00');
  const deadline = new Date(election);
  deadline.setDate(deadline.getDate() - rule.days);
  const daysLeft = Math.ceil((deadline - new Date()) / 86400000);

  const headline = `${name} closes registration ${rule.days} days before an election — that's ${formatDate(deadline)} for the next one.`;

  let detail;
  if (daysLeft < 0) detail = 'That deadline has passed for this election, but you can still register for the ones after it.';
  else if (daysLeft === 0) detail = 'That is today. If you are not registered yet, do it now.';
  else detail = `You have ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left to register.`;

  if (rule.sameDay) {
    detail += ` ${name} also allows same-day registration, so you have a second chance at the polls.`;
  } else if (rule.note) {
    detail += ` ${rule.note}`;
  }

  return { headline, detail, deadlineDate: deadline.toISOString().slice(0, 10) };
}
