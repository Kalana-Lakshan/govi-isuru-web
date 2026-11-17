import '../legacy/index.css';
import '../legacy/App.css';

export const metadata = {
  title: 'Govi Isuru | Smart farming for Sri Lanka',
  description: 'AI crop doctor, paddy yield forecasts, crop suitability, disease alerts and a farmers\' marketplace.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.png', apple: '/logo192.png' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#15803d',
};

export default function RootLayout({ children }) {
  return (
    <html lang="si">
      <body>
        <noscript>Govi Isuru needs JavaScript enabled.</noscript>
        {children}
      </body>
    </html>
  );
}
