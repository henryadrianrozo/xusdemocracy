// Canonical site identity. Change these two lines to move domains — every
// absolute URL in the app (metadata, OG image, .ics feeds, calendar links)
// derives from here.

export const SITE_HOST = process.env.NEXT_PUBLIC_SITE_HOST || 'democracy.xusall.com';
export const SITE_URL = `https://${SITE_HOST}`;
export const SITE_NAME = 'XUsDemocracy';
export const CONTACT_EMAIL = 'xusalldevelopment@gmail.com';

// Client-side origin, so calendar links work on preview deploys and the
// legacy xusdemocracy.com domain too. Falls back to the canonical URL
// during server render.
export function currentOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return SITE_URL;
}

// webcal:// makes Apple Calendar / Outlook offer a subscription.
export function webcalUrl(stateCode) {
  return `${currentOrigin().replace(/^https?:/, 'webcal:')}/calendar/${stateCode.toLowerCase()}`;
}

export function icsUrl(stateCode) {
  return `${currentOrigin()}/calendar/${stateCode.toLowerCase()}`;
}

// Google Calendar's "add by URL" flow. Takes an https feed URL.
export function googleCalendarUrl(stateCode) {
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(icsUrl(stateCode))}`;
}
