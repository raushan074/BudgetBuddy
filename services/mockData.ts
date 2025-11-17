
import type { Transaction, Budget } from '../types';

export const mockTransactions: Transaction[] = [
  { id: '1', date: '2023-11-01', description: 'Monthly Salary', amount: 5000, type: 'income', category: 'Salary' },
  { id: '2', date: '2023-11-01', description: 'Rent Payment', amount: 1500, type: 'expense', category: 'Housing' },
  { id: '3', date: '2023-11-02', description: 'Grocery Shopping', amount: 250.75, type: 'expense', category: 'Groceries' },
  { id: '4', date: '2023-11-05', description: 'Gasoline', amount: 60, type: 'expense', category: 'Transportation' },
  { id: '5', date: '2023-11-08', description: 'Dinner with friends', amount: 120.50, type: 'expense', category: 'Food' },
  { id: '6', date: '2023-11-10', description: 'Movie Tickets', amount: 35, type: 'expense', category: 'Entertainment' },
  { id: '7', date: '2023-11-12', description: 'New Jacket', amount: 150, type: 'expense', category: 'Apparel' },
  { id: '8', date: '2023-11-15', description: 'Pharmacy', amount: 45.20, type: 'expense', category: 'Health' },
  { id: '9', date: '2023-11-16', description: 'Freelance Project', amount: 750, type: 'income', category: 'Other' },
  { id: '10', date: '2023-11-18', description: 'Weekly Groceries', amount: 180.40, type: 'expense', category: 'Groceries' },
  { id: '11', date: '2023-11-20', description: 'Public Transport Pass', amount: 80, type: 'expense', category: 'Transportation' },
  { id: '12', date: '2023-11-22', description: 'Online Course', amount: 200, type: 'expense', category: 'Education' },
  { id: '13', date: '2023-11-25', description: 'Birthday Gift for Mom', amount: 75, type: 'expense', category: 'Gifts' },
];

export const mockBudgets: Budget[] = [
  { category: 'Groceries', limit: 600 },
  { category: 'Housing', limit: 1500 },
  { category: 'Transportation', limit: 200 },
  { category: 'Food', limit: 300 },
  { category: 'Entertainment', limit: 150 },
  { category: 'Apparel', limit: 200 },
];
