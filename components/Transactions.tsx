
import React, { useState, useMemo, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Upload, Download, TrendingUp, Sparkles, Search } from 'lucide-react';

import { useAppContext } from '../hooks/useAppContext';
import type { Transaction } from '../types';
import Modal from './common/Modal';
import Card from './common/Card';
import { CATEGORIES, AUTO_CATEGORY_RULES } from '../constants';

const TransactionForm: React.FC<{
    onClose: () => void;
    transaction?: Transaction | null;
    initialType?: 'income' | 'expense';
}> = ({ onClose, transaction, initialType = 'expense' }) => {
    const { dispatch } = useAppContext();
    const [autoCatTriggered, setAutoCatTriggered] = useState(false);
    
    // Determine default category based on type
    const defaultCategory = useMemo(() => {
        if (transaction) return transaction.category;
        return initialType === 'income' ? 'Salary' : CATEGORIES[0].name;
    }, [transaction, initialType]);

    const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
        date: transaction?.date || new Date().toISOString().split('T')[0],
        description: transaction?.description || '',
        amount: transaction?.amount || 0,
        type: transaction?.type || initialType,
        category: defaultCategory,
    });

    // Auto-Categorization Logic
    useEffect(() => {
        if (transaction) return; // Don't auto-cat on edit mode to allow manual corrections
        
        const descLower = formData.description.toLowerCase();
        for (const [keyword, category] of Object.entries(AUTO_CATEGORY_RULES)) {
            if (descLower.includes(keyword)) {
                // Only switch if the category matches the current type (income/expense) roughly
                // Or just switch and let user correct. Simple switch is better UX usually.
                setFormData(prev => {
                    if (prev.category !== category) {
                        setAutoCatTriggered(true);
                        setTimeout(() => setAutoCatTriggered(false), 2000);
                        return { ...prev, category };
                    }
                    return prev;
                });
                break;
            }
        }
    }, [formData.description, transaction]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (transaction) {
            dispatch({ type: 'EDIT_TRANSACTION', payload: { ...formData, id: transaction.id } });
        } else {
            dispatch({ type: 'ADD_TRANSACTION', payload: { ...formData, id: new Date().toISOString() } });
        }
        onClose();
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 relative">
            <AnimatePresence>
                {autoCatTriggered && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-0 right-0 -mt-8 bg-brand-accent/10 text-brand-accent text-xs px-2 py-1 rounded-full flex items-center gap-1"
                    >
                        <Sparkles size={12} />
                        Auto-categorized!
                    </motion.div>
                )}
            </AnimatePresence>
            <div>
                <label className="block text-sm font-medium text-brand-slate mb-1">Description</label>
                <input 
                    type="text" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                    placeholder="e.g., Netflix, Uber, Groceries..."
                    className="w-full bg-brand-light-navy border-brand-light-navy rounded-md p-2 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none" 
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-brand-slate mb-1">Amount</label>
                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="w-full bg-brand-light-navy border-brand-light-navy rounded-md p-2 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-slate mb-1">Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full bg-brand-light-navy border-brand-light-navy rounded-md p-2 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-brand-slate mb-1">Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-brand-light-navy border-brand-light-navy rounded-md p-2 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none">
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-slate mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-brand-light-navy border-brand-light-navy rounded-md p-2 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none">
                        {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-brand-accent text-brand-dark font-semibold py-2 px-4 rounded-md hover:bg-brand-accent-dark transition-colors duration-300">
                    {transaction ? 'Save Changes' : 'Add Transaction'}
                </button>
            </div>
        </form>
    );
};


