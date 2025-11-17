
import React, { useState, useMemo } from 'react';
import { Home, List, PieChart, Upload, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import Plan from './components/Plan';
import { AppProvider } from './hooks/useAppContext';


type View = 'dashboard' | 'transactions' | 'budgets' | 'plan';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItem: React.FC<{
    view: View;
    icon: React.ReactNode;
    label: string;
  }> = ({ view, icon, label }) => (
    <li
      className={`relative flex items-center p-3 my-1 font-medium rounded-md cursor-pointer transition-colors duration-300 group ${
        currentView === view
          ? 'bg-brand-accent text-brand-dark'
          : 'text-brand-slate hover:bg-brand-light-navy hover:text-brand-white'
      }`}
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
    >
      {icon}
      <span className="w-52 ml-3">{label}</span>
      {currentView === view && (
        <motion.div
          className="absolute left-0 top-0 h-full w-1 bg-brand-accent rounded-r-md"
          layoutId="active-indicator"
        />
      )}
    </li>
  );
  
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'budgets':
        return <Budgets />;
      case 'plan':
        return <Plan />;
      default:
        return <Dashboard />;
    }
  };

  const navContent = (
    <>
      <div 
        className="flex items-center justify-center h-20 shadow-md bg-brand-navy/50 cursor-pointer"
        onClick={() => {
          setCurrentView('dashboard');
          setIsMobileMenuOpen(false);
        }}
      >
        <h1 className="text-3xl font-bold text-brand-white">
          Budget<span className="text-brand-accent">Buddy</span>
        </h1>
      </div>
      <ul className="flex flex-col p-4">
        <NavItem view="dashboard" icon={<Home size={24} />} label="Dashboard" />
        <NavItem view="transactions" icon={<List size={24} />} label="Transactions" />
        <NavItem view="budgets" icon={<PieChart size={24} />} label="Budgets" />
        <NavItem view="plan" icon={<Upload size={24} />} label="Budget Plan" />
      </ul>
    </>
  );

  return (
    <AppProvider>
      <div className="flex min-h-screen font-sans text-brand-light-slate bg-brand-dark">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-brand-navy transition-all duration-300">
          {navContent}
        </aside>

        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 right-4 z-50">
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md bg-brand-light-navy text-brand-white"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.aside
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 left-0 h-full w-64 bg-brand-navy z-40 lg:hidden shadow-xl"
                >
                    {navContent}
                </motion.aside>
            )}
        </AnimatePresence>


        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </AppProvider>
  );
};

export default App;
