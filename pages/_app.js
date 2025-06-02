// pages/_app.js
import '../styles/globals.css';
import { useEffect } from 'react'; // Keep for SW if needed, or remove if SW is also in AuthProvider
import { AuthProvider } from '../context/AuthContext'; // Import AuthProvider
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";

function MyApp({ Component, pageProps }) {
  // Service Worker registration can stay here, or be moved into AuthProvider if preferred,
  // or into a top-level client component in App Router.
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js')
          .then(function (registration) {
            console.log('SW registration successful, scope: ', registration.scope);
          })
          .catch(function (err) {
            console.log('SW registration failed: ', err);
          });
      });
    }
  }, []);

  return (
    <AuthProvider> {/* Wrap your entire application with AuthProvider */}
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  );
}

export default MyApp;