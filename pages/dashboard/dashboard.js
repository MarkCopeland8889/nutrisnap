// pages/dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link'; // Import Link
import { useRouter } from 'next/router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import FoodAnalysisTool from '../../components/FoodAnalysisTool';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const GEMINI_API_KEY = "AIzaSyDjE6Auy8b1C89Xpb9iuIlenDhsfjbxuME"; 

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [todaysIntake, setTodaysIntake] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
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
      let newCalories = 0, newProtein = 0, newCarbs = 0, newFat = 0;
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
        calories: Math.round(newCalories), protein: Math.round(newProtein),
        carbs: Math.round(newCarbs), fat: Math.round(newFat),
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
            } else { router.replace('/onboarding'); }
          } else { router.replace('/onboarding'); }
        } catch (docError) {
          console.error("Error fetching user document:", docError);
          setError("Could not load your profile. " + docError.message);
        }
      } else { router.replace('/login'); }
      setIsLoadingPage(false);
    });
    return () => unsubscribe();
  }, [router, fetchAndSetTodaysIntake]);

  const handleLogout = async () => { /* ... (same) ... */ 
    try { await signOut(auth); router.push('/login'); }
    catch (err) { console.error("Error logging out:", err); setError("Failed to log out."); }
  };

  const handleFoodAnalysisComplete = async (analysisData, textInput, imageUrl) => { /* ... (same) ... */
    if (!currentUser || !userData) { setError("User not loaded."); return; }
    setError('');
    try {
      const foodEntriesRef = collection(db, "users", currentUser.uid, "foodEntries");
      await addDoc(foodEntriesRef, {
        ...analysisData, originalTextInput: textInput || null,
        originalImageUrl: imageUrl || null, loggedAt: serverTimestamp(), 
      });
      // alert("Meal logged successfully!"); // Consider a less intrusive notification
      await fetchAndSetTodaysIntake(currentUser.uid); 
    } catch (saveError) {
      console.error("Error saving food entry:", saveError);
      setError("Could not save meal log. " + saveError.message);
    }
  };

  const handleEditMeal = (mealId) => { alert(`Edit for meal ID: ${mealId} coming soon!`); };
  const handleDeleteMeal = async (mealId) => { /* ... (same, with deleteDoc) ... */ 
    if (!currentUser) return;
    if (window.confirm("Delete this meal log?")) {
      try {
        await deleteDoc(doc(db, "users", currentUser.uid, "foodEntries", mealId));
        await fetchAndSetTodaysIntake(currentUser.uid);
      } catch (e) { setError("Could not delete meal. " + e.message); }
    }
  };

  if (isLoadingPage || !currentUser || !userData) { /* ... (same loading UI) ... */ 
    return ( <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4"><div className="text-center"><svg className="animate-spin h-8 w-8 text-green-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="text-slate-700 text-lg">Loading Dashboard...</p></div></div> );
  }

  const goals = userData.goals || {};
  const remainingCalories = Math.max(0, (goals.dailyCalorieGoal || 0) - todaysIntake.calories);
  const remainingProtein = Math.max(0, (goals.dailyProteinGoal || 0) - todaysIntake.protein);
  const remainingCarbs = Math.max(0, (goals.dailyCarbGoal || 0) - todaysIntake.carbs);
  const remainingFat = Math.max(0, (goals.dailyFatGoal || 0) - todaysIntake.fat);

  return (
    <>
      <Head><title>Your Dashboard - NutriSnap</title></Head>
      <div className="flex flex-col min-h-screen bg-slate-100 font-inter">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-6 max-w-6xl">
          <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
            <div className="flex flex-wrap justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-1">
                    Hello, {userData.email || 'User'}!
                    </h2>
                    <p className="text-slate-600">Here&apos;s your nutrition summary for today.</p>
                </div>
                {/* Link to Analytics Page */}
                <Link href="/dashboard/analytics" legacyBehavior>
                    <a className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm mt-2 md:mt-0">
                    View Analytics & History
                    </a>
                </Link>
            </div>
            
            {error && <p className="my-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            {/* ... (summary cards - unchanged from previous version) ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center mb-6">
              <div className="p-4 bg-green-50 rounded-lg shadow"><h3 className="text-sm font-medium text-green-700">Calories Remaining</h3><p className="text-2xl font-bold text-green-800">{remainingCalories.toLocaleString()} / {goals.dailyCalorieGoal?.toLocaleString() || 0}</p><p className="text-xs text-slate-500">kcal ({todaysIntake.calories.toLocaleString()} eaten)</p></div>
              <div className="p-4 bg-sky-50 rounded-lg shadow"><h3 className="text-sm font-medium text-sky-700">Protein</h3><p className="text-2xl font-bold text-sky-800">{remainingProtein}g / {goals.dailyProteinGoal || 0}g</p><p className="text-xs text-slate-500">({todaysIntake.protein}g eaten)</p></div>
              <div className="p-4 bg-amber-50 rounded-lg shadow"><h3 className="text-sm font-medium text-amber-700">Carbs</h3><p className="text-2xl font-bold text-amber-800">{remainingCarbs}g / {goals.dailyCarbGoal || 0}g</p><p className="text-xs text-slate-500">({todaysIntake.carbs}g eaten)</p></div>
              <div className="p-4 bg-rose-50 rounded-lg shadow"><h3 className="text-sm font-medium text-rose-700">Fat</h3><p className="text-2xl font-bold text-rose-800">{remainingFat}g / {goals.dailyFatGoal || 0}g</p><p className="text-xs text-slate-500">({todaysIntake.fat}g eaten)</p></div>
            </div>
          </div>
          
          <FoodAnalysisTool 
            GEMINI_API_KEY={GEMINI_API_KEY}
            onAnalysisComplete={handleFoodAnalysisComplete} 
          />

          <div className="mt-10 p-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Today&apos;s Logged Meals 📜</h3>
            {/* ... (foodEntries list with Edit/Delete - unchanged from previous version) ... */}
            {foodEntries.length > 0 ? (
              <ul className="space-y-3">
                {foodEntries.map(entry => (
                  <li key={entry.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50 shadow-sm flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold text-slate-700 text-sm sm:text-base">
                        {entry.originalTextInput || (entry.originalImageUrl ? "Image Analyzed" : "Logged Meal")}
                        {entry.loggedAt && <span className="text-xs text-slate-500 ml-2">({entry.loggedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>}
                      </p>
                      <p className="text-xs sm:text-sm text-green-700">🔥 Calories: {entry.total_calories || 0}</p>
                      {entry.macros && ( <div className="text-xs text-slate-600"><span>P: {entry.macros.protein_g || 0}g</span><span className="mx-1">|</span><span>C: {entry.macros.carbs_g || 0}g</span><span className="mx-1">|</span><span>F: {entry.macros.fat_g || 0}g</span></div> )}
                    </div>
                    <div className="flex-shrink-0 space-x-1">
                      <button onClick={() => handleEditMeal(entry.id)} className="p-1 text-xs bg-sky-500 hover:bg-sky-600 text-white rounded shadow" title="Edit Meal">✏️</button>
                      <button onClick={() => handleDeleteMeal(entry.id)} className="p-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded shadow" title="Delete Meal">🗑️</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : ( <p className="text-slate-600 italic">No meals logged yet today.</p> )}
          </div>
          {/* ... (Ingredients to Watch - unchanged) ... */}
          <div className="mt-10 p-6 bg-white rounded-xl shadow-lg"><h3 className="text-xl font-semibold text-slate-800 mb-4">Ingredients to Watch 👀</h3><p className="text-slate-600">Future feature: We&apos;ll highlight common unwanted ingredients from your logs.</p></div>
        </main>
        <Footer />
      </div>
    </>
  );
}