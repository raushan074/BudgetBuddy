
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'github') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('budget_buddy_user');
    const token = localStorage.getItem('budget_buddy_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const saveSession = (user: User, token: string) => {
    setUser(user);
    localStorage.setItem('budget_buddy_user', JSON.stringify(user));
    localStorage.setItem('budget_buddy_token', token);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await api.auth.login(email, password);
        saveSession(response.user, response.token);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
        throw err;
    } finally {
        setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
          const response = await api.auth.register(name, email, password);
          saveSession(response.user, response.token);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Registration failed');
          throw err;
      } finally {
          setIsLoading(false);
      }
  };

  const loginWithProvider = async (provider: 'google' | 'github') => {
      setIsLoading(true);
      setError(null);
      try {
          const response = await api.auth.loginWithProvider(provider);
          saveSession(response.user, response.token);
      } catch (err) {
           setError(err instanceof Error ? err.message : 'OAuth Login failed');
           throw err;
      } finally {
          setIsLoading(false);
      }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('budget_buddy_user');
    localStorage.removeItem('budget_buddy_token');
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithProvider, logout, isLoading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
