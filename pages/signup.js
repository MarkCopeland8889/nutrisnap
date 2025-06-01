// pages/signup.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link'; // Make sure Link is imported
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Header from '../components/Header'; // Import Header
import { Analytics } from "@vercel/analytics/next"
export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is signed in and tries to access signup, redirect to dashboard or onboarding
        // This check ideally should be more robust by checking if user doc and onboarding exist
        router.replace('/dashboard'); 
      } else {
        setIsCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
        onboardingComplete: false, // Set to false initially
        goals: {}, // Initialize goals object
      });

      router.push('/onboarding'); // Redirect to onboarding after successful signup
    } catch (err) {
      console.error("Signup error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please log in or use a different email.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please use at least 6 characters.");
      } else {
        setError("Failed to create account. " + err.message);
      }
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
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

  return (
    <>
      <Head>
        <title>Sign Up - NutriSnap</title>
      </Head>
      <Header /> {/* Add the header */}
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-inter">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
          <div className="text-center mb-8">
            <Link href="/" legacyBehavior>
                <a className="text-3xl font-bold text-green-600 cursor-pointer">NutriSnap 🥗</a>
            </Link>
            <p className="text-slate-600 mt-2">Create your free account.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {/* Email, Password, Confirm Password inputs as before... */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
             <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            {error && (<p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>)}
            
            {/* Agreement Text */}
            <p className="text-xs text-slate-500 text-center pt-1">
              By signing up, you agree to our <Link href="/terms" legacyBehavior><a className="underline hover:text-green-600">Terms of Service</a></Link>.
            </p>

            <div>
              <button type="submit" disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>
          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" legacyBehavior><a className="font-medium text-green-600 hover:text-green-500">Log in</a></Link>
          </p>
        </div>
      </div>
    </>
  );
}