// The browser calls /api/* and /uploads/* on the web app's own origin; Next.js forwards them to the
// backend (API_URL). No CORS, and the backend URL is not baked into the bundle.
const API_URL = (process.env.API_URL || 'http://localhost:5000').replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  compress: true,
  // only the icons/charts a screen uses end up in its bundle
  experimental: { optimizePackageImports: ['lucide-react', 'recharts'] },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_URL}/api/:path*` },
      { source: '/uploads/:path*', destination: `${API_URL}/uploads/:path*` },
    ];
  },
  async headers() {
    const longCache = [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }];
    return [
      { source: '/backgrounds/:path*', headers: longCache },
      { source: '/lk.json', headers: longCache },
      { source: '/:file(logo192.png|logo512.png|favicon.png|favicon.ico)', headers: longCache },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self)' },
        ],
      },
    ];
  },
};

export default nextConfig;
