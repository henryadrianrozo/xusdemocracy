import { SITE_NAME, SITE_URL } from '@/lib/site';
import { ALL_STATES, stateSlug } from '@/lib/states';

const TITLE = 'Elections and Officials by State';
const DESCRIPTION =
  'Voter registration deadlines, upcoming election dates, U.S. senators, and governors for all 50 states, plus DC and Puerto Rico.';

// openGraph/twitter spelled out in full rather than left partial: see the
// comment in app/why/page.js for why a partial openGraph here silently drops
// the share-card image and leaves the Twitter card showing the homepage's.
export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/states' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    title: TITLE,
    description: DESCRIPTION,
    url: '/states',
    images: ['/opengraph-image']
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION
  }
};

const STATES = [...ALL_STATES].sort((a, b) => a[1].localeCompare(b[1]));

const schema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Elections and Officials by State',
  description: DESCRIPTION,
  url: `${SITE_URL}/states`,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  publisher: { '@id': `${SITE_URL}/#organization` },
  hasPart: STATES.map(([, name]) => ({
    '@type': 'WebPage',
    name: `${name} elections and officials`,
    url: `${SITE_URL}/states/${stateSlug(name)}`
  }))
};

export default function StatesIndex() {
  return (
    <div className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <section className="hero hero-compact">
        <h1>Elections and officials by state</h1>
        <p>
          Your registration deadline, your next election dates, your U.S. senators, and your
          governor. Pick a state, or{' '}
          <a href="/?new=1">search your address</a> to get your House district and state
          legislators too.
        </p>
      </section>

      <div className="calendar-grid">
        {STATES.map(([code, name]) => (
          <div key={code} className="calendar-item">
            <a className="state-link" href={`/states/${stateSlug(name)}`}>
              {name}
            </a>
          </div>
        ))}
      </div>

      <p className="feedback-note">
        Dates are set by state law and can change. Always confirm with your official state
        election office before you rely on one.
      </p>
    </div>
  );
}
