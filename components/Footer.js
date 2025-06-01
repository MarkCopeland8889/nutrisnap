// components/Footer.js
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-400 font-inter">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h5 className="text-slate-200 font-semibold mb-3">NutriSnap</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features" legacyBehavior><a className="hover:text-green-400">Features</a></Link></li>
              <li><Link href="/#pricing" legacyBehavior><a className="hover:text-green-400">Pricing (Free!)</a></Link></li> 
              {/* Assuming pricing section on homepage */}
            </ul>
          </div>
          <div>
            <h5 className="text-slate-200 font-semibold mb-3">Company</h5>
            <ul className="space-y-2 text-sm">
              {/* <li><Link href="/about" legacyBehavior><a className="hover:text-green-400">About Us</a></Link></li> */}
              <li><Link href="/contact" legacyBehavior><a className="hover:text-green-400">Contact</a></Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-slate-200 font-semibold mb-3">Legal</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" legacyBehavior><a className="hover:text-green-400">Terms of Service</a></Link></li>
              <li><Link href="/privacy" legacyBehavior><a className="hover:text-green-400">Privacy Policy</a></Link></li>
              {/* Create /privacy page later */}
            </ul>
          </div>
          <div>
            <h5 className="text-slate-200 font-semibold mb-3">Follow Us</h5>
            <div className="flex space-x-4">
              {/* Add social media icons/links here later */}
              <a href="#" className="hover:text-green-400">FB</a>
              <a href="#" className="hover:text-green-400">TW</a>
              <a href="#" className="hover:text-green-400">IG</a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} NutriSnap. All rights reserved. Your AI Nutrition Companion.</p>
          <p className="mt-1">Remember to consult with a healthcare professional for medical or dietary advice.</p>
        </div>
      </div>
    </footer>
  );
}