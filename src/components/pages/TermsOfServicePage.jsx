import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Cloud Dispatch Ops" className="h-8 w-8 rounded-md" />
            <span className="ml-2.5 text-xl font-bold text-gray-900">Cloud Dispatch Ops</span>
          </Link>
          <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center text-sm">
            <FiArrowLeft className="mr-1" /> Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last Updated: September 13, 2026</p>

        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 prose prose-gray max-w-none">
          <h2 className="text-xl font-bold text-gray-900 mt-0">1. Acceptance of Terms</h2>
          <p>By accessing or using Cloud Dispatch Ops ("the Service"), provided by Cloud Design Studio, LLC ("the Company"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

          <h2 className="text-xl font-bold text-gray-900">2. Description of Service</h2>
          <p>Cloud Dispatch Ops is a web-based dispatch management platform for field service companies. The Service includes a dispatch board, technician management, job tracking, a mobile portal for technicians, reporting, optional technician location capture (see section 5), and billing management tools.</p>

          <h2 className="text-xl font-bold text-gray-900">3. Account Registration</h2>
          <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must be at least 18 years old to use the Service.</p>

          <h2 className="text-xl font-bold text-gray-900">4. Subscription and Payment</h2>
          <p>The Service is offered on a monthly subscription basis, priced by the number of technicians on your account:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Starter</strong> — $99/month, 1 to 5 technicians</li>
            <li><strong>Growth</strong> — $149/month, 6 to 10 technicians</li>
            <li><strong>Professional</strong> — $225/month, 11 to 40 technicians</li>
          </ul>
          <p>All plans include unlimited jobs. There is no per-job charge and no monthly job cap.</p>
          <p>A 14-day free trial is provided for new accounts and does not require a payment card. After the trial, your selected plan is billed monthly in advance via Stripe. You may cancel at any time from the Billing page; cancellation takes effect at the end of the current billing period and no refund is issued for the remainder of that period. If a payment fails, access to the Service may be suspended until the payment method is updated.</p>

          <h2 className="text-xl font-bold text-gray-900">5. Technician Location Data</h2>
          <p>The Service can record a technician's approximate GPS position at the moment they mark a job en route, arrived, or complete — at most three points per job. It does not track technicians continuously, does not record location between jobs, and records nothing while the technician's app is closed. The feature is off by default and requires each technician to opt in; a technician may decline or withdraw consent at any time without losing access to any other part of the Service.</p>
          <p><strong>You are the employer of your technicians, and you are responsible for complying with the laws that apply to you.</strong> Several jurisdictions require that employees be given notice of, or give written consent to, location monitoring, and some restrict monitoring outside working hours. Before enabling this feature you must satisfy yourself that your use of it is lawful where you operate, and must give your technicians whatever notice the law requires. We provide the tool; we do not provide legal advice about your use of it, and we are not responsible for your failure to meet those obligations.</p>
          <p>Location points are stored with the job they belong to and are deleted when that job or your account is deleted. Details of what is collected and how it is handled are in our <a href="/privacy" className="text-primary-600 underline">Privacy Policy</a>.</p>

          <h2 className="text-xl font-bold text-gray-900">6. Acceptable Use</h2>
          <p>You agree not to: use the Service for any unlawful purpose, attempt to gain unauthorized access to other accounts or systems, interfere with or disrupt the Service, upload malicious code or content, resell or redistribute the Service without authorization, use the Service to store or transmit content that infringes on third-party rights, or use the location features to monitor any person without the notice and consent required by law.</p>

          <h2 className="text-xl font-bold text-gray-900">7. Data Ownership</h2>
          <p>You retain all ownership rights to the data you enter into the Service. We do not claim ownership of your business data, customer information, or job records. You may export your data at any time using the CSV export feature.</p>

          <h2 className="text-xl font-bold text-gray-900">8. Service Availability</h2>
          <p>We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We may perform scheduled maintenance with advance notice. We are not liable for downtime caused by factors outside our control including internet outages, third-party service failures, or force majeure events.</p>

          <h2 className="text-xl font-bold text-gray-900">9. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Cloud Design Studio, LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.</p>

          <h2 className="text-xl font-bold text-gray-900">10. Termination</h2>
          <p>We may suspend or terminate your account if you violate these Terms or engage in activity that harms the Service or other users. You may terminate your account at any time by canceling your subscription and contacting support. Export your data before you do: following account deletion your data is removed within 30 days and cannot be recovered afterwards.</p>

          <h2 className="text-xl font-bold text-gray-900">11. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. We will provide notice of significant changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>

          <h2 className="text-xl font-bold text-gray-900">12. Governing Law</h2>
          <p>These Terms are governed by the laws of the State of New Jersey, United States, without regard to conflict of law principles.</p>

          <h2 className="text-xl font-bold text-gray-900">13. Contact</h2>
          <p>For questions about these Terms, contact us at:</p>
          <p>Cloud Design Studio, LLC<br />West Orange, NJ<br />Phone: (201) 500-7615<br />Email: support@clouddispatchops.com</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
