// Early in-person and mail voting windows for the 2026 general election.
//
// Source: Center for Election Innovation & Research, "2026 Early and Mail
// Voting Dates", September 2026 revision. That is the same body the
// registration cutoffs in lib/registration.js came from. CEIR publishes the
// dates as a chart rather than a table, so the structured figures come from
// the spreadsheet linked off:
// https://electioninnovation.org/research/dates-for-2026-early-in-person-and-mail-voting/
//
// Unlike lib/registration.js, these are absolute dates rather than "N days
// before an election". They have to be: early-voting start dates are a mix of
// statutory offsets, fixed calendar dates, and local discretion, so there is no
// single rule to compute them from.
//
// Because they are absolute and 2026-only, getVotingWindow() returns null once
// the general has passed rather than carrying stale dates into the next cycle.
// It goes quiet instead of going wrong. See the November 2026 maintenance
// cliff in CLAUDE.md.
//
// A state missing from this table simply produces no early-voting line. That is
// deliberate: silence is honest, a guessed date is not. Puerto Rico is the one
// jurisdiction absent, because CEIR does not cover it.
//
// How each row was read from the CEIR spreadsheet (all 50 states plus DC):
//   start / end   CEIR "Required Start" and "Required End", falling back to the
//                 "Authorized" column when nothing is required.
//   countyStart   Counties may open before the required start (FL, KS, OR), so
//                 not every voter can go yet on that date.
//   startVaries   CEIR lists no required start, only an authorized one. The date
//                 is the earliest possible and depends on the county or, in
//                 Wisconsin, the city or town (IA, UT, WI).
//   ID, MI, MN, ND  start is the in-person absentee start. No excuse is needed in
//                 these states, and it is earlier than the separately listed
//                 early-voting sites. CEIR gives both. We use the earlier one
//                 because a voter can walk in and vote from that date.
//   mailStart     CEIR's statewide mail-out deadline. Where CEIR gives a range
//                 (CO, DE, FL, GA, NV, OR, UT, VT) we take the later date, so
//                 "mail ballots are going out" is only said once every county
//                 must have mailed.
//   mailExcuse    CEIR lists mail voting as excuse required, but in-person early
//                 voting needs no excuse (AR, DE, IN, KY, LA, MO, SC, TN, TX,
//                 WV). We say nothing about mail there, because a line about mail
//                 ballots would suggest anyone can vote by mail.
//   excuseRequired  AL, MS and NH need an excuse for both. Their CEIR dates are
//                 ignored on purpose.
//   An end date of 3 November means the state lets early sites stay open on
//   Election Day itself (a CEIR note).

const EV = (start, end, opts = {}) => ({ start, end, ...opts });

