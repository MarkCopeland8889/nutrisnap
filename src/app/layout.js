// src/app/layout.js
import './globals.css'; // Import your global styles here
import { Inter } from 'next/font/google'; // Next.js font optimization
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";

// Initialize Inter font
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Ensures text remains visible during font loading
  variable: '--font-inter', // Optional: if you want to use it as a CSS variable
});

// Metadata (replaces <Head> content from _document.js and page-specific Head components for global tags)
export const metadata = {
  title: 'NutriSnap - AI Nutrition Tracker', // Default title
  description: 'Effortlessly track your nutrition with AI. Snap, Analyze, Achieve!',
  manifest: '/manifest.json', // Link to your PWA manifest
  themeColor: '#4CAF50',
  // Add other global meta tags or link tags here
  // appleWebApp: {
  //   title: 'NutriSnap',
  //   statusBarStyle: 'default',
  //   capable: true,
  // },
  // icons: { // This is another way to specify icons for PWA if not solely relying on manifest
  //   icon: '/icons/icon-192x192.png', // Default icon
  //   apple: '/icons/apple-touch-icon.png', // For Apple devices
  // },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}> {/* Apply Inter font class or variable */}
      <body>
        {/* Header and Footer would typically be part of this root layout 
            or nested layouts if you want them on all pages */}
        {/* <Header /> */} 
        {children} {/* This is where your page content will be rendered */}
        {/* <Footer /> */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}