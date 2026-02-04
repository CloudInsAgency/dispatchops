import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTruck } from 'react-icons/fi';
import { PRICING_TIERS } from '../../config/config';
import { useAuth } from '../../contexts/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    selectedTier: 'starter'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTierSelect = (tierId) => {
    setFormData({
      ...formData,
      selectedTier: tierId
    });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');
    
    // Validation for each step
    if (step === 1) {
      if (!formData.companyName || !formData.fullName || !formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Add subscription data to formData - ALL NEW USERS GET STARTER PLAN BY DEFAULT
      const signupData = {
        ...formData,
        subscription: {
          plan: 'starter',
          techLimit: 10,
          jobLimit: 100,
          status: 'active',
          stripeCustomerId: '',
          stripeSubscriptionId: '',
          createdAt: new Date().toISOString()
        }
      };
      
      // Create user with Firebase Auth and Firestore
      await signup(formData.email, formData.password, formData.fullName, formData.companyName, formData.phone);
      
      // After successful signup, redirect to onboarding
      navigate('/onboarding');
      
    } catch (err) {
      console.error('Signup error:', err);
      
      // Handle specific Firebase errors
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Try logging in instead.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const selectedTierInfo = PRICING_TIERS.find(t => t.id === formData.selectedTier);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="Cloud Dispatch Ops" className="h-8 w-8" />
              <FiTruck className="h-6 w-6 text-primary-600 ml-2" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Cloud Dispatch Ops</span>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center">
              <FiArrowLeft className="mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((num) => (
                <React.Fragment key={num}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step >= num ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {num}
                  </div>
                  {num < 3 && (
                    <div className={`h-1 w-20 ${
                      step > num ? 'bg-primary-600' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 px-4">
              <span className="text-sm text-gray-600">Your Info</span>
              <span className="text-sm text-gray-600">Choose Plan</span>
              <span className="text-sm text-gray-600">Payment</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white shadow-xl rounded-lg p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Step 1: Your Information */}
            {step === 1 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                <p className="text-gray-600 mb-8">Start your 14-day free trial. No credit card required.</p>
                
                <form onSubmit={handleNextStep} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="Acme HVAC Services"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="john@acmehvac.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition"
                  >
                    Continue to Plan Selection
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>
            )}

            {/* Step 2: Choose Your Plan */}
            {step === 2 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
                <p className="text-gray-600 mb-8">Select based on your team size. You can upgrade or downgrade anytime.</p>

                <div className="space-y-4 mb-8">
                  {PRICING_TIERS.map((tier) => (
                    <div
                      key={tier.id}
                      onClick={() => handleTierSelect(tier.id)}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                        formData.selectedTier === tier.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                              formData.selectedTier === tier.id
                                ? 'border-primary-600 bg-primary-600'
                                : 'border-gray-300'
                            }`}>
                              {formData.selectedTier === tier.id && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                              <p className="text-sm text-gray-600">{tier.techRange}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">
                            ${tier.price}
                          </div>
                          <div className="text-sm text-gray-600">/month</div>
                        </div>
                      </div>
                      {tier.popular && (
                        <div className="mt-2">
                          <span className="inline-block bg-primary-600 text-white text-xs px-3 py-1 rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Information */}
            {step === 3 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Information</h2>
                <p className="text-gray-600 mb-8">
                  Your 14-day free trial starts today. You won't be charged until {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
                </p>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{selectedTierInfo?.name}</span>
                      <span className="font-semibold">${selectedTierInfo?.price}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Free Trial</span>
                      <span className="font-semibold text-green-600">14 days</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-semibold text-gray-900">Due Today</span>
                      <span className="font-bold text-gray-900">$0.00</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Billed ${selectedTierInfo?.price} monthly after trial ends
                    </div>
                  </div>
                </div>

                {/* Stripe Elements would go here */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                  <p className="text-gray-600">
                    Stripe payment form will be integrated here
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    (Secure payment processing via Stripe)
                  </p>
                </div>

                <form onSubmit={handleSignup}>
                  <div className="mb-6">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" required />
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Privacy Policy</a>
                      </span>
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition"
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Start Free Trial'}
                    </button>
                  </div>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                  🔒 Secure checkout powered by Stripe
                </p>
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>✓ 14-day free trial • ✓ No credit card required • ✓ Cancel anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;