
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle, Shield, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// IMPORTANT: REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID FROM GOOGLE CLOUD CONSOLE
// Example format: "123456789-abcdefg.apps.googleusercontent.com"
const GOOGLE_CLIENT_ID = "236694838829-9ad88go06qqaf9nh00corvlnbu7unc2q.apps.googleusercontent.com";

const Login: React.FC = () => {
  const { login, register, loginWithGoogle, isLoading, error, setError } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: ''
  });

  // Initialize Google Sign-In
  useEffect(() => {
    /* global google */
    if ((window as any).google) {
        try {
            (window as any).google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse
            });
            
            // Render the button inside the div with id "googleButton"
            (window as any).google.accounts.id.renderButton(
                document.getElementById("googleButton"),
                { theme: "outline", size: "large", width: "100%" }
            );
        } catch (e) {
            console.error("Google Sign-In initialization failed", e);
        }
    }
  }, []);

  const handleGoogleResponse = (response: any) => {
      if (response.credential) {
          loginWithGoogle(response.credential);
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (isRegistering) {
              await register(formData.name, formData.email, formData.password);
          } else {
              await login(formData.email, formData.password);
          }
      } catch (err) {
          // Error handled in context
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-brand-navy w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side - Branding */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center bg-brand-light-navy/30 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_50%_120%,#64ffda,transparent)]" />
           
           <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-brand-accent rounded-xl">
                        <Wallet className="text-brand-dark" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-brand-white">
                    Budget<span className="text-brand-accent">Buddy</span>
                    </h1>
                </div>
                <p className="text-brand-slate text-lg mb-8">
                    Take control of your finances with AI-powered insights. Track, plan, and save smarter.
                </p>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-brand-white">
                        <CheckCircle className="text-brand-accent" size={20} />
                        <span>Smart Expense Tracking</span>
                    </li>
                     <li className="flex items-center gap-3 text-brand-white">
                        <CheckCircle className="text-brand-accent" size={20} />
                        <span>AI-Driven Budget Advice</span>
                    </li>
                     <li className="flex items-center gap-3 text-brand-white">
                        <CheckCircle className="text-brand-accent" size={20} />
                        <span>Secure Cloud Sync</span>
                    </li>
                </ul>
           </div>
        </div>

        {/* Right Side - Login/Register Form */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center bg-brand-navy">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-brand-white mb-2">
                    {isRegistering ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-brand-slate">
                    {isRegistering ? 'Join us to start tracking your finances.' : 'Sign in to access your dashboard.'}
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-300 text-sm">
                    {error}
                </div>
            )}
            
            {/* OAuth Buttons */}
            <div className="grid grid-cols-1 gap-3 mb-6">
                {/* GOOGLE BUTTON CONTAINER */}
                <div id="googleButton" className="w-full flex justify-center"></div>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-brand-light-navy"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-brand-navy text-brand-slate">Or with email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                    <div>
                        <label className="block text-sm font-medium text-brand-slate mb-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-slate" size={18} />
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required={isRegistering}
                                className="w-full bg-brand-light-navy border-brand-light-navy rounded-md py-2 pl-10 pr-4 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none" 
                                placeholder="John Doe" 
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-brand-slate mb-1">Email Address</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-slate" size={18} />
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-brand-light-navy border-brand-light-navy rounded-md py-2 pl-10 pr-4 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none" 
                            placeholder="you@example.com" 
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-slate mb-1">Password</label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-slate" size={18} />
                        <input 
                            type="password" 
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-brand-light-navy border-brand-light-navy rounded-md py-2 pl-10 pr-4 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none" 
                            placeholder="••••••••" 
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-brand-accent text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-brand-accent-dark transition-colors duration-300 shadow-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="animate-pulse">Processing...</span>
                    ) : (
                        <>
                            {isRegistering ? 'Sign Up' : 'Sign In'}
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>
            
            <div className="mt-6 text-center">
                <p className="text-brand-slate text-sm">
                    {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button 
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError(null);
                        }}
                        className="text-brand-accent hover:underline font-medium"
                    >
                        {isRegistering ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
