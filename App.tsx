
import React, { useState, useMemo } from 'react';
import { Home, List, PieChart, Upload, Menu, X, Sun, Moon, LogOut, Settings, CalendarClock, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import Plan from './components/Plan';
import Recurring from './components/Recurring'; // New Import
import Login from './components/Login';
import { AppProvider, useAppContext } from './hooks/useAppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';


type View = 'dashboard' | 'transactions' | 'budgets' | 'plan' | 'recurring';

const MainContent: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { state, dispatch } = useAppContext(); 
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Derived Notifications count
  const unreadCount = state.notifications.filter(n => !n.read).length;

  if (authLoading) {
      return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-brand-white">Loading...</div>;
  }

  if (!user) {
      return <Login />;
  }

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
    if (state.isLoading) {
        return <div className="flex items-center justify-center h-full text-brand-white text-xl">Loading data...</div>;
    }
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'budgets':
        return <Budgets />;
      case 'plan':
        return <Plan />;
      case 'recurring':
        return <Recurring />;
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
      
      <div className="p-4 flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-accent">
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt="User" />
          </div>
          <div className="overflow-hidden">
              <p className="text-brand-white font-semibold truncate">{user.name}</p>
              <p className="text-xs text-brand-slate truncate">{user.email}</p>
          </div>
      </div>

      <ul className="flex flex-col p-4 flex-1">
        <NavItem view="dashboard" icon={<Home size={24} />} label="Dashboard" />
        <NavItem view="transactions" icon={<List size={24} />} label="Transactions" />
        <NavItem view="budgets" icon={<PieChart size={24} />} label="Budgets" />
        <NavItem view="recurring" icon={<CalendarClock size={24} />} label="Recurring & Bills" />
        <NavItem view="plan" icon={<Upload size={24} />} label="Budget Plan" />
      </ul>
      
      <div className="p-4 border-t border-brand-light-navy">
         <button 
            onClick={toggleTheme}
            className="flex items-center w-full p-3 my-1 text-brand-slate hover:text-brand-white hover:bg-brand-light-navy rounded-md transition-colors"
         >
             {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
             <span className="ml-3">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
         </button>
         <button 
            onClick={logout}
            className="flex items-center w-full p-3 my-1 text-brand-slate hover:text-red-400 hover:bg-brand-light-navy rounded-md transition-colors"
         >
             <LogOut size={24} />
             <span className="ml-3">Sign Out</span>
         </button>
      </div>
    </>
  );

  return (
      <div className="flex min-h-screen font-sans text-brand-light-slate bg-brand-dark transition-colors duration-300">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-brand-navy transition-all duration-300 border-r border-brand-light-navy">
          {navContent}
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-4 right-4 z-50 flex gap-2">
             {/* Mobile Notification Button */}
             <button
                onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    setIsMobileMenuOpen(false);
                }}
                className="relative p-2 rounded-md bg-brand-light-navy text-brand-white shadow-lg"
            >
                <Bell size={24} />
                {unreadCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-brand-light-navy"></span>}
            </button>

            <button
                onClick={toggleTheme}
                className="p-2 rounded-md bg-brand-light-navy text-brand-white shadow-lg"
            >
                {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md bg-brand-light-navy text-brand-white shadow-lg"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>

        {/* Notification Panel (Overlay) */}
        <AnimatePresence>
            {isNotificationOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="fixed top-16 right-4 lg:top-6 lg:right-6 w-80 bg-brand-navy border border-brand-light-navy rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
                >
                    <div className="p-4 border-b border-brand-light-navy flex justify-between items-center sticky top-0 bg-brand-navy z-10">
                        <h3 className="font-bold text-brand-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={() => dispatch({ type: 'MARK_NOTIFICATIONS_READ' })} 
                                className="text-xs text-brand-accent hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                         <button onClick={() => setIsNotificationOpen(false)} className="lg:hidden text-brand-slate"><X size={18}/></button>
                    </div>
                    <div className="p-2">
                        {state.notifications.length === 0 ? (
                            <p className="text-center text-brand-slate py-4 text-sm">No new notifications</p>
                        ) : (
                            state.notifications.map(n => (
                                <div key={n.id} className={`p-3 mb-2 rounded-lg ${n.read ? 'opacity-60' : 'bg-brand-light-navy/30'} border-l-4 ${n.type === 'danger' ? 'border-red-500' : n.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'}`}>
                                    <p className="text-sm font-semibold text-brand-white mb-1">{n.title}</p>
                                    <p className="text-xs text-brand-slate">{n.message}</p>
                                    <p className="text-[10px] text-brand-slate/50 mt-2 text-right">{new Date(n.date).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

         {/* Desktop Notification Bell (In Main Area top right) */}
         <div className="hidden lg:block absolute top-6 right-6 z-40">
             <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 rounded-full hover:bg-brand-light-navy text-brand-slate hover:text-brand-white transition-colors"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-brand-dark">
                        {unreadCount}
                    </span>
                )}
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


        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto relative">
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
  );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <AppProvider>
                    <MainContent />
                </AppProvider>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;