const Transactions: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [initialFormType, setInitialFormType] = useState<'income' | 'expense'>('expense');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter transactions based on search query
    const filteredTransactions = useMemo(() => {
        return state.transactions.filter(t => 
            t.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [state.transactions, searchQuery]);

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Are you sure you want to delete this transaction?')) {
            dispatch({ type: 'DELETE_TRANSACTION', payload: id });
        }
    };
    
    const handleAddNew = () => {
        setEditingTransaction(null);
        setInitialFormType('expense');
        setIsModalOpen(true);
    };

    const handleAddIncome = () => {
        setEditingTransaction(null);
        setInitialFormType('income');
        setIsModalOpen(true);
    };

    const handleExport = () => {
        const headers = "id,date,description,amount,type,category\n";
        const csv = filteredTransactions.map(t => `${t.id},${t.date},"${t.description}",${t.amount},${t.type},${t.category}`).join("\n");
        const blob = new Blob([headers + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "transactions.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').slice(1);
            const importedTransactions: Transaction[] = rows.map(row => {
                const [id, date, description, amount, type, category] = row.split(',');
                if(!description) return null;
                return { id: id || new Date().toISOString(), date, description: description.replace(/"/g, ''), amount: parseFloat(amount), type: type as 'income' | 'expense', category };
            }).filter((t): t is Transaction => t !== null && !!t.date && !!t.description && !isNaN(t.amount));
            if (importedTransactions.length > 0) {
                 dispatch({ type: 'IMPORT_TRANSACTIONS', payload: importedTransactions });
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <h1 className="text-4xl font-bold text-brand-white">Transactions</h1>
                <div className="flex flex-wrap items-center gap-2">
                     <label htmlFor="import-csv" className="cursor-pointer bg-brand-light-navy text-brand-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2">
                        <Upload size={18} /> <span className="hidden sm:inline">Import</span>
                    </label>
                    <input id="import-csv" type="file" accept=".csv" className="hidden" onChange={handleImport} />

                    <button onClick={handleExport} className="bg-brand-light-navy text-brand-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2">
                        <Download size={18} /> <span className="hidden sm:inline">Export</span>
                    </button>

                    <div className="h-8 w-px bg-brand-light-navy mx-1 hidden sm:block"></div>

                    <button onClick={handleAddIncome} className="bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors duration-300 flex items-center gap-2">
                        <TrendingUp size={18} /> Add Income
                    </button>

                    <button onClick={handleAddNew} className="bg-brand-accent text-brand-dark font-semibold py-2 px-4 rounded-md hover:bg-brand-accent-dark transition-colors duration-300 flex items-center gap-2">
                        <Plus size={18} /> Add New
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-slate" size={20} />
                <input 
                    type="text" 
                    placeholder="Search transactions..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-brand-navy border border-brand-light-navy rounded-lg py-3 pl-10 pr-4 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none shadow-sm placeholder:text-brand-slate/50 transition-all"
                />
            </div>

            <Card className="overflow-x-auto">
                <table className="w-full min-w-max text-left">
                    <thead>
                        <tr className="border-b border-brand-light-navy">
                            <th className="p-4 text-brand-slate">Date</th>
                            <th className="p-4 text-brand-slate">Description</th>
                            <th className="p-4 text-brand-slate">Category</th>
                            <th className="p-4 text-brand-slate text-right">Amount</th>
                            <th className="p-4 text-brand-slate text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredTransactions.map((t, index) => {
                                const categoryInfo = CATEGORIES.find(c => c.name === t.category);
                                const Icon = categoryInfo ? categoryInfo.icon : CATEGORIES.find(c=>c.name==='Other')!.icon;
                                return (
                                <motion.tr
                                    key={t.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="border-b border-brand-light-navy/50 hover:bg-brand-light-navy/30"
                                >
                                    <td className="p-4">{t.date}</td>
                                    <td className="p-4 font-medium text-brand-white">{t.description}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Icon size={18} className="text-brand-slate"/>
                                            <span>{t.category}</span>
                                        </div>
                                    </td>
                                    <td className={`p-4 text-right font-semibold ${t.type === 'income' ? 'text-brand-accent' : 'text-red-400'}`}>
                                        {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => handleEdit(t)} className="text-brand-slate p-2 hover:text-brand-accent"><Edit size={18}/></button>
                                        <button onClick={() => handleDelete(t.id)} className="text-brand-slate p-2 hover:text-red-400"><Trash2 size={18}/></button>
                                    </td>
                                </motion.tr>
                            )})}
                        </AnimatePresence>
                    </tbody>
                </table>
                {filteredTransactions.length === 0 && (
                    <div className="p-8 text-center text-brand-slate">
                        {searchQuery ? 'No transactions match your search.' : 'No transactions found. Start adding some!'}
                    </div>
                )}
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTransaction ? 'Edit Transaction' : (initialFormType === 'income' ? 'Add Income' : 'Add Transaction')}>
                <TransactionForm 
                    onClose={() => setIsModalOpen(false)} 
                    transaction={editingTransaction} 
                    initialType={initialFormType}
                />
            </Modal>
        </div>
    );
};

export default Transactions;
