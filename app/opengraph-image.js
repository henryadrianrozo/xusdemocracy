import { ImageResponse } from 'next/og';

// Social share preview card (iMessage, Slack, X, Facebook, etc.)
export const runtime = 'edge';
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
          background: '#0a0c10',
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
          <span style={{ color: '#e2574f' }}>X</span>
          <span style={{ color: '#f5f3ee' }}>Us</span>
          <span style={{ color: '#5b8fe0' }}>Democracy</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 40,
            color: '#f5f3ee',
            fontWeight: 700
          }}
        >
          Know who represents you.
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 26,
            color: '#93a0af'
          }}
        >
          Your officials and upcoming elections in seconds. Free and nonpartisan.
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 22,
            letterSpacing: '0.14em',
            color: '#5b8fe0',
            textTransform: 'uppercase'
          }}
        >
          Connect · Inform · Empower
        </div>
      </div>
    ),
    size
  );
}