export const EARLY_VOTING = {
  AK: EV('2026-10-19', '2026-11-03', { mailStart: '2026-10-09' }),
  AL: EV(null, null, { excuseRequired: true }),
  AR: EV('2026-10-19', '2026-11-02', { mailStart: '2026-09-17', mailExcuse: true }),
  AZ: EV('2026-10-07', '2026-10-30', { mailStart: '2026-10-07' }),
  CA: EV('2026-10-05', '2026-11-03', { mailStart: '2026-10-05' }),
  CO: EV('2026-10-19', '2026-11-03', { mailStart: '2026-10-16' }),
  CT: EV('2026-10-19', '2026-11-01', { mailStart: '2026-10-02' }),
  DC: EV('2026-10-26', '2026-11-01', { mailStart: '2026-09-28' }),
  DE: EV('2026-10-22', '2026-11-01', { mailStart: '2026-10-30', mailExcuse: true }),
  FL: EV('2026-10-24', '2026-10-31', { countyStart: '2026-10-19', mailStart: '2026-10-01' }),
  GA: EV('2026-10-13', '2026-10-30', { mailStart: '2026-10-09' }),
  HI: EV('2026-10-20', '2026-11-03', { mailStart: '2026-10-16' }),
  IA: EV('2026-10-14', '2026-11-02', { startVaries: true, mailStart: '2026-10-14' }),
  ID: EV('2026-09-18', '2026-10-30', { mailStart: '2026-09-18' }),
  IL: EV('2026-09-24', '2026-11-02', { mailStart: '2026-09-24' }),
  IN: EV('2026-10-06', '2026-11-02', { mailStart: '2026-09-19', mailExcuse: true }),
  KS: EV('2026-10-27', '2026-11-02', { countyStart: '2026-10-14', mailStart: '2026-10-14' }),
  KY: EV('2026-10-29', '2026-10-31', { mailStart: '2026-09-18', mailExcuse: true }),
  LA: EV('2026-10-20', '2026-10-27', { mailStart: '2026-10-21', mailExcuse: true }),
  MA: EV('2026-10-17', '2026-10-30', { mailStart: '2026-10-04' }),
  MD: EV('2026-10-22', '2026-10-29', { mailStart: '2026-09-21' }),
  ME: EV('2026-10-05', '2026-10-29', { mailStart: '2026-10-05' }),
  MI: EV('2026-09-24', '2026-11-02', { mailStart: '2026-09-24' }),
  MN: EV('2026-09-18', '2026-11-02', { mailStart: '2026-09-18' }),
  MO: EV('2026-10-20', '2026-11-02', { mailStart: '2026-09-22', mailExcuse: true }),
  MS: EV(null, null, { excuseRequired: true }),
  MT: EV('2026-10-05', '2026-11-03', { mailStart: '2026-10-09' }),
  NC: EV('2026-10-15', '2026-10-31', { mailStart: '2026-09-04' }),
  ND: EV('2026-09-24', '2026-11-02', { mailStart: '2026-09-24' }),
  NE: EV('2026-10-05', '2026-11-02', { mailStart: '2026-09-28' }),
  NH: EV(null, null, { excuseRequired: true }),
  NJ: EV('2026-10-24', '2026-11-01', { mailStart: '2026-09-19' }),
  NM: EV('2026-10-06', '2026-10-31', { mailStart: '2026-10-06' }),
  NV: EV('2026-10-17', '2026-10-30', { mailStart: '2026-10-12' }),
  NY: EV('2026-10-24', '2026-11-01', { mailStart: '2026-09-18' }),
  OH: EV('2026-10-06', '2026-11-01', { mailStart: '2026-10-06' }),
  OK: EV('2026-10-28', '2026-10-31', { mailStart: '2026-09-19' }),
  OR: EV('2026-10-20', '2026-11-03', { countyStart: '2026-10-14', mailStart: '2026-10-20' }),
  PA: EV('2026-10-20', '2026-10-27', { mailStart: '2026-10-20' }),
  RI: EV('2026-10-14', '2026-11-02', { mailStart: '2026-10-16' }),
  SC: EV('2026-10-19', '2026-10-31', { mailStart: '2026-10-04', mailExcuse: true }),
  SD: EV('2026-09-18', '2026-11-02', { mailStart: '2026-09-18' }),
  TN: EV('2026-10-14', '2026-10-29', { mailStart: '2026-10-04', mailExcuse: true }),
  TX: EV('2026-10-19', '2026-10-30', { mailStart: '2026-10-05', mailExcuse: true }),
  UT: EV('2026-10-20', '2026-10-30', { startVaries: true, mailStart: '2026-10-27' }),
  VA: EV('2026-09-18', '2026-10-31', { mailStart: '2026-09-18' }),
  VT: EV('2026-09-21', '2026-11-02', { mailStart: '2026-10-01' }),
  WA: EV('2026-10-16', '2026-11-03', { mailStart: '2026-10-16' }),
  WI: EV('2026-10-20', '2026-11-01', { startVaries: true, unit: 'city or town', mailStart: '2026-09-17' }),
  WV: EV('2026-10-21', '2026-10-31', { mailStart: '2026-09-18', mailExcuse: true }),
  WY: EV('2026-10-06', '2026-11-02', { mailStart: '2026-10-06' })
};

// States that mail a ballot to every active registered voter. Their "early
// voting" story is the ballot in the mailbox, not a trip to a polling place,
// so the copy has to lead with that or it reads as irrelevant.
export const ALL_MAIL = new Set(['CA', 'CO', 'HI', 'NV', 'OR', 'UT', 'VT', 'WA', 'DC']);

