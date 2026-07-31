import { SITE_URL } from '@/lib/site';

// Crawl policy. Next serves this at /robots.txt.
//
// The site wants to be found, by search engines and by AI assistants alike, so
// the default is open. Only three paths are closed, and none of them for
// secrecy:
//
//   /api/       a POST-only endpoint. Nothing to index, and every crawl of it
//               spends a Geocodio lookup from a 2,500/day tier.
//   /calendar/  the .ics feeds. They are text/calendar, not pages.
//   /officials  personal to one address and rendered entirely client side, so
//               a crawler sees an empty shell. Also noindex via metadata in
//               app/officials/layout.js, which is the directive that actually
//               removes it from an index; this only saves the crawl.
export const dynamic = 'force-static';

// Named explicitly rather than left to the wildcard. Google-Extended and
// Applebot-Extended are the two that genuinely need it: they are AI-training
// tokens that carry no search behaviour, so listing them with an allow is a
// deliberate statement rather than a formality. The rest are already covered
// by User-agent: *, and are spelled out so the policy is readable at a glance.
const AI_AGENTS = [
  'Google-Extended',
  'Applebot-Extended',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'CCBot',
  'meta-externalagent',
  'Amazonbot',
  'DuckAssistBot',
  'Bingbot'
];

const DISALLOW = ['/api/', '/calendar/', '/officials'];

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: AI_AGENTS, allow: '/', disallow: DISALLOW }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
