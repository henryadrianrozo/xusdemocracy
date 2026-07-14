import './globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'XUsDemocracy — Know Who Represents You',
  description:
    'Enter your address, see your elected officials and your next election. Free, nonpartisan, and we never store your address.',
  metadataBase: new URL('https://xusdemocracy.com')
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0c10'
};

// Applies the saved theme before first paint to avoid a flash of the wrong theme.
const themeInit = `try{document.documentElement.dataset.theme=localStorage.getItem('xud-theme')||'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          <p>
            <strong>We never store your address.</strong> Nonpartisan · No ads · No tracking ·
            Free forever
          </p>
          <p className="footer-fine">
            Data: US Census Bureau, the public-domain{' '}
            <a href="https://github.com/unitedstates/congress-legislators" target="_blank" rel="noopener noreferrer">
              @unitedstates
            </a>{' '}
            project, and official government sources. Always verify election details with your{' '}
            <a href="https://vote.gov" target="_blank" rel="noopener noreferrer">official state election office</a>.
          </p>
        </footer>
      </body>
    </html>
  );
}
