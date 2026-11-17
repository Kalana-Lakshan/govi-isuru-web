'use client';

// The app's screens run in the browser (they use localStorage, the camera and react-router).
// Every URL is served by the catch-all page below and routed on the client by react-router.
import dynamic from 'next/dynamic';

const App = dynamic(
  async () => {
    await import('../legacy/utils/axiosSetup'); // token refresh interceptor
    return import('../legacy/App');
  },
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#15803d', fontFamily: 'sans-serif' }}>
        Govi Isuru…
      </div>
    ),
  },
);

export default function ClientApp() {
  return <App />;
}
