// pages/dashboard/edit-meal/[mealId].js
import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase'; // Adjust path: up three levels
import { useAuth } from '../../../context/AuthContext'; // Adjust path: up three levels
import Header from '../../../components/Header'; // Adjust path
import Footer from '../../../components/Footer'; // Adjust path

export default function EditMealPage() {
  const router = useRouter();
  const { mealId } = router.query; // Get mealId from the URL
  const { currentUser, isLoadingAuth } = useAuth();

  const [mealData, setMealData] = useState(null);
  const [formData, setFormData] = useState({
    originalTextInput: '',
    total_calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    ingredients: '', // Will be a comma-separated string for editing
    warnings: '',    // Will be a comma-separated string for editing
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMealData = useCallback(async () => {
    if (!currentUser || !mealId) return;
    setIsLoading(true);
    setError('');
    try {
      const mealDocRef = doc(db, "users", currentUser.uid, "foodEntries", mealId);
      const mealDocSnap = await getDoc(mealDocRef);

      if (mealDocSnap.exists()) {
        const data = mealDocSnap.data();
        setMealData(data);
        setFormData({
          originalTextInput: data.originalTextInput || '',
          total_calories: data.total_calories || '',
          protein_g: data.macros?.protein_g || '',
          carbs_g: data.macros?.carbs_g || '',
          fat_g: data.macros?.fat_g || '',
          ingredients: (data.ingredients || []).join(', '),
          warnings: (data.warnings || []).join(', '),
        });
      } else {
        setError("Meal not found or you don't have permission to edit it.");
      }
    } catch (err) {
      console.error("Error fetching meal data:", err);
      setError("Failed to load meal data. " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, mealId]);

  useEffect(() => {
    if (!isLoadingAuth && !currentUser) {
      router.replace('/login');
    } else if (currentUser && mealId) {
      fetchMealData();
    }
  }, [currentUser, isLoadingAuth, mealId, router, fetchMealData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateMeal = async (e) => {
    e.preventDefault();
    if (!currentUser || !mealId) return;

    setError('');
    setSuccess('');
    setIsUpdating(true);

    try {
      const updatedData = {
        originalTextInput: formData.originalTextInput,
        total_calories: parseFloat(formData.total_calories) || 0,
        macros: {
          protein_g: parseFloat(formData.protein_g) || 0,
          carbs_g: parseFloat(formData.carbs_g) || 0,
          fat_g: parseFloat(formData.fat_g) || 0,
        },
        ingredients: formData.ingredients.split(',').map(item => item.trim()).filter(item => item),
        warnings: formData.warnings.split(',').map(item => item.trim()).filter(item => item),
        updatedAt: new Date().toISOString(),
      };

      const mealDocRef = doc(db, "users", currentUser.uid, "foodEntries", mealId);
      await updateDoc(mealDocRef, updatedData);

      setSuccess("Meal updated successfully! Redirecting to dashboard...");
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      console.error("Error updating meal:", err);
      setError("Failed to update meal. " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoadingAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-green-600 mx-auto mb-3" />
          <p className="text-slate-700 text-lg">Loading Meal Data...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  if (error && !mealData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <p className="text-red-500 bg-red-100 p-4 rounded-md">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">Back to Dashboard</button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Meal - Fusionspace</title>
      </Head>
      <div className="flex flex-col min-h-screen bg-slate-100 font-inter">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-green-600">Edit Logged Meal</h1>
              <button onClick={() => router.back()} className="text-sm text-green-600 hover:underline">← Back</button>
            </div>

            {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            {success && <p className="mb-4 text-sm text-green-600 bg-green-100 p-3 rounded-md">{success}</p>}

            {mealData && (
              <form onSubmit={handleUpdateMeal} className="space-y-6">
                <div>
                  <label htmlFor="originalTextInput" className="block text-sm font-medium text-slate-700">Description / Food Name</label>
                  <input type="text" name="originalTextInput" id="originalTextInput" value={formData.originalTextInput} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                </div>

                <div>
                  <label htmlFor="total_calories" className="block text-sm font-medium text-slate-700">Total Calories (kcal)</label>
                  <input type="number" name="total_calories" id="total_calories" value={formData.total_calories} onChange={handleChange} step="0.1"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                </div>

                <fieldset className="border p-4 rounded-md border-slate-300">
                  <legend className="text-sm font-medium text-slate-700 px-1">Macros</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                    <div>
                      <label htmlFor="protein_g" className="block text-xs font-medium text-slate-600">Protein (g)</label>
                      <input type="number" name="protein_g" id="protein_g" value={formData.protein_g} onChange={handleChange} step="0.1"
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="carbs_g" className="block text-xs font-medium text-slate-600">Carbs (g)</label>
                      <input type="number" name="carbs_g" id="carbs_g" value={formData.carbs_g} onChange={handleChange} step="0.1"
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="fat_g" className="block text-xs font-medium text-slate-600">Fat (g)</label>
                      <input type="number" name="fat_g" id="fat_g" value={formData.fat_g} onChange={handleChange} step="0.1"
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm" />
                    </div>
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="ingredients" className="block text-sm font-medium text-slate-700">Ingredients (comma-separated)</label>
                  <textarea name="ingredients" id="ingredients" value={formData.ingredients} onChange={handleChange} rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="e.g., chicken breast, olive oil, salt, pepper"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="warnings" className="block text-sm font-medium text-slate-700">Warnings (comma-separated)</label>
                  <textarea name="warnings" id="warnings" value={formData.warnings} onChange={handleChange} rows="2"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="e.g., high sodium, contains soy"
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating Meal...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
