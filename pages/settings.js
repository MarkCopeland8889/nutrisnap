// pages/settings.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { onAuthStateChanged, deleteUser, signOut } from 'firebase/auth';
import { doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Analytics } from "@vercel/analytics/next"
export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.replace('/login'); // Not logged in
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleChangeGoals = async () => {
    if (!currentUser) return;
    // Mark onboarding as incomplete to re-trigger it, or create a separate goal editing page
    const userDocRef = doc(db, "users", currentUser.uid);
    try {
      await updateDoc(userDocRef, {
        onboardingComplete: false 
      });
      router.push('/onboarding');
    } catch (err) {
      console.error("Error trying to reset onboarding status:", err);
      setError("Could not navigate to goal settings. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    setError('');
    setSuccessMessage('');

    if (window.confirm("Are you absolutely sure you want to delete your account? This action is irreversible and will delete all your data.")) {
      if (window.confirm("Second confirmation: This will permanently delete your account and data. Continue?")) {
        setIsLoading(true);
        try {
          // 1. Delete user data from Firestore (optional, but good practice)
          const userDocRef = doc(db, "users", currentUser.uid);
          // TODO: Also delete subcollections like foodEntries. This needs a recursive delete function, often a Cloud Function.
          // For now, just deleting the main user document.
          await deleteDoc(userDocRef); 
          console.log("User Firestore document deleted.");

          // 2. Delete user from Firebase Authentication
          await deleteUser(currentUser);
          console.log("User deleted from Firebase Auth.");
          
          setSuccessMessage("Your account has been successfully deleted. We're sorry to see you go!");
          // Redirect to homepage or signup page after a delay
          setTimeout(() => {
            router.push('/'); 
          }, 3000);

        } catch (err) {
          console.error("Error deleting account:", err);
          if (err.code === 'auth/requires-recent-login') {
            setError("This is a sensitive operation and requires you to have logged in recently. Please log out and log back in, then try again.");
          } else {
            setError("Failed to delete account. " + err.message);
          }
          setIsLoading(false);
        }
      }
    }
  };
  
  if (isLoading && !successMessage) { // Show loading only if not showing success message
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-green-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-slate-700 text-lg">Loading Settings...</p>
            </div>
        </div>
    );
  }


  return (
    <>
      <Head>
        <title>Settings - NutriSnap</title>
      </Head>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 font-inter max-w-2xl">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Settings</h1>

          {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
          {successMessage && <p className="mb-4 text-sm text-green-600 bg-green-100 p-3 rounded-md">{successMessage}</p>}

          {!successMessage && currentUser && ( // Hide options if account deletion was successful
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-700 mb-2">Profile & Goals</h2>
                <p className="text-slate-600 mb-3">Need to update your weight, activity level, or primary health goal? This will re-evaluate your nutritional targets.</p>
                <button
                  onClick={handleChangeGoals}
                  className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition duration-300"
                >
                  Update Profile & Goals
                </button>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Account Deletion</h2>
                <p className="text-slate-600 mb-3">
                  This will permanently delete your NutriSnap account and all associated data, including your profile, goals, and logged meals. This action cannot be undone.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Deleting...' : 'Delete My Account Permanently'}
                </button>
                <p className="text-xs text-slate-500 mt-2">
                    Note: Deleting your account from here removes your authentication record and primary user data. For complete removal of all data including sub-collections like food entries, server-side processes are typically required.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}