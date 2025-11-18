
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CalendarClock, Edit, Trash2, Bell, CheckCircle, AlertCircle } from 'lucide-react';

import { useAppContext } from '../hooks/useAppContext';
import type { RecurringTransaction } from '../types';
import Modal from './common/Modal';
import Card from './common/Card';
import { CATEGORIES } from '../constants';

const RecurringForm: React.FC<{
    onClose: () => void;
    recurring?: RecurringTransaction | null;
}> = ({ onClose, recurring }) => {
    const { dispatch } = useAppContext();
    const [formData, setFormData] = useState<Omit<RecurringTransaction, 'id'>>({
        description: recurring?.description || '',
        amount: recurring?.amount || 0,
        type: recurring?.type || 'expense',
        category: recurring?.category || CATEGORIES[0].name,
        frequency: recurring?.frequency || 'monthly',
        nextDueDate: recurring?.nextDueDate || new Date().toISOString().split('T')[0],
        active: recurring?.active ?? true
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'amount' ? parseFloat(value) : (name === 'active' ? (e.target as HTMLInputElement).checked : value) 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (recurring) {
            dispatch({ type: 'EDIT_RECURRING', payload: { ...formData, id: recurring.id } });
        } else {
            dispatch({ type: 'ADD_RECURRING', payload: { ...formData, id: `rec_${Date.now()}` } });
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-brand-slate mb-1">Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} required className="w-full bg-brand-light-navy border-brand-light-navy rounded-md p-2 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none" placeholder="e.g. Rent, Netflix" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-brand-slate mb-1">Amount</label>
                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="w-full bg-brand-light-navy border-brand-light-navy rounded-md p-2 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-slate mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-brand-light-navy border-brand-light-navy rounded-md p-2 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none">
                        {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-brand-slate mb-1">Frequency</label>
                    <select name="frequency" value={formData.frequency} onChange={handleChange} className="w-full bg-brand-light-navy border-brand-light-navy rounded-md p-2 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none">
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-slate mb-1">Next Due Date</label>
                    <input type="date" name="nextDueDate" value={formData.nextDueDate} onChange={handleChange} required className="w-full bg-brand-light-navy border-brand-light-navy rounded-md p-2 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none" />
                </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="active" name="active" checked={formData.active} onChange={(e) => setFormData(prev => ({...prev, active: e.target.checked}))} className="w-4 h-4 accent-brand-accent"/>
                <label htmlFor="active" className="text-sm text-brand-slate">Active Notification</label>
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-brand-accent text-brand-dark font-semibold py-2 px-4 rounded-md hover:bg-brand-accent-dark transition-colors duration-300">
                    {recurring ? 'Update Reminder' : 'Set Reminder'}
                </button>
            </div>
        </form>
    );
};

const Recurring: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);

    const handleEdit = (item: RecurringTransaction) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Delete this recurring payment?")) {
            dispatch({ type: 'DELETE_RECURRING', payload: id });
        }
    };

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    // Calculate days remaining helper
    const getDaysRemaining = (dateStr: string) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const due = new Date(dateStr);
        due.setHours(0,0,0,0);
        const diffTime = due.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-brand-white">Recurring & Reminders</h1>
                    <p className="text-brand-slate mt-1">Manage subscriptions, rent, and bill reminders.</p>
                </div>
                <button onClick={handleAdd} className="bg-brand-accent text-brand-dark font-semibold py-2 px-4 rounded-md hover:bg-brand-accent-dark transition-colors duration-300 flex items-center gap-2">
                    <Plus size={18} /> Add Reminder
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                    {state.recurring.map((item) => {
                        const daysLeft = getDaysRemaining(item.nextDueDate);
                        const isUrgent = daysLeft <= 3 && daysLeft >= 0;
                        
                        return (
                            <Card key={item.id} className="relative overflow-hidden group">
                                {isUrgent && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold flex items-center gap-1 z-10">
                                        <AlertCircle size={12} /> Due Soon
                                    </div>
                                )}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${item.active ? 'bg-brand-light-navy' : 'bg-brand-dark opacity-50'}`}>
                                            <CalendarClock className={item.active ? 'text-brand-accent' : 'text-brand-slate'} size={24} />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-semibold ${item.active ? 'text-brand-white' : 'text-brand-slate line-through'}`}>{item.description}</h3>
                                            <p className="text-brand-slate text-sm">{item.category} • {item.frequency}</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className={`text-xl font-bold ${item.type === 'income' ? 'text-brand-accent' : 'text-brand-white'}`}>
                                                    ₹{item.amount.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`text-sm font-medium px-2 py-1 rounded-md ${daysLeft < 0 ? 'bg-red-500/20 text-red-400' : daysLeft <= 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-brand-light-navy text-brand-slate'}`}>
                                            {daysLeft < 0 ? `Overdue by ${Math.abs(daysLeft)} days` : daysLeft === 0 ? 'Due Today' : `Due in ${daysLeft} days`}
                                        </div>
                                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(item)} className="p-2 text-brand-slate hover:text-brand-white hover:bg-brand-light-navy rounded-full"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-brand-slate hover:text-red-400 hover:bg-brand-light-navy rounded-full"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-brand-light-navy flex justify-between items-center">
                                    <span className="text-xs text-brand-slate">Next Due: {item.nextDueDate}</span>
                                    {item.active ? 
                                        <span className="text-xs text-brand-accent flex items-center gap-1"><Bell size={12} /> Reminders On</span> : 
                                        <span className="text-xs text-brand-slate">Reminders Off</span>
                                    }
                                </div>
                            </Card>
                        );
                    })}
                </AnimatePresence>
            </div>
             {state.recurring.length === 0 && (
                <Card className="text-center py-12">
                     <h2 className="text-xl font-semibold text-brand-white">No recurring payments set.</h2>
                     <p className="text-brand-slate mt-2">Add your rent, subscriptions, or salary to get bill reminders.</p>
                </Card>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Recurring Payment' : 'Add Recurring Payment'}>
                <RecurringForm onClose={() => setIsModalOpen(false)} recurring={editingItem} />
            </Modal>
        </div>
    );
};

export default Recurring;
