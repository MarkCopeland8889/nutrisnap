// pages/dashboard/analytics.js
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import Head from 'next/head';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase'; // Adjust path
import Header from '../../components/Header'; // Adjust path
import Footer from '../../components/Footer'; // Adjust path

// Import Chart.js components and register necessary elements
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // Import TimeScale for time-based x-axis
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import the date adapter

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale // Register TimeScale
);

export default function AnalyticsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [userGoals, setUserGoals] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null); // Stores { entries, dailyAverages, totalDaysWithEntries, periodDays }
  const [period, setPeriod] = useState('last7days'); // 'last7days', 'last30days'
  const [error, setError] = useState('');

  const fetchAnalyticsData = useCallback(async (userId, selectedPeriod) => {
    // ... (this function remains largely the same as before)
    if (!userId) return;
    setIsLoading(true);
    setError('');
    setAnalyticsData(null);

    try {
      const endDate = new Date(); 
      let startDate = new Date();
      startDate.setHours(0,0,0,0); // Start of the day

      if (selectedPeriod === 'last7days') {
        startDate.setDate(endDate.getDate() - 6); // Get 7 distinct days including today
      } else if (selectedPeriod === 'last30days') {
        startDate.setDate(endDate.getDate() - 29); // Get 30 distinct days including today
      } else { 
        startDate.setDate(endDate.getDate() - 6); 
      }
      
      const foodEntriesRef = collection(db, "users", userId, "foodEntries");
      const q = query(
        foodEntriesRef,
        where("loggedAt", ">=", Timestamp.fromDate(startDate)),
        where("loggedAt", "<=", Timestamp.fromDate(endDate)),
        orderBy("loggedAt", "asc") // Order ascending for chart processing
      );

      const querySnapshot = await getDocs(q);
      const entries = [];
      let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
      const dailyAggregates = {}; // To group entries by day for averages

      querySnapshot.forEach((docSnap) => {
        const entry = { id: docSnap.id, ...docSnap.data() };
        entries.push(entry);
        
        const entryDateStr = entry.loggedAt?.toDate().toLocaleDateString('en-CA'); // YYYY-MM-DD for easy sorting/grouping
        if (!entryDateStr) return;

        if (!dailyAggregates[entryDateStr]) {
          dailyAggregates[entryDateStr] = { calories: 0, protein: 0, carbs: 0, fat: 0, entryCount: 0 };
        }
        dailyAggregates[entryDateStr].calories += entry.total_calories || 0;
        if (entry.macros) {
            dailyAggregates[entryDateStr].protein += entry.macros.protein_g || 0;
            dailyAggregates[entryDateStr].carbs += entry.macros.carbs_g || 0;
            dailyAggregates[entryDateStr].fat += entry.macros.fat_g || 0;
        }
        dailyAggregates[entryDateStr].entryCount += 1;
      });
      
      const numDaysWithEntries = Object.keys(dailyAggregates).length;

      if (numDaysWithEntries > 0) {
          Object.values(dailyAggregates).forEach(day => {
              totalCalories += day.calories;
              totalProtein += day.protein;
              totalCarbs += day.carbs;
              totalFat += day.fat;
          });
          setAnalyticsData({
            entries, 
            dailyAggregates, // Pass this for charting
            dailyAverages: {
              calories: Math.round(totalCalories / numDaysWithEntries),
              protein: Math.round(totalProtein / numDaysWithEntries),
              carbs: Math.round(totalCarbs / numDaysWithEntries),
              fat: Math.round(totalFat / numDaysWithEntries),
            },
            totalDaysWithEntries: numDaysWithEntries,
            periodDays: selectedPeriod === 'last7days' ? 7 : 30,
          });
      } else {
        setAnalyticsData({ entries: [], dailyAggregates: {}, dailyAverages: {calories:0, protein:0, carbs:0, fat:0}, totalDaysWithEntries: 0, periodDays: selectedPeriod === 'last7days' ? 7 : 30 });
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Could not load analytics. " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().onboardingComplete) {
          setUserGoals(userDocSnap.data().goals || {});
          // Fetch analytics data will be triggered by period change or initial load
        } else { router.replace('/onboarding'); }
      } else { router.replace('/login'); }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch data when currentUser or period changes
  useEffect(() => {
    if (currentUser) {
      fetchAnalyticsData(currentUser.uid, period);
    }
  }, [currentUser, period, fetchAnalyticsData]);


  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };
  
  const calculateAdherence = (average, goal) => { /* ... (same as before) ... */ 
    if (!goal || goal === 0) return "N/A (Goal not set)";
    if (average === null || average === undefined) return "N/A (No data)";
    const percentageDiff = Math.abs(average - goal) / goal;
    if (percentageDiff <= 0.10) return <span className="text-green-600 font-semibold">Good ({(100 - percentageDiff * 100).toFixed(0)}% close)</span>;
    if (average < goal) return <span className="text-orange-500">Below Target</span>;
    return <span className="text-red-500">Above Target</span>;
  };

  // Memoize chart data processing
  const calorieChartData = useMemo(() => {
    if (!analyticsData?.dailyAggregates || !userGoals?.dailyCalorieGoal) {
      return null;
    }
    const dailyAggregates = analyticsData.dailyAggregates;
    const labels = Object.keys(dailyAggregates).sort(); // Sorted dates YYYY-MM-DD
    const calorieData = labels.map(date => dailyAggregates[date].calories);
    const goalData = labels.map(() => userGoals.dailyCalorieGoal);

    return {
      labels: labels.map(dateStr => new Date(dateStr)), // Convert to Date objects for time scale
      datasets: [
        {
          label: 'Daily Calories Consumed',
          data: calorieData,
          borderColor: 'rgb(34, 197, 94)', // Green
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          tension: 0.1,
        },
        {
          label: 'Calorie Goal',
          data: goalData,
          borderColor: 'rgb(239, 68, 68)', // Red
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          borderDash: [5, 5], // Dashed line for goal
          tension: 0.1,
          pointRadius: 0, // No points for goal line
        },
      ],
    };
  }, [analyticsData, userGoals]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Daily Calorie Intake vs. Goal' },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM d, yyyy', // Format for tooltips
          displayFormats: {
            day: 'MMM d' // Format for x-axis labels
          }
        },
        title: { display: true, text: 'Date' }
      },
      y: {
        title: { display: true, text: 'Calories (kcal)' },
        beginAtZero: true,
      }
    }
  }), []);


  if (isLoading || !currentUser || !userGoals) { /* ... (same loading UI) ... */ 
    return ( <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4"><div className="text-center"><svg className="animate-spin h-8 w-8 text-green-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="text-slate-700 text-lg">Loading Analytics...</p></div></div> );
  }

  return (
    <>
      <Head><title>Nutrition Analytics - NutriSnap</title></Head>
      <div className="flex flex-col min-h-screen bg-slate-100 font-inter">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl">
            {/* ... (Header and Period Buttons - unchanged) ... */}
            <div className="flex flex-wrap justify-between items-center mb-6"><h1 className="text-2xl md:text-3xl font-bold text-green-600">Your Nutrition Analytics 📈</h1><button onClick={() => router.push('/dashboard')} className="text-sm text-green-600 hover:underline">&larr; Back to Dashboard</button></div>
            {error && <p className="my-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            <div className="mb-6 flex flex-wrap gap-2 items-center"><span className="text-slate-700 font-medium">View period:</span><button onClick={() => handlePeriodChange('last7days')} className={`px-3 py-1.5 text-sm rounded-md ${period === 'last7days' ? 'bg-green-600 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}>Last 7 Days</button><button onClick={() => handlePeriodChange('last30days')} className={`px-3 py-1.5 text-sm rounded-md ${period === 'last30days' ? 'bg-green-600 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}>Last 30 Days</button></div>

            {/* Calorie Intake Chart */}
            {analyticsData && calorieChartData && analyticsData.totalDaysWithEntries > 0 && (
              <div className="mb-8 p-6 border border-slate-200 rounded-lg bg-slate-50">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Daily Calorie Intake</h2>
                <div className="relative h-64 md:h-80"> {/* Set height for chart container */}
                  <Line options={chartOptions} data={calorieChartData} />
                </div>
              </div>
            )}

            {analyticsData && userGoals ? (
              <div className="space-y-6">
                {/* ... (Period Summary - unchanged from previous version) ... */}
                 <div className="p-6 border border-slate-200 rounded-lg bg-slate-50">
                  <h2 className="text-xl font-semibold text-slate-800 mb-3">Period Summary ({analyticsData.totalDaysWithEntries} days with entries / {analyticsData.periodDays} day period)</h2>
                  {analyticsData.totalDaysWithEntries > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><p className="text-slate-600">Avg. Daily Calories: <strong className="text-green-700">{analyticsData.dailyAverages.calories.toLocaleString()} kcal</strong></p><p className="text-xs text-slate-500">Goal: {userGoals.dailyCalorieGoal?.toLocaleString()} kcal - Adherence: {calculateAdherence(analyticsData.dailyAverages.calories, userGoals.dailyCalorieGoal)}</p></div>
                      <div><p className="text-slate-600">Avg. Daily Protein: <strong className="text-sky-700">{analyticsData.dailyAverages.protein}g</strong></p><p className="text-xs text-slate-500">Goal: {userGoals.dailyProteinGoal}g - Adherence: {calculateAdherence(analyticsData.dailyAverages.protein, userGoals.dailyProteinGoal)}</p></div>
                      <div><p className="text-slate-600">Avg. Daily Carbs: <strong className="text-amber-700">{analyticsData.dailyAverages.carbs}g</strong></p><p className="text-xs text-slate-500">Goal: {userGoals.dailyCarbGoal}g - Adherence: {calculateAdherence(analyticsData.dailyAverages.carbs, userGoals.dailyCarbGoal)}</p></div>
                      <div><p className="text-slate-600">Avg. Daily Fat: <strong className="text-rose-700">{analyticsData.dailyAverages.fat}g</strong></p><p className="text-xs text-slate-500">Goal: {userGoals.dailyFatGoal}g - Adherence: {calculateAdherence(analyticsData.dailyAverages.fat, userGoals.dailyFatGoal)}</p></div>
                    </div>
                  ) : ( <p className="text-slate-500 italic">No meal entries found for the selected period.</p> )}
                </div>
                {/* ... (Detailed Entries - unchanged from previous version) ... */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-3">Detailed Entries for Period:</h3>
                  {analyticsData.entries.length > 0 ? ( <ul className="space-y-2 max-h-96 overflow-y-auto">{analyticsData.entries.map(entry => ( <li key={entry.id} className="p-3 border border-slate-200 rounded bg-white text-xs"><p className="font-medium text-slate-600">{entry.loggedAt?.toDate().toLocaleDateString()} - {entry.originalTextInput || "Image Analyzed"}</p><p>🔥 Cals: {entry.total_calories || 0}, P: {entry.macros?.protein_g || 0}g, C: {entry.macros?.carbs_g || 0}g, F: {entry.macros?.fat_g || 0}g</p></li> ))}</ul> ) : ( <p className="text-slate-500 italic">No entries to display.</p> )}
                </div>
              </div>
            ) : ( !isLoading && <p className="text-slate-500 italic">No data available for the selected period, or still loading goals.</p> )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}