import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiTruck } from 'react-icons/fi';

const PrivacyPolicyPage = () => {
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last Updated: February 3, 2026</p>

        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 prose prose-gray max-w-none">
          <h2 className="text-xl font-bold text-gray-900 mt-0">1. Introduction</h2>
          <p>Cloud Dispatch Ops ("we," "us," or "our"), operated by Cloud Design Studio, LLC, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application and services.</p>

          <h2 className="text-xl font-bold text-gray-900">2. Information We Collect</h2>
          <p><strong>Account Information:</strong> When you create an account, we collect your name, email address, phone number, company name, and password.</p>
          <p><strong>Business Data:</strong> We collect information you enter into the platform including technician details, job information, customer names, addresses, phone numbers, and service records.</p>
          <p><strong>Payment Information:</strong> Payment processing is handled securely by Stripe. We do not store credit card numbers on our servers. We retain Stripe customer IDs and subscription status.</p>
          <p><strong>Usage Data:</strong> We collect information about how you interact with our platform, including pages visited, features used, and timestamps.</p>

          <h2 className="text-xl font-bold text-gray-900">3. How We Use Your Information</h2>
          <p>We use the collected information to: provide and maintain our service, process your subscription and payments, communicate with you about your account, improve our platform and user experience, send important service updates, and comply with legal obligations.</p>

          <h2 className="text-xl font-bold text-gray-900">4. Data Storage and Security</h2>
          <p>Your data is stored securely using Google Firebase (Firestore) with enterprise-grade encryption at rest and in transit. We implement industry-standard security measures including secure authentication, encrypted connections (HTTPS/TLS), and access controls. Payment data is processed through Stripe's PCI-compliant infrastructure.</p>

          <h2 className="text-xl font-bold text-gray-900">5. Data Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share data with: Stripe for payment processing, Google Firebase for data hosting, and as required by law or to protect our legal rights.</p>

          <h2 className="text-xl font-bold text-gray-900">6. Your Rights</h2>
          <p>You have the right to: access your personal data, correct inaccurate data, request deletion of your data, export your data (via CSV exports), and opt out of non-essential communications.</p>

          <h2 className="text-xl font-bold text-gray-900">7. Data Retention</h2>
          <p>We retain your data for as long as your account is active. Upon account deletion, we will remove your data within 30 days, except where retention is required by law.</p>

          <h2 className="text-xl font-bold text-gray-900">8. Cookies</h2>
          <p>We use essential cookies for authentication and session management. We do not use advertising or tracking cookies.</p>

          <h2 className="text-xl font-bold text-gray-900">9. Children's Privacy</h2>
          <p>Our service is not intended for individuals under the age of 18. We do not knowingly collect information from children.</p>

          <h2 className="text-xl font-bold text-gray-900">10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>

          <h2 className="text-xl font-bold text-gray-900">11. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, contact us at:</p>
          <p>Cloud Design Studio, LLC<br />West Orange, NJ<br />Phone: (201) 500-7615<br />Email: support@clouddispatchops.com</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
