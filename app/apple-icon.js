import { ImageResponse } from 'next/og';

// Home-screen icon for iOS, which does not accept the SVG favicon. Generated
// rather than committed as a binary, the same way opengraph-image.js is, so
// the palette lives in code and there is no asset to regenerate by hand.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0c10',
          color: '#e2574f',
          fontSize: 118,
          fontWeight: 700,
          fontFamily: 'Helvetica, Arial, sans-serif'
        }}
      >
        X
      </div>
    ),
    size
  );
}