function parse(iso) {
  return new Date(iso + 'T00:00:00');
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

// The at-a-glance form for the election bar, where there is room for a fact and
// not for a sentence. Every window also carries a `chip` of the same shape, so
// the bar can render them all without knowing which status it has.
function formatShort(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Describes where a state is in its voting window right now. Returns null when
// we have nothing trustworthy to say, which the UI treats as "render no line".
//
// status is one of:
//   open              early voting is happening today
//   upcoming          early voting starts on a known future date
//   closed            the window has ended but Election Day has not arrived
//   excuse-required   no no-excuse early voting in this state
export function getVotingWindow(state, stateFullName, electionDate) {
  const rule = EARLY_VOTING[state];
  if (!rule) return null;

  // Past the election this data describes, say nothing at all.
  if (electionDate && parse(electionDate) < startOfToday()) return null;

  const name = stateFullName || state;
  const allMail = ALL_MAIL.has(state);

  if (rule.excuseRequired) {
    return {
      status: 'excuse-required',
      headline: `${name} requires a reason to vote before Election Day.`,
      detail:
        'Most voters here vote on Election Day itself. Check with your election office to see whether you qualify to vote absentee.',
      chip: { fact: 'Excuse required', sub: 'No no-excuse early voting' },
      start: null,
      end: null
    };
  }

  if (!rule.start || !rule.end) return null;

  const today = startOfToday();
  const start = parse(rule.start);
  const end = parse(rule.end);
  const mailStart = rule.mailStart ? parse(rule.mailStart) : null;

  // A mail line is only honest where anyone can vote by mail. In mailExcuse
  // states it would read as an invitation the voter may not qualify for.
  const mailLine = rule.mailExcuse
    ? ''
    : allMail
      ? ` Every active registered voter in ${name} is mailed a ballot, so you can also vote without going anywhere.`
      : mailStart && mailStart <= today
        ? ' Mail ballots are already going out.'
        : '';

  // Whoever sets the local start: counties almost everywhere, cities and towns
  // in Wisconsin.
  const unit = rule.unit || 'county';

  if (today >= start && today <= end) {
    // With no required start we cannot know this voter's local one, so we say
    // it may be open rather than that it is.
    if (rule.startVaries) {
      return {
        status: 'open',
        headline: `Early voting may be open in your area now, through ${formatDate(end)}. Check with your ${unit}.`,
        detail: `You do not have to wait for Election Day.${mailLine}`,
        chip: { fact: 'May be open', sub: `through ${formatShort(end)}` },
        start: rule.start,
        end: rule.end
      };
    }
    return {
      status: 'open',
      headline: `Early voting is open in ${name} right now, through ${formatDate(end)}.`,
      detail: `You do not have to wait for Election Day.${mailLine}`,
      chip: { fact: 'Open now', sub: `through ${formatShort(end)}` },
      start: rule.start,
      end: rule.end
    };
  }

  if (today < start) {
    if (rule.startVaries) {
      return {
        status: 'upcoming',
        headline: `Early voting in ${name} can open as early as ${formatDate(start)}, depending on your ${unit}.`,
        detail: `It runs through ${formatDate(end)}.${mailLine}`,
        chip: { fact: `From ${formatShort(start)}`, sub: `through ${formatShort(end)}` },
        start: rule.start,
        end: rule.end
      };
    }

    const countyStart = rule.countyStart ? parse(rule.countyStart) : null;

    // Some counties are already open. Stay `upcoming`, because not every
    // county is, and say so.
    if (countyStart && countyStart <= today) {
      return {
        status: 'upcoming',
        headline: `Some counties in ${name} have opened early voting. Every county opens by ${formatDate(start)}.`,
        detail: `It runs through ${formatDate(end)}.${mailLine}`,
        chip: { fact: 'Opening now', sub: `all by ${formatShort(start)}` },
        start: rule.start,
        end: rule.end
      };
    }

    const countyLine = countyStart
      ? ` Some counties open as early as ${formatDate(countyStart)}.`
      : '';
    return {
      status: 'upcoming',
      headline: `Early voting in ${name} opens ${formatDate(start)}.`,
      detail: `It runs through ${formatDate(end)}.${mailLine}${countyLine}`,
      chip: { fact: `Opens ${formatShort(start)}`, sub: `through ${formatShort(end)}` },
      start: rule.start,
      end: rule.end
    };
  }

  return {
    status: 'closed',
    headline: `Early voting in ${name} has closed.`,
    detail: 'You can still vote at your polling place on Election Day.',
    chip: { fact: 'Closed', sub: 'Vote on Election Day' },
    start: rule.start,
    end: rule.end
  };
}
