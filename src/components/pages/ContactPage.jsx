import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiTruck, FiPhone, FiMail, FiMapPin, FiClock, FiSend } from 'react-icons/fi';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailtoLink = `mailto:support@clouddispatchops.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`From: ${formData.name} (${formData.email})\n\n${formData.message}`)}`;
    window.location.href = mailtoLink;
    setSubmitted(true);
  };

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
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600">We'd love to hear from you. Reach out anytime.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg"><FiPhone className="h-6 w-6 text-primary-600" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <a href="tel:201-500-7615" className="text-primary-600 hover:text-primary-700 text-lg">(201) 500-7615</a>
                  <p className="text-sm text-gray-500 mt-1">Monday - Friday, 8am - 6pm EST</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg"><FiMail className="h-6 w-6 text-primary-600" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <a href="mailto:support@clouddispatchops.com" className="text-primary-600 hover:text-primary-700">support@clouddispatchops.com</a>
                  <p className="text-sm text-gray-500 mt-1">We respond within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg"><FiMapPin className="h-6 w-6 text-primary-600" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Office</h3>
                  <p className="text-gray-600">West Orange, NJ</p>
                  <p className="text-sm text-gray-500 mt-1">United States</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg"><FiClock className="h-6 w-6 text-primary-600" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Business Hours</h3>
                  <p className="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM EST</p>
                  <p className="text-gray-600">Saturday - Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {submitted ? (
              <div className="text-center py-8">
                <FiSend className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Ready!</h3>
                <p className="text-gray-600">Your email client should have opened. If not, email us directly at support@clouddispatchops.com</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-primary-600 hover:text-primary-700 font-medium">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Send a Message</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent" placeholder="John Smith" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input type="text" required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent" placeholder="How can we help?" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea required rows={5} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent" placeholder="Tell us more..." />
                </div>
                <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
