import { FIPS_TO_STATE, voteGovUrl } from '@/lib/states';
import { SITE_HOST, SITE_URL } from '@/lib/site';
import { PRIMARIES_2026 } from '@/lib/primaries';
import { GENERALS } from '@/lib/elections';

// Per-state election calendar feed (.ics). Users subscribe once
// (webcal:// on Apple, "From URL" in Google Calendar) and their own
// calendar app delivers election reminders, with no accounts and no push
// infrastructure. Includes the state's 2026 primaries (NCSL data)
// and, for each general election on record, a one-week-out reminder and Election Day.

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

// RFC 5545 (3.3.11) requires backslash, comma, and semicolon to be escaped in
// TEXT values, or a strict parser treats them as structural characters --
// the general-election descriptions below contain commas, which would
// otherwise be read as value separators. Order matters: backslash first, so
// escaping the other two doesn't double-escape the backslash it just added.
function escapeIcsText(text) {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;');
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
      description: `${e.label} in ${fullName}. Polls are open today. Check your ballot before you go!`
    })),
    ...GENERALS.flatMap((g) => {
      const day = g.date.replace(/-/g, '');
      const week = new Date(g.date + 'T00:00:00');
      week.setDate(week.getDate() - 7);
      const weekBefore = `${week.getFullYear()}${String(week.getMonth() + 1).padStart(2, '0')}${String(week.getDate()).padStart(2, '0')}`;
      const long = new Date(g.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      return [
        {
          uid: `${g.year}-general-reminder`,
          date: weekBefore,
          summary: '🗳️ One week to Election Day! Make your voting plan',
          description: `The ${g.year} General Election is ${long}. Take some time this week to look up who and what is on your ballot. Find your officials at ${SITE_URL}`
        },
        {
          uid: `${g.year}-general`,
          date: day,
          summary: `🇺🇸 Election Day: ${g.year} General Election`,
          description: `${g.description} Polls are open today. Go vote!`
        }
      ];
    })
  ].sort((a, b) => a.date.localeCompare(b.date));

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//XUsDemocracy//Election Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(`${fullName} Elections (XUsDemocracy)`)}`,
    `X-WR-CALDESC:${escapeIcsText('Primary and general election dates and reminders. Dates per NCSL and official sources; always verify with your state election office. Free and nonpartisan.')}`,
    'REFRESH-INTERVAL;VALUE=DURATION:P1W'
  ];

  for (const ev of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.uid}-${code.toLowerCase()}@${SITE_HOST}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART;VALUE=DATE:${ev.date}`,
      `DTEND;VALUE=DATE:${icsDate(ev.date)}`,
      `SUMMARY:${escapeIcsText(ev.summary)}`,
      `DESCRIPTION:${escapeIcsText(`${ev.description} Register or check your registration: ${registerUrl}`)}`,
      `URL:${SITE_URL}`,
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
