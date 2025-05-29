// pages/tool.js
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';

// Your provided Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB_36gNzNrZlq5MjjcA_1UXz_5goDmp7-k",
  authDomain: "nutrisnap-web.firebaseapp.com",
  projectId: "nutrisnap-web",
  storageBucket: "nutrisnap-web.firebasestorage.app",
  messagingSenderId: "347079415021",
  appId: "1:347079415021:web:d657f3a1c23c81b22ea8e4",
  measurementId: "G-8C59VD2547"
};

// Your provided Gemini API Key
const GEMINI_API_KEY = "AIzaSyDjE6Auy8b1C89Xpb9iuIlenDhsfjbxuME";
const MAX_FREE_USES = 2;

// Initialize Firebase
let firebaseApp;
let analytics;

try {
    firebaseApp = initializeApp(firebaseConfig);
    isAnalyticsSupported().then(supported => {
        if (supported) {
            analytics = getAnalytics(firebaseApp);
            console.log("Firebase Analytics initialized for Tool Page");
        } else {
            console.log("Firebase Analytics is not supported in this environment.");
        }
    });
} catch (error) {
    console.error("Firebase initialization error on Tool Page:", error);
}

export default function ToolPage() {
  const [foodInput, setFoodInput] = useState('');
  const [imageFile, setImageFile] = useState(null); // For file object
  const [imageBase64, setImageBase64] = useState(''); // For base64 string
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Load usage count from localStorage
    const storedUsage = parseInt(localStorage.getItem('nutriSnapToolUsage') || '0', 10);
    setUsageCount(storedUsage);
    if (storedUsage >= MAX_FREE_USES) {
      setIsBlocked(true);
    }
  }, []);

  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('nutriSnapToolUsage', newCount.toString());
    if (newCount >= MAX_FREE_USES) {
      setIsBlocked(true);
    }
  };

  const handleImageChange = (e) => { // For gallery selection
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Store the file object
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
      setError(''); // Clear error if a new file is selected
    }
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access is not supported by your browser. 😟");
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setCameraStream(stream);
        setShowCameraModal(true);
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please ensure permissions are granted. 🚫");
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setError("Camera permission denied. Please enable it in your browser settings. ⚙️");
        }
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && cameraStream) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setImageBase64(dataUrl.split(',')[1]);

        // Create a File object from the captured image for consistency
        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                const capturedFile = new File([blob], "captured-photo.png", { type: "image/png" });
                setImageFile(capturedFile); // Set the file object
            });
        
        closeCameraModal();
        setError(''); // Clear error on successful capture
    }
  };

  const closeCameraModal = () => {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setShowCameraModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBlocked) {
      setError(`You've used all your free analyses. Please sign up for more! ✨`);
      return;
    }
    if (!foodInput && !imageBase64) {
      setError('Please describe your meal or provide an image. ✍️📸');
      return;
    }
    setError('');
    setIsLoading(true);
    setResults(null);

    const promptText = foodInput || "the food in the image";
    let parts = [{ text: `Analyze the following food: "${promptText}". Provide a detailed JSON response with: total_calories (number, estimated total for the described meal/item), macros (object with protein_g, carbs_g, fat_g in grams), ingredients (array of strings, listing primary ingredients), and warnings (array of strings, specifically noting any common seed oils like soybean, canola, sunflower, corn oil, or artificial preservatives like BHA, BHT, sodium benzoate, nitrates/nitrites if likely present based on the food type). Be as accurate as possible with calorie and macro estimations. If an image is provided, analyze the food in the image. If both text and image are provided, prioritize the image but use text for context if helpful.` }];

    if (imageBase64 && imageFile) { // Ensure imageFile is also set for mimeType
      parts.push({
        inlineData: {
          mimeType: imageFile.type || 'image/png', // Fallback mimeType
          data: imageBase64,
        },
      });
    }

    const payload = {
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error(`API request failed with status ${response.status}: ${errorData?.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        const rawJsonText = data.candidates[0].content.parts[0].text;
        try {
            const parsedResult = JSON.parse(rawJsonText);
            setResults(parsedResult);
            incrementUsage(); // Increment usage only on successful analysis
        } catch (jsonError) {
            console.error("Failed to parse JSON response from Gemini:", jsonError);
            console.error("Raw response text:", rawJsonText);
            setError("Received an invalid analysis format. The raw data was: " + rawJsonText.substring(0, 200) + "...");
            setResults(null);
        }
      } else {
        console.error('Unexpected response structure from Gemini:', data);
        setError('Failed to get a valid analysis. The response structure was unexpected.');
        setResults(null);
      }
    } catch (err) {
      console.error('Error fetching from Gemini API:', err);
      setError(`Error analyzing food: ${err.message}. Check console for more details. 🚧`);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to clear imageFile if imageBase64 is cleared (e.g. user removes image)
  useEffect(() => {
    if (!imageBase64) {
        setImageFile(null);
        if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    }
  }, [imageBase64]);


  if (isBlocked) {
    return (
      <>
        <Head>
          <title>NutriSnap Tool - Usage Limit Reached</title>
        </Head>
        <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 flex flex-col items-center justify-center font-inter text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-green-600 mb-4">Limit Reached! 😮</h1>
          <p className="text-lg text-slate-600 mb-6">
            You've used your {MAX_FREE_USES} free analyses. Thanks for trying out NutriSnap!
          </p>
          <button
            onClick={() => router.push('/signup')} // Navigate to signup page (to be created)
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-300 ease-in-out text-lg"
          >
            Sign Up for Unlimited Access ✨
          </button>
           <button
            onClick={() => router.push('/')}
            className="mt-4 text-sm text-green-600 hover:text-green-700"
          >
            Back to Homepage
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>NutriSnap - AI Food Scanner Tool</title>
        <meta name="description" content="Analyze your meals with NutriSnap's AI-powered food scanner. Get calorie counts, macro breakdowns, and ingredient insights." />
      </Head>
      <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 flex flex-col items-center font-inter">
        <header className="w-full max-w-3xl text-center my-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-green-600 mb-2 cursor-pointer" onClick={() => router.push('/')}>
            NutriSnap Tool 🔬
          </h1>
          <p className="text-md text-slate-500">
            Free uses remaining: {Math.max(0, MAX_FREE_USES - usageCount)}
          </p>
        </header>

        <main className="w-full max-w-xl bg-white text-slate-800 p-6 sm:p-8 rounded-xl shadow-xl mb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="foodInput" className="block text-sm font-medium text-slate-700 mb-1">
                Describe what you ate ✍️
              </label>
              <textarea
                id="foodInput"
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                placeholder="e.g., 'A large apple and a handful of almonds'"
                rows="3"
                className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out placeholder-slate-400"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">OR ADD AN IMAGE</span>
              </div>
            </div>
            
            <div className="space-y-3">
                <p className="block text-sm font-medium text-slate-700 -mb-1">Provide an image of your food:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={openCamera}
                        className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400 transition duration-150"
                    >
                        Capture 📸
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-150"
                    >
                        Select from Gallery 🖼️
                    </button>
                </div>
                <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden" // Hidden, triggered by button
                />
                {imageBase64 && (
                    <div className="mt-3 p-2 border border-slate-200 rounded-lg bg-slate-50 text-center">
                        <img src={`data:image/png;base64,${imageBase64}`} alt="Selected food" className="max-h-48 w-auto mx-auto rounded-md shadow-sm mb-2"/>
                        <p className="text-xs text-slate-600 truncate">{imageFile?.name || 'Captured image'}</p>
                        <button type="button" onClick={() => {setImageBase64(''); setImageFile(null);}} className="text-xs text-red-500 hover:text-red-700 mt-1">Remove image</button>
                    </div>
                )}
            </div>


            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center text-lg"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                'Snap Nutrition Info ✨'
              )}
            </button>
          </form>

          {error && <p className="mt-6 text-center text-red-600 bg-red-100 p-3 rounded-lg shadow">{error}</p>}

          {results && (
            <div className="mt-8 p-6 bg-slate-50 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-green-700 mb-5 text-center">Nutrition Analysis 📊</h2>
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-md shadow-sm">
                  <p className="text-lg"><strong className="text-slate-700">🔥 Total Calories:</strong> {results.total_calories?.toLocaleString() || 'N/A'} kcal</p>
                </div>
                <div className="p-3 bg-white rounded-md shadow-sm">
                  <h3 className="font-semibold text-slate-700 text-lg mb-1">💪 Macros:</h3>
                  <ul className="list-disc list-inside ml-4 text-slate-600 space-y-1">
                    <li>Protein: {results.macros?.protein_g || 'N/A'}g</li>
                    <li>Carbohydrates: {results.macros?.carbs_g || 'N/A'}g</li>
                    <li>Fat: {results.macros?.fat_g || 'N/A'}g</li>
                  </ul>
                </div>
                <div className="p-3 bg-white rounded-md shadow-sm">
                  <h3 className="font-semibold text-slate-700 text-lg mb-1">📝 Ingredients:</h3>
                  {results.ingredients && results.ingredients.length > 0 ? (
                    <ul className="list-disc list-inside ml-4 text-slate-600 space-y-1">
                      {results.ingredients.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  ) : <p className="text-slate-500 italic">No specific ingredients listed.</p>}
                </div>
                <div className="p-3 bg-white rounded-md shadow-sm border-l-4 border-orange-400">
                  <h3 className="font-semibold text-orange-600 text-lg mb-1">🚩 Warnings / Watch Out For:</h3>
                  {results.warnings && results.warnings.length > 0 ? (
                    <ul className="list-disc list-inside ml-4 text-orange-700 space-y-1">
                      {results.warnings.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  ) : <p className="text-slate-500 italic">No specific warnings noted.</p>}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Camera Modal */}
        {showCameraModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-5 rounded-lg shadow-xl max-w-lg w-full">
                    <h3 className="text-xl font-semibold mb-4 text-slate-700">Capture Food Image</h3>
                    <div className="relative aspect-video bg-slate-200 rounded overflow-hidden mb-4">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>
                    <div className="flex justify-between gap-3">
                        <button
                            onClick={captureImage}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
                        >
                            Snap Photo 📸
                        </button>
                        <button
                            onClick={closeCameraModal}
                            className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold py-2 px-4 rounded-lg shadow"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}

        <footer className="w-full max-w-3xl text-center mt-auto pb-8 px-4">
          <p className="text-xs text-slate-500">
            Tool usage is subject to our {' '}
            <a href="/tos" className="underline hover:text-green-600">Terms of Service</a>.
            <br />
            &copy; {new Date().getFullYear()} NutriSnap.
          </p>
        </footer>
      </div>
    </>
  );
}

