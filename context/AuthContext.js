// context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase'; // Adjust path if your firebase.js is elsewhere

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); // Stores Firestore user data like onboardingComplete
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // True while checking initial auth state

  useEffect(() => {
    console.log("AuthProvider: useEffect for onAuthStateChanged mounted.");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("AuthProvider: onAuthStateChanged fired. User:", user ? user.uid : null);
      setCurrentUser(user);
      if (user) {
        // User is signed in, fetch their Firestore document
        const userDocRef = doc(db, "users", user.uid);
        try {
          console.log("AuthProvider: Fetching Firestore doc for UID:", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            console.log("AuthProvider: Firestore doc found.", userDocSnap.data());
            setUserData(userDocSnap.data());
          } else {
            console.warn("AuthProvider: No user document found in Firestore for UID:", user.uid);
            setUserData(null); // Or set a default indicating onboarding needed
          }
        } catch (error) {
          console.error("AuthProvider: Error fetching user document from Firestore:", error);
          setUserData(null); // Could set an error state here too
        }
      } else {
        // No user is signed in
        setUserData(null);
      }
      setIsLoadingAuth(false); // Finished initial auth check
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("AuthProvider: useEffect for onAuthStateChanged unmounted.");
      unsubscribe();
    };
  }, []); // Empty dependency array so it only runs once on mount

  const value = {
    currentUser,
    userData, // This will contain { ..., onboardingComplete: true/false, goals: {...} }
    isLoadingAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}