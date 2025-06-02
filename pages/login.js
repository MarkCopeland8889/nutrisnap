// pages/login.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
// No longer need onAuthStateChanged or getDoc directly here for initial redirect
import { auth, db } from '../lib/firebase'; // db might still be needed if handleLogin writes something
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For login button submission
  const router = useRouter();
  const { currentUser, userData, isLoadingAuth } = useAuth(); // Get global auth state

  useEffect(() => {
    console.log("Login Page: AuthContext state - isLoadingAuth:", isLoadingAuth, "currentUser:", currentUser ? currentUser.uid : null);
    if (!isLoadingAuth && currentUser) {
      // User is already logged in and initial auth check is complete
      if (userData && userData.onboardingComplete) {
        console.log("Login Page: User logged in and onboarded, redirecting to /dashboard.");
        router.replace('/dashboard');
      } else if (userData) { // User exists, but onboarding not complete
        console.log("Login Page: User logged in but NOT onboarded, redirecting to /onboarding.");
        router.replace('/onboarding');
      } else if (!userData && currentUser) {
        // This case might happen if Firestore doc is missing for an authenticated user.
        // Should ideally be handled during AuthProvider's data fetch, but as a fallback:
        console.warn("Login Page: User logged in but no Firestore data, redirecting to /onboarding as a fallback.");
        router.replace('/onboarding');
      }
    }
  }, [currentUser, userData, isLoadingAuth, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      console.log("Login Page: handleLogin - Attempting signInWithEmailAndPassword...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // const user = userCredential.user; // currentUser from context will update via onAuthStateChanged in AuthProvider
      console.log("Login Page: handleLogin - signInWithEmailAndPassword successful.");
      // AuthProvider will handle fetching userData and subsequent redirect via the useEffect above.
      // No explicit redirect here needed as the context update will trigger the useEffect.
    } catch (err) {
      console.error("Login Page: handleLogin - Error during login process:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please try again.");
      } else if (err.message && err.message.includes("client is offline")) {
        setError("Failed to connect. Please check your internet connection. (Client offline)");
      } else {
        setError("Failed to log in. Please try again. (" + err.message + ")");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show loading screen while initial auth check is happening via context
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-green-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-700 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth check is done and there's still a currentUser, the useEffect should have redirected.
  // This form will typically only show if !isLoadingAuth && !currentUser.
  if (!currentUser) {
    return (
      <>
        <Head><title>Log In - Fusionspace</title></Head>
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-inter">
          <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
            <div className="text-center mb-8">
               <h1 className="text-3xl font-bold text-green-600 cursor-pointer" onClick={() => router.push('/')}>
                  Fusionspace 🥗 {/* Assuming rename */}
              </h1>
              <p className="text-slate-600 mt-2">Log in to your account.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email input */}
              <div><label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label><input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"/></div>
              {/* Password input */}
              <div><label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"/></div>
              {error && (<p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>)}
              <div><button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">{isLoading ? ( <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ) : ( 'Log In' )}</button></div>
            </form>
            <p className="mt-8 text-center text-sm text-slate-600">Don&apos;t have an account?{' '}<button onClick={() => router.push('/signup')} className="font-medium text-green-600 hover:text-green-500">Sign up</button></p>
          </div>
        </div>
      </>
    );
  }
  // If isLoadingAuth is false AND currentUser exists, the useEffect should have redirected.
  // This return is a fallback or will be seen briefly during the redirect.
  return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p>Redirecting...</p></div>; 
}