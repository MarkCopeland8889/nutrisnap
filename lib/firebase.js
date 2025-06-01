// lib/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyB_36gNzNrZlq5MjjcA_1UXz_5goDmp7-k",
  authDomain: "nutrisnap-web.firebaseapp.com",
  projectId: "nutrisnap-web",
  storageBucket: "nutrisnap-web.firebasestorage.app",
  messagingSenderId: "347079415021",
  appId: "1:347079415021:web:d657f3a1c23c81b22ea8e4",
  measurementId: "G-8C59VD2547"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // If already initialized, use that instance
}

const auth = getAuth(app);
const db = getFirestore(app);
let analytics;

// Initialize Analytics only in the browser and if supported
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("Firebase Analytics initialized");
    } else {
      console.log("Firebase Analytics is not supported in this environment (lib/firebase.js).");
    }
  }).catch(err => {
    console.error("Error checking Firebase Analytics support:", err);
  });
}

export { app, auth, db, analytics };