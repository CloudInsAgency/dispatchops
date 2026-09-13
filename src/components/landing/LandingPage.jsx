import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiTruck, FiClock, FiUsers, FiBarChart2, FiSmartphone, FiArrowRight, FiPlayCircle } from 'react-icons/fi';
import { PRICING_TIERS } from '../../config/config';

const DEMO_URL = 'https://youtu.be/Ha8-2Tj_o10';

/* Small caps label above a section heading. Gives the page a rhythm so each
   block announces itself instead of every section opening with a bare H2. */
const Eyebrow = ({ children }) => (
  <p className="text-xs font-bold tracking-[0.18em] uppercase text-brand-navy mb-3">
    {children}
  </p>
);

/* Screenshots are real captures of the product, not mockups. Framed rather
   than dropped flat on the page so they read as software instead of clip art. */
const Shot = ({ src, alt, className = '', width, height, priority = false }) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    loading={priority ? 'eager' : 'lazy'}
    decoding="async"
    className={`w-full rounded-xl ring-1 ring-gray-200/80 shadow-2xl shadow-brand-navy/10 ${className}`}
  />
);

const LandingPage = () => {
  return (
    /* overflow-x-hidden is a guard, not the fix. The page overflowed at 390px
       before this rewrite because the h1 was a fixed 48px and "Dispatch
       Software" is simply wider than a phone. The type scale below starts
       small and steps up; this stops any future wide child scrolling the body. */
    <div className="min-h-screen bg-white antialiased overflow-x-hidden">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* One mark, not two. The logo already contains the icon. */}
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="" width="36" height="36" className="h-9 w-9 rounded-md" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Cloud Dispatch Ops
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[15px] text-gray-600 hover:text-brand-navy transition">Features</a>
              <a href="#product" className="text-[15px] text-gray-600 hover:text-brand-navy transition">Product</a>
              <a href="#pricing" className="text-[15px] text-gray-600 hover:text-brand-navy transition">Pricing</a>
              <Link to="/login" className="text-[15px] text-gray-600 hover:text-brand-navy transition">Login</Link>
              <Link
                to="/signup"
                className="bg-brand-navy text-white px-5 py-2.5 rounded-lg text-[15px] font-semibold hover:bg-brand-navyDark transition shadow-sm"
              >
                Start Free Trial
              </Link>
            </div>
            <Link
              to="/signup"
              className="md:hidden bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — the screenshot is the argument. A dispatcher decides whether
          this is real software within a second of seeing the board. */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F4F7FB] via-[#F9FBFD] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-0 sm:pt-20">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-3.5 py-1.5 text-xs sm:text-[13px] font-medium text-gray-700 shadow-sm max-w-full">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-amber flex-shrink-0" />
              <span className="truncate">Built for HVAC, plumbing &amp; electrical teams</span>
            </span>

            <h1 className="mt-6 text-[1.85rem] xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.12] sm:leading-[1.08] tracking-tight">
              Dispatch Software Built By{' '}
              <span className="text-brand-navy">Dispatch Managers</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Stop juggling spreadsheets and phone calls. Assign the day in minutes,
              see every technician's status in real time, and know who is running late
              before the customer calls to tell you.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 bg-brand-navy text-white px-7 py-3.5 rounded-lg text-base font-semibold hover:bg-brand-navyDark transition shadow-lg shadow-brand-navy/20"
              >
                Start 14-Day Free Trial
                <FiArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-800 px-7 py-3.5 rounded-lg text-base font-semibold border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition"
              >
                <FiPlayCircle className="h-5 w-5 text-brand-navy" />
                Watch the 2-minute tour
              </a>
            </div>

            <p className="mt-5 text-sm text-gray-500">
              No credit card required · Cancel anytime · Setup in 3 minutes
            </p>
          </div>

          {/* Product shot, bled into the next section so the page reads as
              continuous rather than as stacked boxes. */}
          <div className="mt-14 sm:mt-16 relative">
            <div className="absolute inset-x-0 bottom-0 h-32 bg-white" aria-hidden="true" />
            <div className="relative mx-auto max-w-6xl">
              <Shot
                src="/shot-board.jpg"
                alt="The Cloud Dispatch Ops dispatch board, showing jobs grouped into Unassigned, Scheduled, En Route and In Progress columns alongside the technician list and the day's totals."
                width="1800"
                height="785"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Eyebrow>The daily grind</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Sound Familiar?</h2>
            <p className="mt-4 text-lg text-gray-600">We have been there. Here is what we fixed.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { problem: '"Where is my technician?"', solution: 'Real-time status on every tech, without picking up the phone.', icon: FiUsers },
              { problem: 'Thirty minutes assigning the day', solution: 'Drag-and-drop the whole board in under five.', icon: FiClock },
              { problem: 'No idea who is actually performing', solution: 'Completion rates and utilisation in one click.', icon: FiBarChart2 }
            ].map((item, idx) => (
              <div
                key={idx}
                className="group bg-white p-7 rounded-xl border border-gray-200 hover:border-brand-navy/30 hover:shadow-lg hover:shadow-brand-navy/5 transition"
              >
                {/* Amber, not red. Red fought both the navy logo and the blue UI. */}
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-amber/15 mb-5">
                  <item.icon className="h-5 w-5 text-brand-amberDark" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">{item.problem}</h3>
                <div className="h-0.5 w-10 bg-brand-navy my-4 rounded-full" />
                <p className="text-[15px] text-gray-600 leading-relaxed">{item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product tour — real screenshots, captioned */}
      <section id="product" className="py-20 sm:py-24 bg-[#F7F9FC] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <Eyebrow>Inside the product</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              This is the whole job, start to finish
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Four screens. No modules to buy, no implementation call.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-10 items-start max-w-5xl mx-auto">
            <figure className="flex flex-col">
              <Shot
                src="/shot-tech.jpg"
                alt="The Add Technician dialog in Cloud Dispatch Ops, collecting full name, email address, phone number and availability status."
                width="900"
                height="1052"
              />
              <figcaption className="mt-5">
                <h3 className="text-lg font-bold text-gray-900">1. Add your crew once</h3>
                <p className="mt-1.5 text-[15px] text-gray-600 leading-relaxed">
                  Name, email, phone. They get an invite link to the mobile app and show
                  up on the board as available. No seat negotiation, no setup call.
                </p>
              </figcaption>
            </figure>

            <figure className="flex flex-col">
              <Shot
                src="/shot-job.jpg"
                alt="The create-job form in Cloud Dispatch Ops, capturing customer name, phone, service address, job type and notes."
                width="1000"
                height="1130"
              />
              <figcaption className="mt-5">
                <h3 className="text-lg font-bold text-gray-900">2. Create a job in seconds</h3>
                <p className="mt-1.5 text-[15px] text-gray-600 leading-relaxed">
                  Customer, address, job type, notes. It lands in Unassigned and waits
                  for a technician.
                </p>
              </figcaption>
            </figure>
          </div>

          {/* Location. Real UI, sample data — a genuine capture would publish a
              real technician's name and their actual coordinates. */}
          <div className="mt-10 lg:mt-12 max-w-5xl mx-auto">
            <Shot
              src="/shot-map.jpg"
              alt="The dispatch board map panel, showing two technicians' routes for the day with pins marking where each job was marked en route, arrived and completed."
              width="1800"
              height="732"
            />
            <div className="mt-5 max-w-2xl">
              <h3 className="text-lg font-bold text-gray-900">3. See where the crew actually went</h3>
              <p className="mt-1.5 text-[15px] text-gray-600 leading-relaxed">
                A position is recorded the moment a technician marks a job en route,
                arrived or complete — so when a customer rings asking where their
                engineer is, you answer from the screen instead of ringing the van.
                It is not constant tracking: nothing is recorded between jobs, and
                each technician opts in.
              </p>
            </div>
          </div>

          <div className="mt-10 lg:mt-12 max-w-5xl mx-auto">
            <div className="rounded-xl bg-brand-navy px-8 py-10 sm:px-12 sm:py-12 text-white">
              <div className="max-w-2xl">
                <FiTruck className="h-9 w-9 text-brand-amber mb-5" />
                <h3 className="text-2xl sm:text-3xl font-bold leading-snug tracking-tight">
                  4. Then drag it across the board
                </h3>
                <p className="mt-4 text-[15px] sm:text-base text-blue-100 leading-relaxed">
                  Unassigned to Scheduled to En Route to In Progress. The technician sees
                  the change on their phone, and you see their update on the board — which
                  is the entire reason the phone stops ringing.
                </p>
                <Link
                  to="/signup"
                  className="mt-8 inline-flex items-center gap-2 bg-white text-brand-navy px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Try it on your own jobs
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <Eyebrow>What you get</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Everything You Need. Nothing You Don't.
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We focused on dispatch, not trying to be your accounting software.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: FiTruck, title: 'Real-Time Job Board', desc: 'See every job and its status at a glance. Drag-and-drop to assign.' },
              { icon: FiUsers, title: 'Technician Management', desc: 'See where each technician was at every job status change, plus daily performance.' },
              { icon: FiSmartphone, title: 'Mobile App for Techs', desc: 'Technicians update job status with one tap. No more phone calls.' },
              { icon: FiClock, title: 'Time Tracking', desc: 'Automatic tracking of travel time, job duration and completion.' },
              { icon: FiBarChart2, title: 'Daily Reports', desc: 'Completion rates, technician utilisation, average job times.' },
              { icon: FiCheckCircle, title: 'Customer Database', desc: 'Store customer info and see full service history instantly.' }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-brand-navy/30 hover:shadow-lg hover:shadow-brand-navy/5 transition"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-navy/8 mb-4">
                  <feature.icon className="h-5 w-5 text-brand-navy" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">{feature.title}</h3>
                <p className="text-[15px] text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-24 bg-[#F7F9FC] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              No hidden fees. Cancel anytime. 14-day free trial.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`relative bg-white rounded-2xl flex flex-col ${
                  tier.popular
                    ? 'ring-2 ring-brand-navy shadow-xl shadow-brand-navy/10 md:-mt-3 md:mb-3'
                    : 'border border-gray-200 shadow-sm'
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-brand-navy text-white px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-7 flex flex-col h-full">
                  <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{tier.techRange}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                      ${tier.price}
                    </span>
                    <span className="text-base text-gray-500">/month</span>
                  </div>
                  <ul className="mt-7 space-y-3 flex-1">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <FiCheckCircle className="h-[18px] w-[18px] text-brand-navy mt-0.5 flex-shrink-0" />
                        <span className="text-[15px] text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/signup"
                    className={`mt-7 block w-full text-center py-3 px-6 rounded-lg font-semibold transition ${
                      tier.popular
                        ? 'bg-brand-navy text-white hover:bg-brand-navyDark shadow-sm'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center mt-10 text-[15px] text-gray-600">
            Auto-upgrades as your team grows. Downgrade anytime with no penalty.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Eyebrow>Getting started</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Get Started in 3 Minutes
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {[
              { step: '1', title: 'Sign Up', desc: 'Enter your company info and choose your plan. No credit card for the 14-day trial.' },
              { step: '2', title: 'Add Your Team', desc: 'Add technicians in seconds. We send them invite links automatically.' },
              { step: '3', title: 'Start Dispatching', desc: 'Create jobs, assign techs, and watch updates happen in real time.' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-brand-navy text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-5">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-[15px] text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA.
          The previous copy read "Join HVAC, plumbing, and electrical companies
          already saving 10+ hours per week", which asserts existing customers
          and their results. Until there are named customers to cite, this
          states what the product is built to do instead. */}
      <section className="py-20 sm:py-24 bg-brand-navy">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 tracking-tight">
            Ready to Stop the Chaos?
          </h2>
          <p className="text-lg text-blue-100 mb-9 leading-relaxed">
            Built for HVAC, plumbing and electrical teams — by someone who ran
            dispatch for fifteen years and got tired of the spreadsheet.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-brand-navy px-8 py-4 rounded-lg text-base font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Start Your Free Trial
            <FiArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-5 text-sm text-blue-200">
            14 days free · No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="" width="32" height="32" className="h-8 w-8 rounded-md" />
                <span className="text-lg font-bold">Cloud Dispatch Ops</span>
              </div>
              <p className="text-[15px] text-gray-400 leading-relaxed">
                Dispatch software built by dispatch managers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase text-gray-300">Product</h4>
              <ul className="space-y-2.5 text-[15px] text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#product" className="hover:text-white transition">Product tour</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><Link to="/signup" className="hover:text-white transition">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase text-gray-300">Support</h4>
              <ul className="space-y-2.5 text-[15px] text-gray-400">
                <li><Link to="/help" className="hover:text-white transition">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link to="/status" className="hover:text-white transition">System Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase text-gray-300">Company</h4>
              <ul className="space-y-2.5 text-[15px] text-gray-400">
                <li><Link to="/about" className="hover:text-white transition">About</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-[15px] text-gray-400">
            <p>&copy; 2026 Cloud Dispatch Ops. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
