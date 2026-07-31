import './globals.css';
import Header from '@/components/Header';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  title: 'XUsDemocracy | Know Who Represents You',
  description:
    'Enter your address, see your elected officials and your upcoming elections. Free and nonpartisan.',
  metadataBase: new URL(SITE_URL)
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
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
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
