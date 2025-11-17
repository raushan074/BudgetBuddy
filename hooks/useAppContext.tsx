
import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import type { AppState, AppAction, AppContextType } from '../types';
import { mockTransactions, mockBudgets } from '../services/mockData';

const AppContext = createContext<AppContextType | undefined>(undefined);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'EDIT_TRANSACTION':
      return { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    case 'IMPORT_TRANSACTIONS':
      return { ...state, transactions: [...action.payload, ...state.transactions] };
    case 'SET_BUDGET':
      const existingBudget = state.budgets.find(b => b.category === action.payload.category);
      if (existingBudget) {
        return { ...state, budgets: state.budgets.map(b => b.category === action.payload.category ? action.payload : b) };
      }
      return { ...state, budgets: [...state.budgets, action.payload] };
    case 'DELETE_BUDGET':
        return { ...state, budgets: state.budgets.filter(b => b.category !== action.payload) };
    case 'UPLOAD_BUDGET_PLAN':
      return { ...state, budgetPlan: action.payload };
    default:
      return state;
  }
};

const getInitialState = (): AppState => {
    try {
        const item = window.localStorage.getItem('budgetBuddyState');
        if (item) {
            return JSON.parse(item);
        }
    } catch (error) {
        console.error("Error reading from localStorage", error);
    }
    return {
        transactions: mockTransactions,
        budgets: mockBudgets,
        budgetPlan: { fileName: null, content: null },
    };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  useEffect(() => {
    try {
        window.localStorage.setItem('budgetBuddyState', JSON.stringify(state));
    } catch (error) {
        console.error("Error writing to localStorage", error);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
