import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiTruck, FiClock, FiUsers, FiBarChart2, FiSmartphone } from 'react-icons/fi';
import { PRICING_TIERS } from '../../config/config';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="Cloud Dispatch Ops" className="h-10 w-10" />
              <FiTruck className="h-8 w-8 text-primary-600 ml-2" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Cloud Dispatch Ops</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-primary-600">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-primary-600">Pricing</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-primary-600">How It Works</a>
              <Link to="/login" className="text-gray-700 hover:text-primary-600">Login</Link>
              <Link 
                to="/signup" 
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Dispatch Software Built By<br />
              <span className="text-primary-600">Dispatch Managers</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Stop juggling spreadsheets and phone calls. Manage your field technicians in real-time 
              with software designed by someone who has been in your shoes for 15+ years.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup"
                className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition shadow-lg"
              >
                Start 14-Day Free Trial
              </Link>
              <a 
                href="https://youtu.be/Ha8-2Tj_o10"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition"
              >
                Watch Demo (2 min)
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required • Cancel anytime • Setup in 3 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Problems We Solve */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Sound Familiar?</h2>
            <p className="mt-4 text-xl text-gray-600">We have been there. Here is what we fixed.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                problem: '"Where is my technician?"',
                solution: 'Real-time status updates on every tech',
                icon: FiUsers
              },
              {
                problem: 'Spending 30+ min assigning daily jobs',
                solution: 'Drag-and-drop assignment in under 5 minutes',
                icon: FiClock
              },
              {
                problem: 'No idea which tech is performing well',
                solution: 'Daily performance reports with one click',
                icon: FiBarChart2
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-8 rounded-lg">
                <item.icon className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.problem}</h3>
                <div className="h-1 w-16 bg-primary-600 my-4"></div>
                <p className="text-gray-600">{item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Everything You Need. Nothing You Don't.</h2>
            <p className="mt-4 text-xl text-gray-600">
              We focused on dispatch, not trying to be your accounting software.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: FiTruck, title: 'Real-Time Job Board', desc: 'See all jobs and their status at a glance. Drag-and-drop to assign.' },
              { icon: FiUsers, title: 'Technician Management', desc: 'Track each technician location, status, and daily performance.' },
              { icon: FiSmartphone, title: 'Mobile App for Techs', desc: 'Technicians update job status with one tap. No more phone calls.' },
              { icon: FiClock, title: 'Time Tracking', desc: 'Automatic tracking of travel time, job duration, and completion.' },
              { icon: FiBarChart2, title: 'Daily Reports', desc: 'Completion rates, technician utilization, average job times.' },
              { icon: FiCheckCircle, title: 'Customer Database', desc: 'Store customer info and see full service history instantly.' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
                <feature.icon className="h-10 w-10 text-primary-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-xl text-gray-600">
              No hidden fees. Cancel anytime. 14-day free trial.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING_TIERS.map((tier) => (
              <div 
                key={tier.id}
                className={`relative bg-white rounded-2xl shadow-lg ${
                  tier.popular ? 'ring-2 ring-primary-600 scale-105' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="mt-2 text-gray-600">{tier.techRange}</p>
                  <div className="mt-6">
                    <span className="text-5xl font-extrabold text-gray-900">
                      ${tier.price}
                    </span>
                    <span className="text-xl text-gray-600">/month</span>
                  </div>
                  <ul className="mt-8 space-y-4">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <FiCheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/signup"
                    className={`mt-8 block w-full text-center py-3 px-6 rounded-lg font-semibold transition ${
                      tier.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-gray-600">
            Auto-upgrades as your team grows. Downgrade anytime with no penalty.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Get Started in 3 Minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '1', title: 'Sign Up', desc: 'Enter your company info and choose your plan. No credit card for 14-day trial.' },
              { step: '2', title: 'Add Your Team', desc: 'Add technicians in seconds. We send them invite links automatically.' },
              { step: '3', title: 'Start Dispatching', desc: 'Create jobs, assign techs, and watch updates happen in real-time.' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Stop the Chaos?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join HVAC, plumbing, and electrical companies already saving 10+ hours per week.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Start Your Free Trial
          </Link>
          <p className="mt-4 text-primary-100">14 days free • No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/logo.png" alt="Cloud Dispatch Ops" className="h-8 w-8" />
                <FiTruck className="h-6 w-6 ml-2" />
                <span className="ml-2 text-xl font-bold">Cloud Dispatch Ops</span>
              </div>
              <p className="text-gray-400">
                Dispatch software built by dispatch managers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link to="/signup" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="/status" className="hover:text-white">System Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Cloud Dispatch Ops. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
