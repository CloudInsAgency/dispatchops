import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiTruck } from 'react-icons/fi';

const TermsOfServicePage = () => {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last Updated: February 3, 2026</p>

        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 prose prose-gray max-w-none">
          <h2 className="text-xl font-bold text-gray-900 mt-0">1. Acceptance of Terms</h2>
          <p>By accessing or using Cloud Dispatch Ops ("the Service"), provided by Cloud Design Studio, LLC ("the Company"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

          <h2 className="text-xl font-bold text-gray-900">2. Description of Service</h2>
          <p>Cloud Dispatch Ops is a web-based dispatch management platform for field service companies. The Service includes a dispatch board, technician management, job tracking, reporting, and billing management tools.</p>

          <h2 className="text-xl font-bold text-gray-900">3. Account Registration</h2>
          <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must be at least 18 years old to use the Service.</p>

          <h2 className="text-xl font-bold text-gray-900">4. Subscription and Payment</h2>
          <p>The Service is offered on a monthly subscription basis. Plans include Starter ($99/month), Growth ($149/month), and Professional ($225/month). A 14-day free trial is provided for new accounts. After the trial period, your selected plan will be billed monthly via Stripe. You may cancel at any time through the Billing page. Cancellations take effect at the end of the current billing period.</p>

          <h2 className="text-xl font-bold text-gray-900">5. Acceptable Use</h2>
          <p>You agree not to: use the Service for any unlawful purpose, attempt to gain unauthorized access to other accounts or systems, interfere with or disrupt the Service, upload malicious code or content, resell or redistribute the Service without authorization, or use the Service to store or transmit content that infringes on third-party rights.</p>

          <h2 className="text-xl font-bold text-gray-900">6. Data Ownership</h2>
          <p>You retain all ownership rights to the data you enter into the Service. We do not claim ownership of your business data, customer information, or job records. You may export your data at any time using the CSV export feature.</p>

          <h2 className="text-xl font-bold text-gray-900">7. Service Availability</h2>
          <p>We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We may perform scheduled maintenance with advance notice. We are not liable for downtime caused by factors outside our control including internet outages, third-party service failures, or force majeure events.</p>

          <h2 className="text-xl font-bold text-gray-900">8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Cloud Design Studio, LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.</p>

          <h2 className="text-xl font-bold text-gray-900">9. Termination</h2>
          <p>We may suspend or terminate your account if you violate these Terms or engage in activity that harms the Service or other users. You may terminate your account at any time by canceling your subscription and contacting support.</p>

          <h2 className="text-xl font-bold text-gray-900">10. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. We will provide notice of significant changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>

          <h2 className="text-xl font-bold text-gray-900">11. Governing Law</h2>
          <p>These Terms are governed by the laws of the State of New Jersey, United States, without regard to conflict of law principles.</p>

          <h2 className="text-xl font-bold text-gray-900">12. Contact</h2>
          <p>For questions about these Terms, contact us at:</p>
          <p>Cloud Design Studio, LLC<br />West Orange, NJ<br />Phone: (201) 500-7615<br />Email: support@clouddispatchops.com</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
