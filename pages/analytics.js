// pages/dashboard/analytics.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase'; // Adjust path if lib is elsewhere
import Header from '../components/Header'; // Adjust path
import Footer from '../components/Footer'; // Adjust path

export default function AnalyticsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // TODO: Fetch historical data for analytics
      } else {
        router.replace('/login');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <p>Loading Analytics...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Or redirect again, though useEffect should handle it
  }

  return (
    <>
      <Head>
        <title>Nutrition Analytics - NutriSnap</title>
      </Head>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold text-green-600 mb-6">Your Nutrition Analytics</h1>
            <p className="text-slate-700 mb-4">
              This section will show your nutritional trends over weeks, months, and years, helping you track your adherence to goals.
            </p>
            <div className="p-6 border border-dashed border-slate-300 rounded-lg">
              <p className="text-slate-500 text-center">
                (Analytics charts and data summaries will be displayed here - Coming Soon!)
              </p>
              <ul className="list-disc list-inside mt-4 text-slate-600">
                <li>Weekly calorie/macro averages vs. targets</li>
                <li>Monthly progress reports</li>
                <li>Long-term adherence charts</li>
                <li>Commonly logged foods and ingredients</li>
              </ul>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}