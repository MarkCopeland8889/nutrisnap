// pages/dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import FoodAnalysisTool from '../components/FoodAnalysisTool';
import Header from '../components/Header';
import Footer from '../components/Footer';

const GEMINI_API_KEY = "AIzaSyDjE6Auy8b1C89Xpb9iuIlenDhsfjbxuME";

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [todaysIntake, setTodaysIntake] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [error, setError] = useState('');
  const [foodEntries, setFoodEntries] = useState([]);

  const fetchAndSetTodaysIntake = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const foodEntriesRef = collection(db, "users", userId, "foodEntries");
      const q = query(
        foodEntriesRef,
        where("loggedAt", ">=", Timestamp.fromDate(startOfDay)),
        where("loggedAt", "<=", Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(q);
      let newCalories = 0;
      let newProtein = 0;
      let newCarbs = 0;
      let newFat = 0;
      const entries = [];

      querySnapshot.forEach((docSnap) => {
        const entry = { id: docSnap.id, ...docSnap.data() };
        entries.push(entry);
        newCalories += entry.total_calories || 0;
        if (entry.macros) {
          newProtein += entry.macros.protein_g || 0;
          newCarbs += entry.macros.carbs_g || 0;
          newFat += entry.macros.fat_g || 0;
        }
      });

      entries.sort((a, b) => (b.loggedAt?.toDate() || 0) - (a.loggedAt?.toDate() || 0));
      setFoodEntries(entries);

      setTodaysIntake({
        calories: Math.round(newCalories),
        protein: Math.round(newProtein),
        carbs: Math.round(newCarbs),
        fat: Math.round(newFat),
      });
    } catch (fetchError) {
      console.error("Error fetching today's food entries:", fetchError);
      setError("Could not load today's food log. " + fetchError.message);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const fetchedUserData = userDocSnap.data();
            if (fetchedUserData.onboardingComplete) {
              setUserData(fetchedUserData);
              await fetchAndSetTodaysIntake(user.uid);
            } else {
              router.replace('/onboarding');
            }
          } else {
            console.error("User document not found for logged-in user! Redirecting to onboarding.");
            router.replace('/onboarding');
          }
        } catch (docError) {
          console.error("Error fetching user document:", docError);
          setError("Could not load your profile. " + docError.message);
        }
      } else {
        router.replace('/login');
      }
      setIsLoadingPage(false);
    });
    return () => unsubscribe();
  }, [router, fetchAndSetTodaysIntake]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error("Error logging out:", err);
      setError("Failed to log out. Please try again.");
    }
  };

  const handleFoodAnalysisComplete = async (analysisData, textInput, imageUrl) => {
    if (!currentUser || !userData) {
      setError("User not loaded, cannot save entry.");
      return;
    }
    setError('');
    try {
      const foodEntriesRef = collection(db, "users", currentUser.uid, "foodEntries");
      await addDoc(foodEntriesRef, {
        ...analysisData,
        originalTextInput: textInput || null,
        originalImageUrl: imageUrl || null,
        loggedAt: serverTimestamp(),
      });
      console.log("Meal logged successfully!");
      await fetchAndSetTodaysIntake(currentUser.uid);
    } catch (saveError) {
      console.error("Error saving food entry:", saveError);
      setError("Could not save your meal log. Please try again. " + saveError.message);
    }
  };

  const handleEditMeal = (mealId) => {
    console.log("Navigating to edit meal page for ID:", mealId);
    router.push(`/dashboard/edit-meal/${mealId}`);
  };

  const handleDeleteMeal = async (mealId) => {
    if (!currentUser) return;
    if (window.confirm("Are you sure you want to delete this meal log?")) {
      try {
        await deleteDoc(doc(db, "users", currentUser.uid, "foodEntries", mealId));
        console.log("Meal deleted successfully!");
        await fetchAndSetTodaysIntake(currentUser.uid);
      } catch (deleteError) {
        console.error("Error deleting meal entry:", deleteError);
        setError("Could not delete meal. " + deleteError.message);
      }
    }
  };

  if (isLoadingPage || !currentUser || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-green-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-700 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const goals = userData.goals || {};
  const remainingCalories = Math.max(0, (goals.dailyCalorieGoal || 0) - todaysIntake.calories);
  const remainingProtein = Math.max(0, (goals.dailyProteinGoal || 0) - todaysIntake.protein);
  const remainingCarbs = Math.max(0, (goals.dailyCarbGoal || 0) - todaysIntake.carbs);
  const remainingFat = Math.max(0, (goals.dailyFatGoal || 0) - todaysIntake.fat);

  return (
    <>
      <Head>
        <title>Your Dashboard - Fusionspace</title>
      </Head>
      <div className="flex flex-col min-h-screen bg-slate-100 font-inter">
        <Header />

        <main className="flex-grow container mx-auto p-4 md:p-6 max-w-6xl">
          {/* Summary card */}
          <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-1">
                  Hello, {userData.email || currentUser.displayName || 'User'}!
                </h2>
                <p className="text-slate-600">Here's your nutrition summary for today.</p>
              </div>
              <Link href="/dashboard/analytics" legacyBehavior>
                <a className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm mt-3 sm:mt-0 transition-colors duration-150">
                  View Analytics & History 📈
                </a>
              </Link>
            </div>

            {error && (
              <p className="my-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center mb-6">
              <DashboardMetric title="Calories Remaining" value={`${remainingCalories.toLocaleString()} / ${goals.dailyCalorieGoal?.toLocaleString() || 0}`} sub={`kcal (${todaysIntake.calories.toLocaleString()} eaten)`} color="green" />
              <DashboardMetric title="Protein" value={`${remainingProtein}g / ${goals.dailyProteinGoal || 0}g`} sub={`(${todaysIntake.protein}g eaten)`} color="sky" />
              <DashboardMetric title="Carbs" value={`${remainingCarbs}g / ${goals.dailyCarbGoal || 0}g`} sub={`(${todaysIntake.carbs}g eaten)`} color="amber" />
              <DashboardMetric title="Fat" value={`${remainingFat}g / ${goals.dailyFatGoal || 0}g`} sub={`(${todaysIntake.fat}g eaten)`} color="rose" />
            </div>
          </div>

          <FoodAnalysisTool GEMINI_API_KEY={GEMINI_API_KEY} onAnalysisComplete={handleFoodAnalysisComplete} />

          {/* Meal list */}
          <MealLogSection entries={foodEntries} onEdit={handleEditMeal} onDelete={handleDeleteMeal} />

          {/* Ingredients section (coming soon) */}
          <div className="mt-10 p-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Ingredients to Watch 👀</h3>
            <p className="text-slate-600">
              As you log more meals, we'll highlight common ingredients in your diet that you might want to keep an eye on (e.g., seed oils, artificial preservatives). (Feature coming soon)
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

// Optional components for clarity
function DashboardMetric({ title, value, sub, color }) {
  return (
    <div className={`p-4 bg-${color}-50 rounded-lg shadow`}>
      <h3 className={`text-sm font-medium text-${color}-700`}>{title}</h3>
      <p className={`text-2xl font-bold text-${color}-800`}>{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function MealLogSection({ entries, onEdit, onDelete }) {
  return (
    <div className="mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">Today's Logged Meals 📜</h3>
      {entries.length > 0 ? (
        <ul className="space-y-3">
          {entries.map(entry => (
            <li key={entry.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50 shadow-sm flex flex-col sm:flex-row justify-between sm:items-start gap-2">
              <div className="flex-grow">
                <p className="font-semibold text-slate-700 text-sm sm:text-base">
                  {entry.originalTextInput || (entry.originalImageUrl ? "Image Analyzed" : "Logged Meal")}
                  {entry.loggedAt && (
                    <span className="text-xs text-slate-500 ml-2">
                      ({entry.loggedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  )}
                </p>
                <p className="text-xs sm:text-sm text-green-700">🔥 Calories: {entry.total_calories || 0}</p>
                {entry.macros && (
                  <div className="text-xs text-slate-600">
                    <span>P: {entry.macros.protein_g || 0}g</span><span className="mx-1">|</span>
                    <span>C: {entry.macros.carbs_g || 0}g</span><span className="mx-1">|</span>
                    <span>F: {entry.macros.fat_g || 0}g</span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 space-x-1 mt-2 sm:mt-0 self-start sm:self-center">
                <button onClick={() => onEdit(entry.id)} className="p-1.5 text-xs bg-sky-500 hover:bg-sky-600 text-white rounded shadow-sm" title="Edit Meal">✏️ Edit</button>
                <button onClick={() => onDelete(entry.id)} className="p-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded shadow-sm" title="Delete Meal">🗑️ Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-600 italic">No meals logged yet today. Use the tool above to add your first meal!</p>
      )}
    </div>
  );
}
