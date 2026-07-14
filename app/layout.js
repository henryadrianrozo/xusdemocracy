import './globals.css';

export const metadata = {
  title: 'XUsDemocracy — Know Who Represents You',
  description:
    'Enter your address, see your elected officials and your next election. Free, nonpartisan, and we never store your address.',
  metadataBase: new URL('https://xusdemocracy.com')
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1b2a4a'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a href="/" className="logo">
            <span className="logo-mark">★</span> XUsDemocracy
          </a>
          <nav>
            <a href="/why">Why this matters</a>
          </nav>
        </header>
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
