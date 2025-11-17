
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface Category {
    name: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface AppState {
  transactions: Transaction[];
  budgets: Budget[];
  budgetPlan: {
    fileName: string | null;
    content: string | null;
  };
}

export type AppAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'EDIT_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'IMPORT_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'UPLOAD_BUDGET_PLAN'; payload: { fileName: string; content: string } };

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}
