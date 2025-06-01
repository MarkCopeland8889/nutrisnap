// pages/contact.js
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to a backend or email service
    console.log("Contact form submitted:", { name, email, message });
    setIsSubmitted(true);
    // Clear form (optional)
    // setName(''); setEmail(''); setMessage('');
  };

  return (
    <>
      <Head>
        <title>Contact Us - FusionSpace</title>
        <meta name="description" content="Get in touch with the FusionSpace team. We'd love to hear from you!" />
      </Head>
      <Header />

      <main className="font-inter">
        <section className="py-12 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <h1 className="text-4xl font-bold text-green-600 mb-4">Contact Us</h1>
            <p className="text-xl text-slate-700">
              Have questions, feedback, or suggestions? We&apos;d love to hear from you!
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-xl">
            {isSubmitted ? (
              <div className="p-8 bg-green-100 text-green-700 rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-semibold mb-3">Thank You!</h2>
                <p>Your message has been received. We&apos;ll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-xl space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                  <input type="text" name="name" id="name" required value={name} onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                  <input type="email" name="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700">Message</label>
                  <textarea name="message" id="message" rows="4" required value={message} onChange={(e) => setMessage(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                </div>
                <div>
                  <button type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
             <p className="mt-8 text-center text-slate-600 text-sm">
                Alternatively, you can reach us at <a href="mailto:support@FusionSpace.app" className="text-green-600 hover:underline">support@FusionSpace.app</a> (Placeholder Email).
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}