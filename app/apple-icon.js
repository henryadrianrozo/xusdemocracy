import { ImageResponse } from 'next/og';

// Home-screen icon for iOS, which does not accept the SVG favicon. Generated
// rather than committed as a binary, the same way opengraph-image.js is, so
// the palette lives in code and there is no asset to regenerate by hand.
//
// Renders the same courthouse mark as app/icon.svg. satori (the renderer
// behind ImageResponse) handles raw <svg> children unevenly, so the mark is
// drawn once as a data URI and dropped in as an <img>, scaled up from the
// favicon's 64x64 to fill the 180x180 box. Keep the two markups in sync by
// hand; there is no shared source because one is a static file convention
// and the other a generated route.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const MARK = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    '<rect width="64" height="64" rx="14" fill="#0A84FF"/>' +
    '<polygon points="32,12 50,26 14,26" fill="#ffffff"/>' +
    '<rect x="16" y="30" width="6" height="20" fill="#ffffff"/>' +
    '<rect x="29" y="30" width="6" height="20" fill="#ffffff"/>' +
    '<rect x="42" y="30" width="6" height="20" fill="#ffffff"/>' +
    '<rect x="12" y="50" width="40" height="4" fill="#ffffff"/>' +
    '<rect x="10" y="56" width="44" height="6" fill="#FF3B30"/>' +
  '</svg>'
);

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex'
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/svg+xml,${MARK}`}
          width={180}
          height={180}
          alt=""
        />
      </div>
    ),
    size
  );
}
