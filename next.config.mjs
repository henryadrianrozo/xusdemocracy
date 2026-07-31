/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'unitedstates.github.io' },
      { protocol: 'https', hostname: 'theunitedstates.io' }
    ]
  },
  async redirects() {
    return [
      // /results was the old name for the officials page.
      { source: '/results', destination: '/officials', permanent: true }
    ];
  }
};

export default nextConfig;
