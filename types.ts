
// Fix: Import specific types from React to resolve 'React' namespace errors.
import type { ComponentType, Dispatch } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  token?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export interface RecurringTransaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    frequency: 'weekly' | 'monthly' | 'yearly';
    nextDueDate: string;
    active: boolean;
}

export interface Notification {
    id: string;
    type: 'warning' | 'info' | 'danger';
    title: string;
    message: string;
    date: string;
    read: boolean;
}

export interface Budget {
  id?: string;
  category: string;
  limit: number;
}

export interface Category {
    name: string;
    // Fix: Changed React.ComponentType to ComponentType to match the new import.
    icon: ComponentType<{ size?: number; className?: string }>;
}

export interface AppState {
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringTransaction[]; // New state
  notifications: Notification[];     // New state
  budgetPlan: {
    fileName: string | null;
    content: string | null;
  };
  isLoading: boolean;
}

export type AppAction =
  | { type: 'SET_INITIAL_DATA'; payload: { transactions: Transaction[]; budgets: Budget[]; recurring: RecurringTransaction[]; budgetPlan: { fileName: string | null; content: string | null; } } }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'EDIT_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'IMPORT_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'ADD_RECURRING'; payload: RecurringTransaction }
  | { type: 'EDIT_RECURRING'; payload: RecurringTransaction }
  | { type: 'DELETE_RECURRING'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATIONS_READ'; }
  | { type: 'UPLOAD_BUDGET_PLAN'; payload: { fileName: string; content: string } }
  | { type: 'SET_LOADING'; payload: boolean };

export interface AppContextType {
  state: AppState;
  // Fix: Changed React.Dispatch to Dispatch to match the new import.
  dispatch: Dispatch<AppAction>;
  refreshData: () => Promise<void>;
}
