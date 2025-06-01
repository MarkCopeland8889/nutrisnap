// components/Header.js
import React, { useState, useEffect } from 'react'; // Ensure useEffect is imported
import Link from 'next/link';
import { useRouter } from 'next/router';
// import { useAuth } from '../hooks/useAuth'; // Example for later when auth state is global

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const { currentUser } = useAuth(); // Example: const currentUser = GetUserFromFirebase();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Placeholder: In a real app, you'd get this from your auth context/state
  // For now, let's assume we can determine if a user might be logged in (e.g. on certain pages)
  // This is a simplified example; true conditional rendering requires proper auth state management.
  const isLoggedIn = () => {
    // A more robust check would involve onAuthStateChanged or a context
    // For now, let's assume if we are on dashboard, settings, or analytics, user is likely logged in.
    // This is NOT a secure or complete way to check auth status for UI.
    return ['/dashboard', '/settings', '/dashboard/analytics'].includes(router.pathname);
  };


  return (
    <header className="bg-white shadow-md sticky top-0 z-50 font-inter">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" legacyBehavior>
              <a className="text-2xl font-bold text-green-600">
                NutriSnap 🥗
              </a>
            </Link>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link href="/" legacyBehavior><a className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/' ? 'text-green-600 bg-green-50' : 'text-slate-700 hover:text-green-600 hover:bg-green-50'}`}>Home</a></Link>
            <Link href="/features" legacyBehavior><a className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/features' ? 'text-green-600 bg-green-50' : 'text-slate-700 hover:text-green-600 hover:bg-green-50'}`}>Features</a></Link>
            <Link href="/contact" legacyBehavior><a className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/contact' ? 'text-green-600 bg-green-50' : 'text-slate-700 hover:text-green-600 hover:bg-green-50'}`}>Contact</a></Link>
            
            {/* Simplified conditional links for demonstration */}
            {isLoggedIn() ? (
              <>
                <Link href="/dashboard" legacyBehavior><a className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname.startsWith('/dashboard') ? 'text-green-600 bg-green-50' : 'text-slate-700 hover:text-green-600 hover:bg-green-50'}`}>Dashboard</a></Link>
                <Link href="/settings" legacyBehavior><a className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/settings' ? 'text-green-600 bg-green-50' : 'text-slate-700 hover:text-green-600 hover:bg-green-50'}`}>Settings</a></Link>
                {/* Logout button would typically be here, handled by a function */}
                {/* <button onClick={handleLogout} className="...">Log Out</button> */}
              </>
            ) : (
              <>
                <Link href="/signup" legacyBehavior><a className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/signup' ? 'text-green-600 bg-green-50' : 'text-slate-700 hover:text-green-600 hover:bg-green-50'}`}>Sign Up</a></Link>
                <Link href="/login" legacyBehavior>
                  <a className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium shadow transition-colors">Log In</a>
                </Link>
              </>
            )}
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 bg-white shadow-lg z-40 pb-3" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" legacyBehavior><a className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/' ? 'text-green-600 bg-green-50' : 'text-slate-700 hover:text-green-600 hover:bg-green-50'}`}>Home</a></Link>
              <Link href="/features" legacyBehavior><a className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/features' ? 'text-green-600 bg-green-50' : 'text-slate-700 hover:text-green-600 hover:bg-green-50'}`}>Features</a></Link>
              <Link href="/contact" legacyBehavior><a className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/contact' ? 'text-green-600 bg-green-50' : 'text-slate-700 hover:text-green-600 hover:bg-green-50'}`}>Contact</a></Link>
              
              {isLoggedIn() ? (
                <>
                  <Link href="/dashboard" legacyBehavior><a className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname.startsWith('/dashboard') ? 'text-green-600 bg-green-50' : 'text-slate-700 hover:text-green-600 hover:bg-green-50'}`}>Dashboard</a></Link>
                  <Link href="/settings" legacyBehavior><a className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/settings' ? 'text-green-600 bg-green-50' : 'text-slate-700 hover:text-green-600 hover:bg-green-50'}`}>Settings</a></Link>
                  {/* Logout button would also go here */}
                </>
              ) : (
                <>
                  <Link href="/signup" legacyBehavior><a className="block text-slate-700 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-md text-base font-medium">Sign Up</a></Link>
                  <Link href="/login" legacyBehavior>
                    <a className="block bg-green-600 text-white hover:bg-green-700 px-3 py-2 rounded-md text-base font-medium shadow transition-colors text-center mt-1">Log In</a>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}