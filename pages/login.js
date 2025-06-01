// pages/login.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Analytics } from "@vercel/analytics/next"
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("Login Page: useEffect for onAuthStateChanged triggered (TESTING VERSION).");

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Login Page: onAuthStateChanged callback fired (TESTING VERSION). User object:", user);

      if (user) {
        console.log("Login Page: User detected (TESTING VERSION). UID:", user.uid);
        console.log("Login Page: SKIPPING Firestore getDoc for this test. Allowing login form to show.");
        setError("A user session was detected during initial check (Firestore check skipped for this test). Please try logging in manually if needed.");
        setIsCheckingAuth(false);
      } else {
        console.log("Login Page: No user detected (TESTING VERSION). Showing login form.");
        setIsCheckingAuth(false);
      }
    });

    return () => {
      console.log("Login Page: useEffect cleanup (TESTING VERSION).");
      unsubscribe();
    };
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log("Login Page: handleLogin - Attempting signInWithEmailAndPassword...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Login Page: handleLogin - User logged in successfully via Firebase Auth. UID:", user.uid);

      console.log("Login Page: handleLogin - Attempting to get user document from Firestore after login...");
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      console.log(
        "Login Page: handleLogin - Firestore getDocSnap after login. Exists:",
        userDocSnap.exists(),
        "Data:",
        userDocSnap.exists() ? userDocSnap.data() : 'N/A'
      );

      if (userDocSnap.exists() && userDocSnap.data().onboardingComplete) {
        console.log("Login Page: handleLogin - User onboarded, redirecting to /dashboard...");
        router.push('/dashboard');
      } else {
        console.log("Login Page: handleLogin - User NOT onboarded or doc missing, redirecting to /onboarding...");
        router.push('/onboarding');
      }
    } catch (err) {
      console.error("Login Page: handleLogin - Error during login process. Full error object:", err);
      console.error("Login Page: handleLogin - Error code:", err.code);
      console.error("Login Page: handleLogin - Error message:", err.message);

      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (err.message && err.message.includes("client is offline")) {
        setError("Failed to connect to our services. Please check your internet connection and try again. (Client offline)");
      } else if (err.message && err.message.includes("HTTP 400")) {
        setError("There was an issue communicating with our services (Error 400). Please ensure your configuration is correct and try again.");
      } else {
        setError("Failed to log in. Please try again. (" + err.message + ")");
      }
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-green-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-700 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Log In - FusionSpace</title>
      </Head>

      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-inter">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-bold text-green-600 cursor-pointer"
              onClick={() => router.push('/')}
            >
              FusionSpace 🥗
            </h1>
            <p className="text-slate-600 mt-2">Log in to your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* Error display */}
            {error && (
              <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
            )}

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  'Log In'
                )}
              </button>
            </div>
          </form>

          {/* Link to signup */}
          <p className="mt-8 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
