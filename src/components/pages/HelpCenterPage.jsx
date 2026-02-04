import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiTruck, FiSearch, FiBook, FiUsers, FiSettings, FiCreditCard, FiBarChart2, FiSmartphone, FiMail } from 'react-icons/fi';

const faqs = [
  { category: 'Getting Started', icon: FiBook, items: [
    { q: 'How do I create my account?', a: 'Click "Start Free Trial" on our homepage, fill in your company name, full name, email, and password. You\'ll be guided through a quick onboarding process to set up your first technician and job.' },
    { q: 'How long is the free trial?', a: 'Your free trial lasts 14 days with full access to all Starter Plan features. No credit card is required to start. You\'ll be prompted to choose a plan before the trial ends.' },
    { q: 'How do I add my first technician?', a: 'Go to the Technicians page from the sidebar, click "+ Add Technician", fill in their name, email, and phone number. A login account is automatically created with a temporary password that you can share with them.' },
  ]},
  { category: 'Technician Management', icon: FiUsers, items: [
    { q: 'How do technicians log in?', a: 'Technicians log in at dispatchops-three.vercel.app/tech using the email and password created when you added them. You can copy the login URL from the Technicians page.' },
    { q: 'What if a technician forgets their password?', a: 'Technicians can click "Forgot your password?" on the login page. A reset link will be sent to their email address so they can set a new password.' },
    { q: 'How do I remove a technician?', a: 'Go to the Technicians page, find the technician in the list, and click the delete (trash) icon. This will remove them from your company roster.' },
  ]},
  { category: 'Dispatch & Jobs', icon: FiTruck, items: [
    { q: 'How do I create and assign a job?', a: 'Click "+ Create Job" on the Dispatch Board, fill in the customer details, address, and job type. You can assign a technician immediately or drag-and-drop the job to a tech column later.' },
    { q: 'How does real-time tracking work?', a: 'When technicians update their job status (En Route, In Progress, Completed) from their mobile dashboard, the Dispatch Board updates in real-time so you always know where your team stands.' },
    { q: 'Can I export my job data?', a: 'Yes! Go to the Reports page and click "Export CSV" to download a spreadsheet of all your job data with filters for date range.' },
  ]},
  { category: 'Settings & Configuration', icon: FiSettings, items: [
    { q: 'How do I update my company information?', a: 'Go to Settings from the sidebar. The Company tab lets you update your company name, phone, address, and other details.' },
    { q: 'Can I set my business hours?', a: 'Yes, the Business Hours tab in Settings lets you configure your operating hours for each day of the week, including marking days as closed.' },
  ]},
  { category: 'Billing & Plans', icon: FiCreditCard, items: [
    { q: 'What plans are available?', a: 'We offer three plans: Starter ($149.95/mo, up to 10 techs, 200 jobs/mo), Growth ($199.95/mo, up to 20 techs, 400 jobs/mo), and Professional ($275/mo, up to 40 techs, 800 jobs/mo).' },
    { q: 'How do I upgrade my plan?', a: 'Go to the Billing page from the sidebar and click "Upgrade Plan". You\'ll be redirected to a secure Stripe checkout to complete the upgrade.' },
    { q: 'How do I cancel my subscription?', a: 'Go to the Billing page and click "Manage Subscription" to access the Stripe Customer Portal where you can cancel, update payment methods, or view invoices.' },
  ]},
  { category: 'Mobile & Tech Portal', icon: FiSmartphone, items: [
    { q: 'Is there a mobile app?', a: 'Technicians access their dashboard through a mobile-optimized web portal at dispatchops-three.vercel.app/tech. It works on any smartphone browser — no app download needed.' },
    { q: 'What can technicians do from their portal?', a: 'Technicians can view assigned jobs, update job status (En Route, In Progress, Completed), see customer details and addresses, and manage their availability.' },
  ]},
];

const HelpCenterPage = () => {
  const [search, setSearch] = useState('');
  const [openItem, setOpenItem] = useState(null);

  const filtered = search
    ? faqs.map(cat => ({ ...cat, items: cat.items.filter(i => i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase())) })).filter(cat => cat.items.length > 0)
    : faqs;

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-lg text-gray-600 mb-6">Find answers to common questions about Cloud Dispatch Ops</p>
          <div className="max-w-xl mx-auto relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-lg" />
          </div>
        </div>

        {filtered.map((cat, ci) => (
          <div key={ci} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <cat.icon className="h-6 w-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">{cat.category}</h2>
            </div>
            <div className="space-y-3">
              {cat.items.map((item, ii) => {
                const key = `${ci}-${ii}`;
                return (
                  <div key={key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <button onClick={() => setOpenItem(openItem === key ? null : key)}
                      className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                      <span className="font-medium text-gray-900">{item.q}</span>
                      <span className="text-gray-400 text-xl ml-4">{openItem === key ? '−' : '+'}</span>
                    </button>
                    {openItem === key && (
                      <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-3">{item.a}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-12 bg-primary-50 border border-primary-200 rounded-xl p-8 text-center">
          <FiMail className="h-10 w-10 text-primary-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-gray-600 mb-4">Our support team is ready to assist you.</p>
          <Link to="/contact" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
