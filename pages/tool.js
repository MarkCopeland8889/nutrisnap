// pages/tool.js
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header'; // Import the Header

const GEMINI_API_KEY = "AIzaSyDjE6Auy8b1C89Xpb9iuIlenDhsfjbxuME"; // Replace with your actual key or use environment variable
const FREE_USES_LIMIT = 2; // Allows 2 full analyses

export default function ToolPage() {
  const [foodInput, setFoodInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const router = useRouter();


  useEffect(() => {
    const storedCount = parseInt(localStorage.getItem('nutrisnapFreeUsage') || '0');
    setUsageCount(storedCount);
    if (storedCount >= FREE_USES_LIMIT) {
      setLimitReached(true);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
      setError(''); 
    }
  };
  
  const openCamera = async () => {
    if (limitReached) return;
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
    }
  };
  
  useEffect(() => {
      if (showCameraModal && cameraStream && videoRef.current) {
          videoRef.current.srcObject = cameraStream;
      }
  }, [showCameraModal, cameraStream]);

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
        fetch(dataUrl).then(res => res.blob()).then(blob => {
            const capturedFile = new File([blob], "captured-photo.png", { type: "image/png" });
            setImageFile(capturedFile);
        });
        closeCameraModal();
        setError('');
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
    if (limitReached) return;

    if (!foodInput && !imageBase64) {
      setError('Please describe your meal or provide an image. ✍️📸');
      return;
    }
    setError('');
    setResults(null);
    setIsLoading(true);

    // Check usage limit *before* API call
    if (usageCount >= FREE_USES_LIMIT) {
        setLimitReached(true);
        setIsLoading(false);
        return;
    }

    const promptText = foodInput || "the food in the image";
    let parts = [{ text: `Analyze the following food: "${promptText}". Provide a detailed JSON response with: total_calories (number, estimated total for the described meal/item), macros (object with protein_g, carbs_g, fat_g in grams), ingredients (array of strings, listing primary ingredients), and warnings (array of strings, specifically noting any common seed oils like soybean, canola, sunflower, corn oil, or artificial preservatives like BHA, BHT, sodium benzoate, nitrates/nitrites if likely present based on the food type). Be as accurate as possible with calorie and macro estimations. If an image is provided, analyze the food in the image. If both text and image are provided, prioritize the image but use text for context if helpful.` }];

    if (imageBase64 && imageFile) {
      parts.push({
        inlineData: {
          mimeType: imageFile.type || 'image/png',
          data: imageBase64,
        },
      });
    }
    const payload = {
      contents: [{ role: "user", parts }],
      generationConfig: { responseMimeType: "application/json" }
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API request failed: ${errorData?.error?.message || response.status}`);
      }
      const data = await response.json();

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const rawJsonText = data.candidates[0].content.parts[0].text;
        try {
            const parsedResult = JSON.parse(rawJsonText);
            setResults(parsedResult);
            // Increment usage count AFTER successful analysis
            const newCount = usageCount + 1;
            setUsageCount(newCount);
            localStorage.setItem('nutrisnapFreeUsage', newCount.toString());
            if (newCount >= FREE_USES_LIMIT) {
                setLimitReached(true); // Set limit reached for next attempt
            }
        } catch (jsonError) {
            console.error("JSON Parsing Error:", jsonError, "Raw Text:", rawJsonText);
            setError("Invalid analysis format from AI. Raw: " + rawJsonText.substring(0, 200) + "...");
            setResults(null);
        }
      } else {
        console.log("Unexpected API response structure:", data);
        setError('Failed to get a valid analysis. Unexpected response structure.');
        setResults(null);
      }
    } catch (err) {
      console.error("Error analyzing food:", err);
      setError(`Error analyzing food: ${err.message}. 🚧`);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewAnalysis = () => {
    setFoodInput('');
    setImageFile(null);
    setImageBase64('');
    setResults(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    // Do not reset limitReached or usageCount here, it's persistent until signup
  };

  useEffect(() => {
    if (!imageBase64) {
        setImageFile(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [imageBase64]);

  return (
    <>
      <Head>
        <title>Free Nutrition Analysis Tool - NutriSnap</title>
        <meta name="description" content="Try NutriSnap's free AI-powered tool to analyze the nutrition of your meals instantly. Limited free uses available." />
      </Head>
      <Header /> {/* Add the header */}

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600">Free AI Nutrition Analyzer</h1>
          <p className="text-slate-600 mt-2">
            Get a quick nutritional estimate for your meal. Logged-in users get unlimited access and tracking!
          </p>
          <button 
            onClick={() => router.push('/')} 
            className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        {limitReached ? (
          <div className="p-8 bg-amber-100 border-l-4 border-amber-500 text-amber-700 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold mb-4">Want More Analyses?</h2>
            <p className="text-lg mb-6">
              Sign Up to Continue Using NutriSnap, 100% free! Unlock unlimited analyses, meal tracking, personalized goals, and more.
            </p>
            <Link href="/signup" legacyBehavior>
              <a className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 text-lg">
                Sign Up Free
              </a>
            </Link>
          </div>
        ) : (
          <div className="w-full bg-white text-slate-800 p-6 sm:p-8 rounded-xl shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="foodInput" className="block text-sm font-medium text-slate-700 mb-1">Describe your meal/food item ✍️</label>
                <textarea id="foodInput" value={foodInput} onChange={(e) => setFoodInput(e.target.value)} placeholder="e.g., 'A medium banana and a tablespoon of peanut butter'" rows="3"
                  className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out placeholder-slate-400"
                />
              </div>
              <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">OR ADD AN IMAGE</span></div></div>
              <div className="space-y-3">
                <p className="block text-sm font-medium text-slate-700 -mb-1">Provide an image of your food:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button type="button" onClick={openCamera} className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400 transition duration-150">Capture 📸</button>
                    <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-150">Select from Gallery 🖼️</button>
                </div>
                <input type="file" id="imageUpload" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                {imageBase64 && (
                    <div className="mt-3 p-2 border border-slate-200 rounded-lg bg-slate-50 text-center">
                        <img src={`data:${imageFile?.type || 'image/png'};base64,${imageBase64}`} alt="Selected food" className="max-h-48 w-auto mx-auto rounded-md shadow-sm mb-2"/>
                        <p className="text-xs text-slate-600 truncate">{imageFile?.name || 'Captured image'}</p>
                        <button type="button" onClick={() => {setImageBase64(''); setImageFile(null);}} className="text-xs text-red-500 hover:text-red-700 mt-1">Remove image</button>
                    </div>
                )}
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center text-lg">
                {isLoading ? ( <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Analyzing...</> ) : ( 'Snap Nutrition Info ✨' )}
              </button>
              <p className="text-xs text-slate-500 text-center pt-2">
                Free uses remaining: {Math.max(0, FREE_USES_LIMIT - usageCount)}. 
                By using this tool, you agree to our <Link href="/terms" legacyBehavior><a className="underline hover:text-green-600">Terms of Service</a></Link>.
              </p>
            </form>

            {error && <p className="mt-6 text-center text-red-600 bg-red-100 p-3 rounded-lg shadow">{error}</p>}
            
            {results && (
              <div className="mt-8 p-6 bg-slate-50 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-green-700 mb-4 text-center">Nutrition Analysis Complete 📊</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-md shadow-sm"><p className="text-lg"><strong className="text-slate-700">🔥 Total Calories:</strong> {results.total_calories?.toLocaleString() || 'N/A'} kcal</p></div>
                  <div className="p-3 bg-white rounded-md shadow-sm"><h4 className="font-semibold text-slate-700 text-lg mb-1">💪 Macros:</h4><ul className="list-disc list-inside ml-4 text-slate-600 space-y-1"><li>Protein: {results.macros?.protein_g || 'N/A'}g</li><li>Carbohydrates: {results.macros?.carbs_g || 'N/A'}g</li><li>Fat: {results.macros?.fat_g || 'N/A'}g</li></ul></div>
                  <div className="p-3 bg-white rounded-md shadow-sm"><h4 className="font-semibold text-slate-700 text-lg mb-1">📝 Ingredients:</h4>{results.ingredients && results.ingredients.length > 0 ? (<ul className="list-disc list-inside ml-4 text-slate-600 space-y-1">{results.ingredients.map((item, index) => <li key={index}>{item}</li>)}</ul>) : <p className="text-slate-500 italic">No specific ingredients listed.</p>}</div>
                  <div className="p-3 bg-white rounded-md shadow-sm border-l-4 border-orange-400"><h4 className="font-semibold text-orange-600 text-lg mb-1">🚩 Warnings / Watch Out For:</h4>{results.warnings && results.warnings.length > 0 ? (<ul className="list-disc list-inside ml-4 text-orange-700 space-y-1">{results.warnings.map((item, index) => <li key={index}>{item}</li>)}</ul>) : <p className="text-slate-500 italic">No specific warnings noted.</p>}</div>
                </div>
              </div>
            )}

            {(!isLoading && (results || error)) && (
              <div className="mt-6 text-center">
                <button onClick={handleStartNewAnalysis} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition duration-300 ease-in-out">
                  Clear Form & Analyze Another 🔄
                </button>
              </div>
            )}
             {showCameraModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="bg-white p-5 rounded-lg shadow-xl max-w-lg w-full"><h3 className="text-xl font-semibold mb-4 text-slate-700">Capture Food Image</h3><div className="relative aspect-video bg-slate-200 rounded overflow-hidden mb-4"><video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video><canvas ref={canvasRef} className="hidden"></canvas></div><div className="flex justify-between gap-3"><button onClick={captureImage} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow">Snap Photo 📸</button><button onClick={closeCameraModal} className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold py-2 px-4 rounded-lg shadow">Cancel</button></div></div></div>
            )}
          </div>
        )}
      </main>
    </>
  );
}