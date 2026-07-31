import { SITE_NAME } from '@/lib/site';

// Web app manifest, served at /manifest.webmanifest. Makes the site
// installable to a phone home screen and gives search engines a second,
// structured statement of what it is called.
export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: `${SITE_NAME}: Know Who Represents You`,
    short_name: SITE_NAME,
    description:
      'Enter your address and see your elected officials, your upcoming elections, and your voter registration deadline. Free and nonpartisan.',
    start_url: '/',
    display: 'standalone',
    // Light is the default theme, so the install splash matches --bg from
    // app/globals.css rather than the dark palette used by the icons.
    background_color: '#faf8f4',
    theme_color: '#faf8f4',
    categories: ['government', 'education', 'news'],
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180' }
    ]
  };
}
