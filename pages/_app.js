// pages/_app.js
import { useEffect } from 'react';
// Make sure you import your global styles if you have them, e.g.:
// import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () { // Important: run on window load
        navigator.serviceWorker.register('/sw.js') // Path to your sw.js
          .then(function (registration) {
            // Registration was successful
            console.log('Service Worker registration successful with scope: ', registration.scope);
          })
          .catch(function (err) {
            // registration failed :(
            console.log('Service Worker registration failed: ', err);
          });
      });
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;