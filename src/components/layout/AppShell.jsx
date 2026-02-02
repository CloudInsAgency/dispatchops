import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { FiLogOut, FiMenu, FiX, FiGrid, FiUsers, FiSettings, FiCreditCard } from 'react-icons/fi';

const AppShell = ({ children }) => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { techCount, monthlyJobCount, planDetails } = usePlanLimits(userProfile);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const companyName = userProfile?.company?.name || userProfile?.fullName || 'Your Company';

  const navItems = [
    { to: '/dashboard', icon: FiGrid, label: 'Dispatch Board' },
    { to: '/technicians', icon: FiUsers, label: 'Technicians' },
    { to: '/settings', icon: FiSettings, label: 'Settings' },
    { to: '/billing', icon: FiCreditCard, label: 'Billing' },
  ];

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
          isActive ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
      onClick={() => setMobileMenuOpen(false)}
    >
      <Icon className="h-5 w-5" />
      {sidebarOpen && <span className="font-medium">{label}</span>}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Cloud Dispatch Ops" className="h-8 w-8" />
            {sidebarOpen && <span className="text-lg font-bold text-gray-900">Dispatch Ops</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600">
            {sidebarOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900 truncate">{companyName}</p>
            <p className="text-xs text-gray-500 mt-1">{planDetails?.name || 'Starter Plan'}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Technicians</span>
                <span className="font-medium text-gray-700">{techCount}/{planDetails?.techLimit || 10}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Jobs this month</span>
                <span className="font-medium text-gray-700">{monthlyJobCount}/{planDetails?.jobLimit || 200}</span>
              </div>
            </div>
          </div>
        )}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (<NavItem key={item.to} {...item} />))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition">
            <FiLogOut className="h-5 w-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Cloud Dispatch Ops" className="h-8 w-8" />
            <span className="text-lg font-bold text-gray-900">Dispatch Ops</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 hover:text-gray-900">
            {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{companyName}</p>
              <p className="text-xs text-gray-500 mt-1">{planDetails?.name} — {techCount}/{planDetails?.techLimit} techs</p>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (<NavItem key={item.to} {...item} />))}
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition">
                <FiLogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}
      <main className="flex-1 md:overflow-auto">
        <div className="md:hidden h-16" />
        {children}
      </main>
    </div>
  );
};

export default AppShell;
