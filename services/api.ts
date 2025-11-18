
import type { Transaction, Budget, User, AuthResponse, RecurringTransaction } from '../types';

const API_URL = 'http://localhost:5000/api';

// Helper to get JWT token header
const getHeaders = () => {
    const token = localStorage.getItem('budget_buddy_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Helper to handle response
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network Error' }));
        throw new Error(error.error || `Request failed with status ${response.status}`);
    }
    return response.json();
};

export const api = {
    auth: {
        login: async (email: string, password: string): Promise<AuthResponse> => {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return handleResponse(response);
        },
        register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            return handleResponse(response);
        },
        loginWithProvider: async (provider: 'google' | 'github'): Promise<AuthResponse> => {
            const response = await fetch(`${API_URL}/auth/oauth-mock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider })
            });
            return handleResponse(response);
        }
    },
    data: {
        getAll: async (userId: string): Promise<any> => {
            const response = await fetch(`${API_URL}/data`, {
                method: 'GET',
                headers: getHeaders()
            });
            return handleResponse(response);
        }
    },
    transactions: {
        create: async (userId: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
            const response = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(transaction)
            });
            return handleResponse(response);
        },
        update: async (userId: string, transaction: Transaction): Promise<Transaction> => {
            const response = await fetch(`${API_URL}/transactions/${transaction.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(transaction)
            });
            return handleResponse(response);
        },
        delete: async (userId: string, id: string): Promise<string> => {
            const response = await fetch(`${API_URL}/transactions/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            await handleResponse(response);
            return id;
        },
        import: async (userId: string, transactions: Transaction[]): Promise<Transaction[]> => {
            const response = await fetch(`${API_URL}/transactions/import`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(transactions)
            });
            return handleResponse(response);
        }
    },
    budgets: {
        set: async (userId: string, budget: Budget): Promise<Budget> => {
            const response = await fetch(`${API_URL}/budgets`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(budget)
            });
            return handleResponse(response);
        },
        delete: async (userId: string, category: string): Promise<string> => {
            const response = await fetch(`${API_URL}/budgets/${category}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return category;
        }
    },
    recurring: {
        create: async (userId: string, recurring: RecurringTransaction): Promise<RecurringTransaction> => {
            const response = await fetch(`${API_URL}/recurring`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(recurring)
            });
            return handleResponse(response);
        },
        update: async (userId: string, recurring: RecurringTransaction): Promise<RecurringTransaction> => {
            const response = await fetch(`${API_URL}/recurring/${recurring.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(recurring)
            });
            return handleResponse(response);
        },
        delete: async (userId: string, id: string): Promise<string> => {
            const response = await fetch(`${API_URL}/recurring/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return id;
        }
    },
    plans: {
        save: async (userId: string, plan: { fileName: string; content: string }): Promise<{ fileName: string; content: string }> => {
             const response = await fetch(`${API_URL}/plans`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(plan)
            });
            return handleResponse(response);
        }
    }
};
