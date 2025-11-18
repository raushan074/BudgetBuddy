
import type { Transaction, Budget, User, AuthResponse, RecurringTransaction } from '../types';
import { mockTransactions, mockBudgets } from './mockData';

const DB_KEY = 'budget_buddy_db_v4';
const USERS_KEY = 'budget_buddy_users_v1';
const SIMULATED_DELAY = 600; // ms

// --- Mock Database Types ---
interface DBUser extends User {
    passwordHash: string;
}

interface DBData {
    transactions: Transaction[];
    budgets: Budget[];
    recurring: RecurringTransaction[];
    budgetPlan: { fileName: string | null; content: string | null };
}

// --- Helper Functions ---
const delay = <T>(data: T, time = SIMULATED_DELAY): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), time));
};

const getUsers = (): DBUser[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
};

const saveUser = (user: DBUser) => {
    const users = getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getUserDB = (userId: string): DBData => {
    const store = localStorage.getItem(`${DB_KEY}_${userId}`);
    if (store) {
        return JSON.parse(store);
    }
    // New user starts with empty data but some defaults
    const initialData: DBData = {
        transactions: [],
        budgets: [],
        recurring: [],
        budgetPlan: { fileName: null, content: null }
    };
    localStorage.setItem(`${DB_KEY}_${userId}`, JSON.stringify(initialData));
    return initialData;
};

const saveUserDB = (userId: string, data: DBData) => {
    localStorage.setItem(`${DB_KEY}_${userId}`, JSON.stringify(data));
};

// --- Mock Backend Implementation ---
export const mockBackend = {
    
    // Auth Controllers
    async login(email: string, password: string): Promise<AuthResponse> {
        await delay(null);
        const users = getUsers();
        const user = users.find(u => u.email === email);
        
        if (!user) throw new Error('Invalid email or password');
        if (user.passwordHash !== btoa(password)) throw new Error('Invalid email or password');

        const token = `mock_jwt_${user.id}_${Date.now()}`;
        return { 
            user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar }, 
            token 
        };
    },

    async register(name: string, email: string, password: string): Promise<AuthResponse> {
        await delay(null);
        const users = getUsers();
        if (users.find(u => u.email === email)) throw new Error('User already exists');

        const newUser: DBUser = {
            id: `user_${Date.now()}`,
            name,
            email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
            passwordHash: btoa(password)
        };

        saveUser(newUser);
        
        // Initialize with some mock data for demo
        saveUserDB(newUser.id, { 
            transactions: mockTransactions.map(t => ({...t, id: `trans_${Date.now()}_${Math.random()}`})),
            budgets: mockBudgets, 
            recurring: [
                {
                    id: 'rec_1',
                    description: 'Netflix Subscription',
                    amount: 650,
                    category: 'Entertainment',
                    type: 'expense',
                    frequency: 'monthly',
                    nextDueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], // Due in 2 days
                    active: true
                },
                {
                    id: 'rec_2',
                    description: 'Rent',
                    amount: 15000,
                    category: 'Housing',
                    type: 'expense',
                    frequency: 'monthly',
                    nextDueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0],
                    active: true
                }
            ],
            budgetPlan: { fileName: null, content: null } 
        });

        const token = `mock_jwt_${newUser.id}_${Date.now()}`;
        return { 
            user: { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar }, 
            token 
        };
    },

    async loginWithProvider(provider: string): Promise<AuthResponse> {
        await delay(null, 1000);
        const users = getUsers();
        const email = `demo_${provider}@example.com`;
        
        let user = users.find(u => u.email === email);

        if (!user) {
            user = {
                id: `user_${provider}_${Date.now()}`,
                name: `Demo ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
                email: email,
                avatar: provider === 'github' 
                    ? 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' 
                    : 'https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA',
                passwordHash: 'oauth_user'
            };
            saveUser(user);
            // Add default recurring for OAuth users too
             saveUserDB(user.id, { 
                transactions: mockTransactions.map(t => ({...t, id: `trans_${Date.now()}_${Math.random()}`})),
                budgets: mockBudgets, 
                recurring: [
                     {
                        id: 'rec_1',
                        description: 'Internet Bill',
                        amount: 1200,
                        category: 'Housing',
                        type: 'expense',
                        frequency: 'monthly',
                        nextDueDate: new Date().toISOString().split('T')[0], // Due today
                        active: true
                    }
                ],
                budgetPlan: { fileName: null, content: null } 
            });
        }

        const token = `mock_jwt_${user.id}_${Date.now()}`;
        return { 
            user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar }, 
            token 
        };
    },

    // Data Controllers
    async getData(userId: string): Promise<DBData> {
        const data = getUserDB(userId);
        return delay(data);
    },

    // ... existing transaction methods ...
    async addTransaction(userId: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
        const data = getUserDB(userId);
        const newTransaction = { ...transaction, id: `t_${Date.now()}` };
        data.transactions = [newTransaction, ...data.transactions];
        saveUserDB(userId, data);
        return delay(newTransaction);
    },

    async updateTransaction(userId: string, transaction: Transaction): Promise<Transaction> {
        const data = getUserDB(userId);
        data.transactions = data.transactions.map(t => t.id === transaction.id ? transaction : t);
        saveUserDB(userId, data);
        return delay(transaction);
    },

    async deleteTransaction(userId: string, id: string): Promise<string> {
        const data = getUserDB(userId);
        data.transactions = data.transactions.filter(t => t.id !== id);
        saveUserDB(userId, data);
        return delay(id);
    },

    async importTransactions(userId: string, transactions: Transaction[]): Promise<Transaction[]> {
        const data = getUserDB(userId);
        const newTransactions = transactions.map(t => ({...t, id: t.id || `t_${Math.random()}`}));
        data.transactions = [...newTransactions, ...data.transactions];
        saveUserDB(userId, data);
        return delay(newTransactions);
    },

    async setBudget(userId: string, budget: Budget): Promise<Budget> {
        const data = getUserDB(userId);
        const existingIndex = data.budgets.findIndex(b => b.category === budget.category);
        if (existingIndex >= 0) {
            data.budgets[existingIndex] = { ...budget, id: data.budgets[existingIndex].id };
        } else {
            data.budgets.push({ ...budget, id: `b_${Date.now()}` });
        }
        saveUserDB(userId, data);
        return delay(budget);
    },

    async deleteBudget(userId: string, category: string): Promise<string> {
        const data = getUserDB(userId);
        data.budgets = data.budgets.filter(b => b.category !== category);
        saveUserDB(userId, data);
        return delay(category);
    },

    async saveBudgetPlan(userId: string, plan: { fileName: string; content: string }): Promise<{ fileName: string; content: string }> {
        const data = getUserDB(userId);
        data.budgetPlan = plan;
        saveUserDB(userId, data);
        return delay(plan);
    },

    // Recurring Methods
    async addRecurring(userId: string, recurring: RecurringTransaction): Promise<RecurringTransaction> {
        const data = getUserDB(userId);
        data.recurring.push(recurring);
        saveUserDB(userId, data);
        return delay(recurring);
    },

    async updateRecurring(userId: string, recurring: RecurringTransaction): Promise<RecurringTransaction> {
        const data = getUserDB(userId);
        data.recurring = data.recurring.map(r => r.id === recurring.id ? recurring : r);
        saveUserDB(userId, data);
        return delay(recurring);
    },

    async deleteRecurring(userId: string, id: string): Promise<string> {
        const data = getUserDB(userId);
        data.recurring = data.recurring.filter(r => r.id !== id);
        saveUserDB(userId, data);
        return delay(id);
    }
};
