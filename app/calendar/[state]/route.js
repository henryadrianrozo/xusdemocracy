import { FIPS_TO_STATE, voteGovUrl } from '@/lib/states';
import { PRIMARIES_2026 } from '@/lib/primaries';

// Per-state election calendar feed (.ics). Users subscribe once
// (webcal:// on Apple, "From URL" in Google Calendar) and their own
// calendar app delivers election reminders — no accounts, no push
// infrastructure. Includes the state's 2026 primaries (NCSL data),
// a one-week-out reminder, and the November general election.

function icsDate(yyyymmdd) {
  // All-day event: DTEND is the following day per RFC 5545.
  const y = +yyyymmdd.slice(0, 4);
  const m = +yyyymmdd.slice(4, 6) - 1;
  const d = +yyyymmdd.slice(6, 8);
  const next = new Date(Date.UTC(y, m, d + 1));
  const pad = (n) => String(n).padStart(2, '0');
  return `${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`;
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function GET(request, { params }) {
  const code = params.state?.replace(/\.ics$/i, '').toUpperCase();
  const entry = Object.values(FIPS_TO_STATE).find(([abbr]) => abbr === code);
  if (!entry) {
    return new Response('Unknown state. Use a two-letter code, e.g. /calendar/ca', { status: 404 });
  }
  const [, fullName] = entry;
  const registerUrl = voteGovUrl(fullName);

  const events = [
    ...(PRIMARIES_2026[code] || []).map((e) => ({
      uid: `2026-${slug(e.label)}`,
      date: e.date.replace(/-/g, ''),
      summary: `🗳️ ${fullName}: ${e.label}`,
      description: `${e.label} in ${fullName}. Polls are open today — check your ballot before you go.`
    })),
    {
      uid: '2026-general-reminder',
      date: '20261027',
      summary: '🗳️ One week to Election Day — make your voting plan',
      description:
        'The 2026 General Election is Tuesday, November 3. Take some time this week to look up who and what is on your ballot. Find your officials at https://xusdemocracy.com'
    },
    {
      uid: '2026-general',
      date: '20261103',
      summary: '🇺🇸 Election Day — 2026 General Election',
      description:
        'All 435 U.S. House seats, 33+ U.S. Senate seats, most governorships, and thousands of state legislative seats. Polls are open today — go vote!'
    }
  ].sort((a, b) => a.date.localeCompare(b.date));

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//XUsDemocracy//Election Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${fullName} Elections — XUsDemocracy`,
    'X-WR-CALDESC:Primary and general election dates and reminders. Dates per NCSL and official sources; always verify with your state election office. Free and nonpartisan.',
    'REFRESH-INTERVAL;VALUE=DURATION:P1W'
  ];

  for (const ev of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.uid}-${code.toLowerCase()}@xusdemocracy.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART;VALUE=DATE:${ev.date}`,
      `DTEND;VALUE=DATE:${icsDate(ev.date)}`,
      `SUMMARY:${ev.summary}`,
      `DESCRIPTION:${ev.description} Register or check your registration: ${registerUrl}`,
      `URL:https://xusdemocracy.com`,
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');

  return new Response(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${code.toLowerCase()}-elections.ics"`,
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
