// pages/index.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function HomePage() {
  // State to hold the event object for the PWA install prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  // State to control the visibility of our custom "Download App" button
  const [showInstallButton, setShowInstallButton] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // This effect runs once when the component mounts
    const handleBeforeInstallPrompt = (e) => {
      console.log('`beforeinstallprompt` event was fired by the browser.');
      // Prevent the browser's default mini-infobar (primarily on mobile Chrome)
      e.preventDefault();
      // Stash the event so it can be triggered later by our button
      setDeferredPrompt(e);
      // Show our custom "Download App" button
      setShowInstallButton(true);
    };

    // Listen for the 'beforeinstallprompt' event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is already running in standalone (PWA) mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      console.log('App is already in standalone mode, hiding install button.');
      setShowInstallButton(false); // Don't show button if already installed/standalone
    }
    
    // Cleanup: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []); // Empty dependency array means this effect runs only once

  // Function to handle the click on our "Download App" button
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // This shouldn't happen if the button is visible, but as a safeguard
      console.log('Deferred prompt not available.');
      alert("App installation is not available at this moment. Please try again later or check your browser settings.");
      return;
    }
    
    console.log('Showing PWA install prompt...');
    // Show the browser's PWA install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, so clear it. It can only be used once.
    setDeferredPrompt(null);
    // Hide our custom button as the prompt has been shown
    setShowInstallButton(false);
  };

  const handleTryToolClick = () => {
    router.push('/tool'); // Navigate to the tool page
  };

  return (
    <>
      <Head>
        <title>NutriSnap - AI Food Scanner & Nutrition Planner</title>
        <meta name="description" content="Set nutrition goals, get a personalized nutrition plan, and use our AI-powered food scanner. NutriSnap food scanner engine is 93.7% accurate." />
        {/* Ensure your manifest link is in _document.js or here if preferred */}
        {/* <link rel="manifest" href="/manifest.json" /> */}
      </Head>
      <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 flex flex-col items-center justify-center font-inter">
        <header className="w-full max-w-3xl text-center mb-10 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-green-600 mb-3">
            NutriSnap 🥗
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-2">
            Your AI-powered nutrition companion.
          </p>
          <p className="text-md sm:text-lg text-slate-500">
            NutriSnap's food scanner engine is <strong className="text-green-600">93.7% accurate</strong> according to our tests.
          </p>
        </header>

        <main className="w-full max-w-md bg-white text-slate-800 p-6 sm:p-10 rounded-xl shadow-xl text-center">
          <div className="mb-8">
            <p className="text-lg text-slate-700 mb-3">
              Set nutrition goals and get your personalized nutrition plan!
            </p>
            {/* This is the "Download App" button that activates the PWA install prompt */}
            {/* It will only be visible if 'showInstallButton' is true */}
            {showInstallButton && (
              <button
                onClick={handleInstallClick}
                className="w-full bg-green-500 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 text-lg mb-4"
              >
                Download App 📲
              </button>
            )}
            {/* Fallback text if the custom button isn't shown (e.g., on iOS or if prompt not available) */}
            {!showInstallButton && (
                 <p className="text-sm text-slate-500 mb-4">
                   (App can be installed via your browser's 'Add to Home Screen' option if available)
                 </p>
            )}
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-500 font-medium">OR</span>
            </div>
          </div>

          <div>
            <p className="text-lg text-slate-700 mb-3">
              First, take our advanced food scanner for a spin!
            </p>
            <button
              onClick={handleTryToolClick}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-5 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-300 ease-in-out text-lg"
            >
              Try Our Tool 🔬
            </button>
          </div>
        </main>

        <footer className="w-full max-w-3xl text-center mt-12 pb-8 px-4">
          <p className="text-xs text-slate-500">
            By using NutriSnap, you agree to our {' '}
            <a href="/tos" className="underline hover:text-green-600">Terms of Service</a> and {' '}
            <a href="/privacy" className="underline hover:text-green-600">Privacy Policy</a>.
            <br />
            &copy; {new Date().getFullYear()} NutriSnap. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
