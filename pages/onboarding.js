// pages/onboarding.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Analytics } from "@vercel/analytics/next"
export default function OnboardingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [sex, setSex] = useState('female');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('1.375');
  const [goal, setGoal] = useState('maintain');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().onboardingComplete) {
          router.replace('/dashboard');
        } else {
          setLoading(false);
        }
      } else {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const calculateGoals = () => {
    const numAge = parseInt(age);
    const numHeight = parseFloat(height);
    const numWeight = parseFloat(weight);
    const numActivityLevel = parseFloat(activityLevel);

    if (
      isNaN(numAge) || numAge <= 0 ||
      isNaN(numHeight) || numHeight <= 0 ||
      isNaN(numWeight) || numWeight <= 0
    ) {
      setError("Please enter valid numbers for age, height, and weight.");
      return null;
    }

    let bmr;
    if (sex === 'male') {
      bmr = (10 * numWeight) + (6.25 * numHeight) - (5 * numAge) + 5;
    } else {
      bmr = (10 * numWeight) + (6.25 * numHeight) - (5 * numAge) - 161;
    }

    const tdee = bmr * numActivityLevel;

    let dailyCalorieGoal = tdee;
    if (goal === 'lose') {
      dailyCalorieGoal = tdee - 500;
      if (sex === 'female' && dailyCalorieGoal < 1200) dailyCalorieGoal = 1200;
      if (sex === 'male' && dailyCalorieGoal < 1500) dailyCalorieGoal = 1500;
    } else if (goal === 'gain') {
      dailyCalorieGoal = tdee + 500;
    }

    dailyCalorieGoal = Math.round(dailyCalorieGoal);
    const dailyCarbGoal = Math.round((dailyCalorieGoal * 0.40) / 4);
    const dailyProteinGoal = Math.round((dailyCalorieGoal * 0.30) / 4);
    const dailyFatGoal = Math.round((dailyCalorieGoal * 0.30) / 9);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyCalorieGoal,
      dailyCarbGoal,
      dailyProteinGoal,
      dailyFatGoal,
    };
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError("No user logged in. Please try logging in again.");
      return;
    }

    const calculatedNutritionGoals = calculateGoals();
    if (!calculatedNutritionGoals) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        sex,
        age: parseInt(age),
        height: parseFloat(height),
        weight: parseFloat(weight),
        activityLevel: parseFloat(activityLevel),
        primaryGoal: goal,
        onboardingComplete: true,
        goals: calculatedNutritionGoals,
        profileUpdatedAt: new Date().toISOString(),
      }, { merge: true });

      console.log("Onboarding data saved successfully!");
      router.push('/dashboard');
    } catch (err) {
      console.error("Error saving onboarding data: ", err);
      setError("Failed to save onboarding data. Please try again. (" + err.message + ")");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-700">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Welcome to FusionSpace - Onboarding</title>
      </Head>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-inter">
        <div className="w-full max-w-lg bg-white p-8 md:p-10 rounded-xl shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-600">Welcome to FusionSpace!</h1>
            <p className="text-slate-600 mt-2">Let's set up your profile to personalize your experience.</p>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="space-y-6">
            {/* Sex */}
            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-slate-700">Sex (for BMR calculation)</label>
              <select id="sex" name="sex" value={sex} onChange={(e) => setSex(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-700">Age (years)</label>
              <input type="number" id="age" name="age" value={age} onChange={(e) => setAge(e.target.value)} required min="1" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>

            {/* Height & Weight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-slate-700">Height (cm)</label>
                <input type="number" id="height" name="height" value={height} onChange={(e) => setHeight(e.target.value)} required min="1" placeholder="e.g., 170" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-slate-700">Weight (kg)</label>
                <input type="number" id="weight" name="weight" value={weight} step="0.1" onChange={(e) => setWeight(e.target.value)} required min="1" placeholder="e.g., 65.5" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label htmlFor="activityLevel" className="block text-sm font-medium text-slate-700">Workout Activity Level</label>
              <select id="activityLevel" name="activityLevel" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                <option value="1.2">Sedentary (little or no exercise)</option>
                <option value="1.375">Lightly Active (light exercise/sports 1-3 days/week)</option>
                <option value="1.55">Moderately Active (moderate exercise/sports 3-5 days/week)</option>
                <option value="1.725">Very Active (hard exercise/sports 6-7 days/week)</option>
                <option value="1.9">Extra Active (very hard exercise/physical job & exercise 2x/day)</option>
              </select>
            </div>

            {/* Primary Goal */}
            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-slate-700">Primary Goal</label>
              <select id="goal" name="goal" value={goal} onChange={(e) => setGoal(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Weight</option>
              </select>
            </div>

            {/* Error Display */}
            {error && (
              <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Save Profile & See Goals'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
