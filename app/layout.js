import './globals.css';
import Header from '@/components/Header';
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from '@/lib/site';

const DESCRIPTION =
  'Enter your address and see your elected officials, your upcoming elections, and your voter registration deadline. Free, nonpartisan, and your address is never stored.';

export const metadata = {
  // The template gives every child page a distinct title without repeating the
  // brand by hand. Pages set a bare `title` and get "Thing | XUsDemocracy".
  title: {
    default: 'XUsDemocracy | Know Who Represents You',
    template: `%s | ${SITE_NAME}`
  },
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    url: SITE_URL,
    title: 'XUsDemocracy | Know Who Represents You',
    description: DESCRIPTION
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XUsDemocracy | Know Who Represents You',
    description: DESCRIPTION
  },
  // Read from the environment so no placeholder token is ever committed.
  // Add both in Vercel after verifying the domain in Google Search Console and
  // Bing Webmaster Tools, then redeploy. Until then, neither tag is emitted.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
      : undefined
  }
};

// Structured data for the whole site. This is what lets a search engine or an
// assistant state what XUsDemocracy is rather than guessing from the copy.
// Page-specific schemas live on the pages themselves.
const siteSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      email: CONTACT_EMAIL,
      description: DESCRIPTION,
      parentOrganization: { '@type': 'Organization', name: 'XUsAll' },
      // Nonpartisanship is the site's central promise, so it belongs in the
      // machine-readable description too, not only in the prose.
      slogan: 'Keep your representatives accountable.',
      knowsAbout: [
        'United States elections',
        'Voter registration',
        'Elected officials',
        'Civic education'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DESCRIPTION,
      inLanguage: 'en-US',
      publisher: { '@id': `${SITE_URL}/#organization` },
      isAccessibleForFree: true
    }
  ]
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f4' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0c10' }
  ]
};

// Applies the saved theme before first paint to avoid a flash of the wrong
// theme. Light is the default; dark is opt-in via the header toggle.
const themeInit = `try{document.documentElement.dataset.theme=localStorage.getItem('xud-theme')||'light'}catch(e){document.documentElement.dataset.theme='light'}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          {/* Also the crawl path to the 52 state pages. A sitemap alone gets
              them discovered; an internal link is what gets them ranked. */}
          <nav className="footer-nav">
            <a href="/?new=1">Search</a>
            <a href="/states">States</a>
            <a href="/calendars">Election Calendars</a>
            <a href="/democracy">Democracy</a>
            <a href="/why">Who We Are</a>
          </nav>
          <p>
            <strong>Nonpartisan</strong> · No ads · No tracking · Free forever
          </p>
          <p className="footer-fine">
            Data: US Census Bureau, the public-domain{' '}
            <a href="https://github.com/unitedstates/congress-legislators" target="_blank" rel="noopener noreferrer">
              @unitedstates
            </a>{' '}
            project, OpenStates, NCSL, NGA, and official government sources. Always verify election details with your{' '}
            <a href="https://vote.gov" target="_blank" rel="noopener noreferrer">official state election office</a>.
          </p>
          <p className="footer-xsl">Created by XUsAll · Part of the XUsAll family</p>
        </footer>
      </body>
    </html>
  );
}
