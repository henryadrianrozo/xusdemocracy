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
// deliberate: silence is honest, a guessed date is not.

const EV = (start, end, opts = {}) => ({ start, end, ...opts });

export const EARLY_VOTING = {
  // Opened before or on today's date, 2026-09-20.
  VA: EV('2026-09-18', '2026-10-31', { mailStart: '2026-09-18' }),
  MN: EV('2026-09-18', '2026-11-02', { mailStart: '2026-09-18' }),
  SD: EV('2026-09-18', '2026-11-02', { mailStart: '2026-09-18' }),
  NC: EV('2026-10-15', '2026-10-31', { mailStart: '2026-09-04' }),
  IL: EV('2026-09-24', '2026-11-02', { mailStart: '2026-09-24' }),

  // Excuse required to vote before Election Day.
  AL: EV(null, null, { excuseRequired: true }),
  MS: EV(null, null, { excuseRequired: true }),
  NH: EV(null, null, { excuseRequired: true })
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

  const mailLine = allMail
    ? ` Every active registered voter in ${name} is mailed a ballot, so you can also vote without going anywhere.`
    : mailStart && mailStart <= today
      ? ' Mail ballots are already going out.'
      : '';

  if (today >= start && today <= end) {
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
    return {
      status: 'upcoming',
      headline: `Early voting in ${name} opens ${formatDate(start)}.`,
      detail: `It runs through ${formatDate(end)}.${mailLine}`,
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
