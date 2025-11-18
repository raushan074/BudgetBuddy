
import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import type { AppState, AppAction, AppContextType, Notification } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AppContext = createContext<AppContextType | undefined>(undefined);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
        return { 
            ...state, 
            transactions: action.payload.transactions, 
            budgets: action.payload.budgets, 
            recurring: action.payload.recurring || [],
            budgetPlan: action.payload.budgetPlan,
            isLoading: false
        };
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
    
    // Recurring Cases
    case 'ADD_RECURRING':
        return { ...state, recurring: [...state.recurring, action.payload] };
    case 'EDIT_RECURRING':
        return { ...state, recurring: state.recurring.map(r => r.id === action.payload.id ? action.payload : r) };
    case 'DELETE_RECURRING':
        return { ...state, recurring: state.recurring.filter(r => r.id !== action.payload) };

    // Notification Cases
    case 'ADD_NOTIFICATION':
        // Avoid duplicates based on title/type
        if (state.notifications.find(n => n.title === action.payload.title && n.type === action.payload.type)) {
            return state;
        }
        return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATIONS_READ':
        return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
        
    case 'UPLOAD_BUDGET_PLAN':
      return { ...state, budgetPlan: action.payload };
    case 'SET_LOADING':
        return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const initialState: AppState = {
    transactions: [],
    budgets: [],
    recurring: [],
    notifications: [],
    budgetPlan: { fileName: null, content: null },
    isLoading: true,
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  // 1. Load Initial Data
  useEffect(() => {
    if (user) {
        const loadData = async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const data = await api.data.getAll(user.id);
                dispatch({ type: 'SET_INITIAL_DATA', payload: data });
            } catch (error) {
                console.error("Failed to load data", error);
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };
        loadData();
    }
  }, [user]);

  // 2. Smart Alert System (Runs when data changes)
  useEffect(() => {
      if (!user || state.isLoading) return;

      // A. Bill Reminders
      state.recurring.forEach(rec => {
          if (!rec.active) return;
          const today = new Date();
          const due = new Date(rec.nextDueDate);
          const diffTime = due.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays >= 0 && diffDays <= 3) {
              dispatch({
                  type: 'ADD_NOTIFICATION',
                  payload: {
                      id: `bill_${rec.id}_${rec.nextDueDate}`,
                      type: 'info',
                      title: 'Bill Due Soon',
                      message: `Your ${rec.description} (${rec.frequency}) is due in ${diffDays === 0 ? 'today' : diffDays + ' days'}.`,
                      date: new Date().toISOString(),
                      read: false
                  }
              });
          }
      });

      // B. Budget Threshold Alerts
      state.budgets.forEach(budget => {
          // Calculate spent for this month
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          const spent = state.transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'expense' && 
                       t.category === budget.category &&
                       tDate.getMonth() === currentMonth &&
                       tDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);

          const percentage = (spent / budget.limit) * 100;

          if (percentage >= 100) {
              dispatch({
                  type: 'ADD_NOTIFICATION',
                  payload: {
                      id: `budget_err_${budget.category}_${currentMonth}`,
                      type: 'danger',
                      title: 'Budget Exceeded',
                      message: `You have exceeded your ${budget.category} budget by ₹${(spent - budget.limit).toFixed(0)}.`,
                      date: new Date().toISOString(),
                      read: false
                  }
              });
          } else if (percentage >= 80) {
              dispatch({
                  type: 'ADD_NOTIFICATION',
                  payload: {
                      id: `budget_warn_${budget.category}_${currentMonth}`,
                      type: 'warning',
                      title: 'Budget Warning',
                      message: `You have used ${percentage.toFixed(0)}% of your ${budget.category} budget.`,
                      date: new Date().toISOString(),
                      read: false
                  }
              });
          }
      });

  }, [state.transactions, state.budgets, state.recurring, user]);


  // Wrap dispatch to sync with API
  const enhancedDispatch = async (action: AppAction) => {
    if (!user) return; 

    // Optimistic update
    dispatch(action);

    // Sync with backend
    try {
        switch (action.type) {
            case 'ADD_TRANSACTION':
                await api.transactions.create(user.id, action.payload);
                break;
            case 'EDIT_TRANSACTION':
                await api.transactions.update(user.id, action.payload);
                break;
            case 'DELETE_TRANSACTION':
                await api.transactions.delete(user.id, action.payload);
                break;
            case 'IMPORT_TRANSACTIONS':
                await api.transactions.import(user.id, action.payload);
                break;
            case 'SET_BUDGET':
                await api.budgets.set(user.id, action.payload);
                break;
            case 'DELETE_BUDGET':
                await api.budgets.delete(user.id, action.payload);
                break;
            case 'ADD_RECURRING':
                await api.recurring.create(user.id, action.payload);
                break;
            case 'EDIT_RECURRING':
                await api.recurring.update(user.id, action.payload);
                break;
            case 'DELETE_RECURRING':
                await api.recurring.delete(user.id, action.payload);
                break;
            case 'UPLOAD_BUDGET_PLAN':
                await api.plans.save(user.id, action.payload);
                break;
        }
    } catch (error) {
        console.error("Sync error:", error);
    }
  };

  const refreshData = async () => {
      if (user) {
          const data = await api.data.getAll(user.id);
          dispatch({ type: 'SET_INITIAL_DATA', payload: data });
      }
  };

  return (
    <AppContext.Provider value={{ state, dispatch: enhancedDispatch, refreshData }}>
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
