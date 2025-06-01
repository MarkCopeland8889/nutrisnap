// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
// useRouter might not be needed directly if PWA prompt is handled globally/in _app.js
// import { useRouter } from 'next/router'; 
import Header from '../components/Header';
import Footer from '../components/Footer'; // Import Footer

export default function HomePage() {
  // const router = useRouter(); // Only if used directly

  const handleInstallPWA = () => {
    // Ensure window.deferredPrompt is accessible. This logic is usually best placed
    // in _app.js to capture the event early and make it available via context or a global state.
    // For this example, we assume it might be set on the window object.
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        window.deferredPrompt = null; // Prompt can only be used once
      });
    } else {
      // Fallback for browsers that don't support beforeinstallprompt or if event not caught
      alert('To install this app, please use your browser\'s menu and look for "Add to Home Screen" or "Install App" option.');
    }
  };

  return (
    <>
      <Head>
        <title>NutriSnap - AI Nutrition Tracker | Snap, Analyze, Achieve (100% Free)</title>
        <meta name="description" content="NutriSnap offers effortless nutrition tracking with AI. Snap a photo or describe your meal for instant calorie, macro, and ingredient analysis. Achieve your health goals for free!" />
      </Head>
      
      <Header />

      <main className="font-inter text-slate-800">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-500 to-emerald-600 text-white py-20 md:py-32">
          <div className="container mx-auto px-6 text-center max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Unlock Your Health Goals with NutriSnap
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Effortlessly track your nutrition by simply snapping a photo of your meal or describing it. Get instant, AI-powered analysis of calories, macros, and ingredients. <strong className="underline">100% FREE to use and get started!</strong>
            </p>
            <div className="flex flex-col items-center space-y-4 sm:space-y-0 sm:flex-row sm:justify-center sm:space-x-4">
              <Link href="/tool" legacyBehavior>
                <a className="w-full max-w-xs sm:w-auto inline-block bg-white text-green-600 font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-slate-100 transition duration-300 text-lg">
                  Try the Free Tool Now
                </a>
              </Link>
              <Link href="/signup" legacyBehavior>
                <a className="w-full max-w-xs sm:w-auto inline-block bg-amber-400 text-slate-900 font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-300 transition duration-300 text-lg">
                  Create Your Free Account
                </a>
              </Link>
            </div>
            {/* New Download Android App Button */}
            <div className="mt-6">
                 <a 
                    href="#" // Replace with actual APK link when ready
                    onClick={(e) => { e.preventDefault(); alert('Android App (APK) coming soon!'); }}
                    className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition duration-300 text-md"
                    title="Download NutriSnap Android APK (Coming Soon)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM5 4a1 1 0 00-1 1v10a1 1 0 001 1h1V4H5zm10 0h-1v12h1a1 1 0 001-1V5a1 1 0 00-1-1zM10 18a1 1 0 001-1v-1a1 1 0 00-2 0v1a1 1 0 001 1z" />
                        <path d="M3 5a3 3 0 013-3h8a3 3 0 013 3v10a3 3 0 01-3 3H6a3 3 0 01-3-3V5zm2 0v10a1 1 0 001 1h8a1 1 0 001-1V5a1 1 0 00-1-1H6a1 1 0 00-1 1z" />
                    </svg>
                    Download Android App (APK)
                </a>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-16 md:py-24 bg-slate-50">
          <div className="container mx-auto px-6 text-center max-w-4xl">
            <h2 className="text-3xl font-bold mb-4 text-slate-800">It&apos;s As Easy As...</h2> {/* Escaped apostrophe */}
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="text-5xl mb-4 text-green-500">📸</div>
                <h3 className="text-xl font-semibold mb-2">1. Snap or Describe</h3>
                <p className="text-slate-600">Take a picture of your meal or type in what you ate.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="text-5xl mb-4 text-green-500">🤖</div>
                <h3 className="text-xl font-semibold mb-2">2. AI Analyzes</h3>
                <p className="text-slate-600">Our advanced AI instantly breaks down the nutritional content.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="text-5xl mb-4 text-green-500">📊</div>
                <h3 className="text-xl font-semibold mb-2">3. Track & Achieve</h3>
                <p className="text-slate-600">Log your meals, monitor your progress, and reach your health goals.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Highlight Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Why Choose NutriSnap?</h2>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <img src="/placeholder-app-image.svg" alt="NutriSnap App Interface" className="rounded-lg shadow-xl mx-auto" style={{maxWidth: '350px', border: '1px solid #e2e8f0'}}/> 
              </div>
              <div className="space-y-6">
                <div className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4 font-bold text-xl">✓</div>
                  <div>
                    <h4 className="text-xl font-semibold">Instant AI Analysis</h4>
                    <p className="text-slate-600 mt-1">Get detailed breakdowns of calories, protein, carbs, and fats in seconds from a photo or text.</p>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4 font-bold text-xl">✓</div>
                  <div>
                    <h4 className="text-xl font-semibold">Personalized Goals</h4>
                    <p className="text-slate-600 mt-1">Set your targets for weight loss, maintenance, or gain, and we&apos;ll guide you with clear nutritional plans.</p> {/* Escaped apostrophe */}
                  </div>
                </div>
                <div className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4 font-bold text-xl">✓</div>
                  <div>
                    <h4 className="text-xl font-semibold">Ingredient Insights</h4>
                    <p className="text-slate-600 mt-1">Identify common unwanted ingredients like seed oils and artificial preservatives to make healthier choices.</p>
                  </div>
                </div>
                 <div className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4 font-bold text-xl">✓</div>
                  <div>
                    <h4 className="text-xl font-semibold">Completely Free</h4>
                    <p className="text-slate-600 mt-1">Access all core features without any subscription fees. Seriously. Our mission is accessible health.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authority / Social Proof Section (Placeholders) */}
        <section className="py-16 md:py-24 bg-green-50">
            <div className="container mx-auto px-6 max-w-4xl text-center">
                <h2 className="text-3xl font-bold mb-12 text-slate-800">Trusted & Effective</h2>
                <div className="grid md:grid-cols-2 gap-8 text-left">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold text-green-700 mb-3">Powered by Advanced AI</h3>
                        <p className="text-slate-600 mb-2">NutriSnap utilizes state-of-the-art AI models (like Google&apos;s Gemini) combined with comprehensive nutritional databases to provide highly accurate estimations from your food descriptions or images.</p> {/* Escaped apostrophe */}
                        <p className="text-slate-600 text-sm mt-2">(Placeholder: We will link to studies validating food recognition AI accuracy here.)</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold text-green-700 mb-3">Join Thousands of Healthy Eaters!</h3>
                        <blockquote className="text-slate-600 mb-2 italic border-l-4 border-green-500 pl-4">
                          <p>"Finally, an app that makes calorie counting easy and actually insightful! And it's FREE! The AI is surprisingly accurate."</p>
                          <cite className="block text-slate-800 font-semibold mt-2 not-italic">- Alex M., Beta User</cite>
                        </blockquote>
                        <blockquote className="text-slate-600 mt-4 italic border-l-4 border-green-500 pl-4">
                          <p>"The ingredient warnings are a game-changer. Helping me avoid stuff I don&apos;t want in my diet."</p> {/* Escaped apostrophe */}
                           <cite className="block text-slate-800 font-semibold mt-2 not-italic">- Sarah K., Health Enthusiast</cite>
                        </blockquote>
                    </div>
                </div>
            </div>
        </section>

        {/* Call to Action & PWA/APK Section */}
        <section className="py-16 md:py-24 text-center">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="text-3xl font-bold mb-6 text-slate-800">Ready to Transform Your Nutrition?</h2>
            <p className="text-slate-600 mb-8">
              Get started with NutriSnap today. Set personalized goals, use our powerful free AI tool, and embark on your journey to a healthier, more informed lifestyle.
            </p>
            <div className="p-8 bg-white rounded-xl shadow-xl inline-block">
              <h3 className="text-2xl font-semibold text-green-700 mb-6">Get Started Now - It&apos;s Free!</h3> {/* Escaped apostrophe */}
              <div className="space-y-4 flex flex-col items-center">
                <Link href="/tool" legacyBehavior>
                  <a className="w-full max-w-xs sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 text-lg">
                    Try Our Tool (Limited Free Use)
                  </a>
                </Link>
                <Link href="/signup" legacyBehavior>
                  <a className="w-full max-w-xs sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 text-lg">
                    Sign Up (100% Free Account)
                  </a>
                </Link>
                
                <div className="pt-4 w-full max-w-xs sm:max-w-none">
                  <h4 className="text-lg font-medium text-slate-700 mb-3">Get the App Experience:</h4>
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                    <button 
                      onClick={handleInstallPWA}
                      className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition duration-300 flex items-center justify-center gap-2"
                      title="Install NutriSnap as a Web App"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2zM12 3v10m0 0L9 9m3 4l3-4" /></svg>
                      Install Web App (PWA)
                    </button>
                    {/* This is the original APK button from the CTA section, I'll keep it for now. You can remove if the Hero one is sufficient. */}
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); alert('Android APK coming soon!'); }}
                      className="w-full sm:w-auto bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition duration-300 flex items-center justify-center gap-2"
                      title="Download NutriSnap Android APK (Coming Soon)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 2.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L6.586 5 5.293 3.707a1 1 0 010-1.414zM14.707 17.707a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414l2-2a1 1 0 111.414 1.414L13.414 15l1.293 1.293a1 1 0 010 1.414zM10 2a1 1 0 011 1v14a1 1 0 11-2 0V3a1 1 0 011-1z" clipRule="evenodd" /></svg>
                      Download Android APK
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer /> {/* Add the Footer */}
    </>
  );
}