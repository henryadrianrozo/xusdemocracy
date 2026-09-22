import { ImageResponse } from 'next/og';

// Social share preview card (iMessage, Slack, X, Facebook, Instagram, etc.)
//
// Deliberately NOT `runtime = 'edge'`. Edge opts the route out of static
// generation, so the image was being rendered on every request. Social
// crawlers are impatient and some give up rather than wait, which means a
// link preview that intermittently does not appear. Without it, this is
// prerendered once at build time and served as a static file.
//
// Light palette, matching the page's own light-theme default (`--bg`,
// `--text`, `--muted`, `--red`, `--blue` in app/globals.css) rather than the
// dark-theme colors this card used to hardcode. The card was dark while the
// page it opens is beige, which read as a mismatch on every share.
export const alt = 'XUsDemocracy: Know who represents you';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#faf8f4',
          fontFamily: 'Helvetica, Arial, sans-serif'
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: '-0.02em'
          }}
        >
          <span style={{ color: '#FF3B30' }}>X</span>
          <span style={{ color: '#1c2130' }}>Us</span>
          <span style={{ color: '#0A84FF' }}>Democracy</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 40,
            color: '#1c2130',
            fontWeight: 700
          }}
        >
          Know who represents you.
        </div>
        {/* Same sentence as SHARE_DESCRIPTION in app/layout.js, so the image
            and the text beneath it in a share preview agree. */}
        <div
          style={{
            marginTop: 18,
            fontSize: 26,
            color: '#5c6370',
            textAlign: 'center',
            maxWidth: 820
          }}
        >
          Enter your address and see your elected officials, elections, and voter
          registration info.
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 24,
            fontWeight: 600,
            color: '#1c2130'
          }}
        >
          Keep your representatives accountable.
        </div>
      </div>
    ),
    size
  );
}
