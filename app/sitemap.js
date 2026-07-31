import { SITE_URL } from '@/lib/site';
import { ALL_STATES, stateSlug } from '@/lib/states';

// Served at /sitemap.xml. Submit this URL to Google Search Console and Bing
// Webmaster Tools once the domain is verified.
//
// /officials is deliberately absent: it is noindex, personal to one address,
// and renders nothing without client-side state. /calendar/[state] is absent
// too, since those are .ics feeds rather than pages.
export const dynamic = 'force-static';

const CORE = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/democracy', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/states', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/calendars', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/why', changeFrequency: 'yearly', priority: 0.5 }
];

export default function sitemap() {
  const lastModified = new Date();

  const core = CORE.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority
  }));

  // One page per state and territory. These carry the registration deadlines
  // and election dates, which is the content people actually search for, so
  // they rank above everything except the home page and /democracy.
  const states = ALL_STATES.map(([, fullName]) => ({
    url: `${SITE_URL}/states/${stateSlug(fullName)}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8
  }));

  return [...core, ...states];
}
