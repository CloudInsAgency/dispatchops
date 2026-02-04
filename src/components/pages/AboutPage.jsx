import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiTruck, FiTarget, FiHeart, FiAward, FiUsers } from 'react-icons/fi';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Cloud Dispatch Ops" className="h-8 w-8" />
            <FiTruck className="h-6 w-6 text-primary-600 ml-2" />
            <span className="ml-2 text-xl font-bold text-gray-900">Cloud Dispatch Ops</span>
          </Link>
          <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center text-sm">
            <FiArrowLeft className="mr-1" /> Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Cloud Dispatch Ops</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dispatch software built by someone who's been in your shoes for 15+ years.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
            <p>
              Cloud Dispatch Ops was born out of real-world frustration. After spending over 15 years managing field service operations — coordinating thousands of daily service orders, managing 50+ employees across multiple regional centers, and constantly juggling spreadsheets, phone calls, and outdated systems — we knew there had to be a better way.
            </p>
            <p>
              We've lived the daily chaos of dispatch management: the "Where is my technician?" calls, the 30+ minutes spent manually assigning jobs each morning, and the lack of visibility into team performance. We built Cloud Dispatch Ops to solve these exact problems.
            </p>
            <p>
              Our platform is designed specifically for HVAC, plumbing, electrical, and other field service companies who need a simple, powerful, and affordable way to manage their technicians and jobs in real-time. No bloated features. No complicated setup. Just the tools you actually need to run your operation efficiently.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FiTarget className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
            <p className="text-gray-600">To give every field service company — from 5 techs to 40 — the same dispatch technology that used to be reserved for enterprise operations.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FiHeart className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Values</h3>
            <p className="text-gray-600">Simplicity over complexity. We believe dispatch software should save you time on day one, not require weeks of training and onboarding.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FiAward className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Promise</h3>
            <p className="text-gray-600">Real support from real people who understand dispatch. When you call us, you'll talk to someone who's managed a dispatch floor.</p>
          </div>
        </div>

        <div className="bg-primary-600 rounded-xl shadow-lg p-8 md:p-12 text-white text-center">
          <FiUsers className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-4">Ready to simplify your dispatch?</h2>
          <p className="text-lg opacity-90 mb-6">Start your 14-day free trial today. No credit card required.</p>
          <Link to="/signup" className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
