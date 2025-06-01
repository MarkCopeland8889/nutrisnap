// pages/features.js
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function FeaturesPage() {
  const features = [
    {
      name: "Instant AI Meal Analysis",
      description: "Snap a photo or describe your meal, and our advanced AI (powered by Gemini 1.5 Flash) provides a detailed breakdown of calories, protein, carbohydrates, and fats in seconds.",
      icon: "📸" // Emoji or SVG icon
    },
    {
      name: "Comprehensive Macro Tracking",
      description: "Easily log your meals and monitor your daily intake against personalized macronutrient targets. Understand your eating patterns like never before.",
      icon: "📊"
    },
    {
      name: "Personalized Goals & Plans",
      description: "Set your goals for weight loss, maintenance, or muscle gain. FusionSpace provides tailored calorie and macro targets based on your profile and activity level.",
      icon: "🎯"
    },
    {
      name: "Ingredient Awareness",
      description: "Our AI identifies key ingredients and can flag common items to watch out for, such as seed oils and artificial preservatives, helping you make healthier choices.",
      icon: "🔬"
    },
    {
      name: "Food Logging & History",
      description: "Keep a detailed history of your meals. (Coming soon: View trends and insights over weeks and months in our analytics section).",
      icon: "🗓️"
    },
    {
      name: "Progressive Web App (PWA)",
      description: "Install FusionSpace directly to your phone or desktop for a fast, app-like experience without needing an app store.",
      icon: "📱"
    },
    {
      name: "Completely Free Core Features",
      description: "Access all essential meal analysis, tracking, and goal-setting features absolutely free. We believe good health tools should be accessible to everyone.",
      icon: "🎉"
    },
    {
      name: "User-Friendly Interface",
      description: "Clean, intuitive design makes tracking your nutrition simple and enjoyable, not a chore.",
      icon: "💡"
    }
  ];

  return (
    <>
      <Head>
        <title>Features - FusionSpace | AI Nutrition Tracking</title>
        <meta name="description" content="Discover the powerful features of FusionSpace, your free AI-powered nutrition and calorie tracker. Instant analysis, personalized goals, and more." />
      </Head>
      <Header />

      <main className="font-inter">
        <section className="py-12 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <h1 className="text-4xl font-bold text-green-600 mb-4">FusionSpace Features</h1>
            <p className="text-xl text-slate-700">
              Everything you need to understand your food, track your nutrition, and achieve your health goals – <strong className="text-green-600">all for free</strong>.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.name} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.name}</h3>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-green-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <h2 className="text-3xl font-bold mb-6">Why FusionSpace Stands Out</h2>
            <p className="text-lg mb-4">
              Compared to expensive alternatives or complicated apps, FusionSpace offers a streamlined, AI-first approach to nutrition. 
              Our core features are robust and always free. We focus on providing accurate estimations and actionable insights.
            </p>
            <p className="text-lg">
              (Placeholder: Add specific comparisons or unique selling points here later.)
            </p>
          </div>
        </section>
        
        <section className="py-16 bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
                <h2 className="text-3xl font-bold mb-12 text-slate-800">Scientific Approach & User Trust (Placeholders)</h2>
                <div className="space-y-8">
                    <div>
                        <h3 className="text-2xl font-semibold text-green-700 mb-3">Our Technology</h3>
                        <p className="text-slate-700 max-w-2xl mx-auto">
                            FusionSpace leverages cutting-edge AI (Gemini 1.5 Flash) and established nutritional databases to provide its estimations. 
                            While AI provides powerful analysis, remember that all values are estimates. 
                            (Placeholder: We will add links to relevant studies or research backing our approach here.)
                        </p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-green-700 mb-3">What Our Users Say</h3>
                        <div className="grid md:grid-cols-2 gap-6 text-left">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <p className="text-slate-600 italic">&quot;This app is a lifesaver! So easy to just snap a pic and know what I&apos;m eating. And it&apos;s FREE!&quot;</p>
                                <p className="text-slate-800 font-semibold mt-2">- Jamie P.</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <p className="text-slate-600 italic">&quot;The ingredient warnings helped me realize how much seed oil was in my diet. Making better choices now.&quot;</p>
                                <p className="text-slate-800 font-semibold mt-2">- Alex R.</p>
                            </div>
                        </div>
                         {/* Add more testimonials */}
                    </div>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </>
  );
}