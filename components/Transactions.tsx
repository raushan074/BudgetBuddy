import React, { useState, useMemo, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Upload, Download } from 'lucide-react';

import { useAppContext } from '../hooks/useAppContext';
import type { Transaction } from '../types';
import Modal from './common/Modal';
import Card from './common/Card';
import { CATEGORIES } from '../constants';


const TransactionForm: React.FC<{
    onClose: () => void;
    transaction?: Transaction | null;
}> = ({ onClose, transaction }) => {
    const { dispatch } = useAppContext();
    const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
        date: transaction?.date || new Date().toISOString().split('T')[0],
        description: transaction?.description || '',
        amount: transaction?.amount || 0,
        type: transaction?.type || 'expense',
        category: transaction?.category || CATEGORIES[0].name,
    });

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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-brand-slate mb-1">Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} required className="w-full bg-brand-light-navy border-brand-light-navy rounded-md p-2 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none" />
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
        setIsModalOpen(true);
    };

    const handleExport = () => {
        const headers = "id,date,description,amount,type,category\n";
        const csv = state.transactions.map(t => `${t.id},${t.date},"${t.description}",${t.amount},${t.type},${t.category}`).join("\n");
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
                return { id: id || new Date().toISOString(), date, description: description.replace(/"/g, ''), amount: parseFloat(amount), type: type as 'income' | 'expense', category };
            }).filter(t => t.date && t.description && !isNaN(t.amount));
            if (importedTransactions.length > 0) {
                 dispatch({ type: 'IMPORT_TRANSACTIONS', payload: importedTransactions });
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-brand-white">Transactions</h1>
                <div className="flex items-center gap-2">
                     <label htmlFor="import-csv" className="cursor-pointer bg-brand-light-navy text-brand-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2">
                        <Upload size={18} /> Import
                    </label>
                    <input id="import-csv" type="file" accept=".csv" className="hidden" onChange={handleImport} />

                    <button onClick={handleExport} className="bg-brand-light-navy text-brand-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2">
                        <Download size={18} /> Export
                    </button>

                    <button onClick={handleAddNew} className="bg-brand-accent text-brand-dark font-semibold py-2 px-4 rounded-md hover:bg-brand-accent-dark transition-colors duration-300 flex items-center gap-2">
                        <Plus size={18} /> Add New
                    </button>
                </div>
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
                            {state.transactions.map((t, index) => {
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
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}>
                <TransactionForm onClose={() => setIsModalOpen(false)} transaction={editingTransaction} />
            </Modal>
        </div>
    );
};

export default Transactions;