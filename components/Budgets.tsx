import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, TrendingUp } from 'lucide-react';

import { useAppContext } from '../hooks/useAppContext';
import { CATEGORIES } from '../constants';
import Card from './common/Card';
import type { Budget } from '../types';
import Modal from './common/Modal';

const BudgetForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { state, dispatch } = useAppContext();
    const [category, setCategory] = useState(CATEGORIES[0].name);
    const [limit, setLimit] = useState(0);

    const availableCategories = useMemo(() => {
        const budgetedCategories = new Set(state.budgets.map(b => b.category));
        return CATEGORIES.filter(c => !budgetedCategories.has(c.name) && c.name !== 'Salary' && c.name !== 'Other');
    }, [state.budgets]);
    
    useState(() => {
        if(availableCategories.length > 0) {
            setCategory(availableCategories[0].name);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (limit > 0) {
            dispatch({ type: 'SET_BUDGET', payload: { category, limit } });
            onClose();
        }
    };

    if (availableCategories.length === 0) {
        return <p className="text-brand-slate">All available categories have budgets set.</p>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-brand-slate mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-brand-light-navy border-brand-light-navy rounded-md p-2 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none">
                    {availableCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-brand-slate mb-1">Monthly Limit</label>
                <input type="number" value={limit} onChange={(e) => setLimit(parseFloat(e.target.value))} required className="w-full bg-brand-light-navy border-brand-light-navy rounded-md p-2 text-brand-white focus:ring-2 focus:ring-brand-accent focus:outline-none" />
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-brand-accent text-brand-dark font-semibold py-2 px-4 rounded-md hover:bg-brand-accent-dark transition-colors duration-300">Set Budget</button>
            </div>
        </form>
    );
};


const BudgetCard: React.FC<{ budget: Budget }> = ({ budget }) => {
    const { state, dispatch } = useAppContext();
    const { category, limit } = budget;
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const { spent, averageDailySpending, projectedSpend } = useMemo(() => {
        const relevantTransactions = state.transactions
            .filter(t => t.type === 'expense' && t.category === category);
        
        const totalSpent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);

        const today = new Date();
        const daysInMonthSoFar = today.getDate();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

        const avgDaily = daysInMonthSoFar > 0 ? totalSpent / daysInMonthSoFar : 0;
        const projSpend = avgDaily * daysInMonth;
        
        return {
            spent: totalSpent,
            averageDailySpending: avgDaily,
            projectedSpend: projSpend
        };

    }, [state.transactions, category]);
    
    const percentage = (spent / limit) * 100;
    const remaining = limit - spent;
    const progressBarColor = percentage > 100 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-brand-accent';

    const handleDelete = () => {
        if(window.confirm(`Are you sure you want to remove the budget for ${category}?`)) {
            dispatch({ type: 'DELETE_BUDGET', payload: category });
        }
    };

    const categoryInfo = CATEGORIES.find(c => c.name === category);
    const Icon = categoryInfo ? categoryInfo.icon : CATEGORIES.find(c=>c.name==='Other')!.icon;

    return (
        <Card className="flex flex-col">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <Icon size={24} className="text-brand-accent" />
                    <h3 className="text-xl font-semibold text-brand-white">{category}</h3>
                </div>
                <button onClick={handleDelete} className="text-brand-slate hover:text-red-400 transition-colors">
                    <Trash2 size={18} />
                </button>
            </div>

            <div 
                className="my-4 relative"
                onMouseEnter={() => setIsTooltipVisible(true)}
                onMouseLeave={() => setIsTooltipVisible(false)}
            >
                 <AnimatePresence>
                    {isTooltipVisible && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-xs p-3 bg-brand-light-navy rounded-lg shadow-xl z-10 text-sm"
                        >
                            <div className="font-bold text-brand-white">
                                {remaining >= 0 ? `₹${remaining.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining` : `₹${Math.abs(remaining).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} over budget`}
                            </div>
                            <div className="text-brand-slate mt-1">
                                Avg. Daily Spend: ₹{averageDailySpending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                             <div className="text-brand-slate mt-1 flex items-center gap-1.5">
                                <TrendingUp size={14} className="text-brand-accent" />
                                <span>Projected Spend: ₹{projectedSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-brand-light-navy"></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-between text-sm text-brand-slate mb-1">
                    <span>Spent: ₹{spent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span>Limit: ₹{limit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="w-full bg-brand-light-navy rounded-full h-2.5 cursor-pointer">
                    <motion.div
                        className={`h-2.5 rounded-full ${progressBarColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.2 }}
                    />
                </div>
            </div>
            <p className={`text-sm mt-auto ${remaining < 0 ? 'text-red-400' : 'text-brand-slate'}`}>
                {remaining >= 0 ? `₹${remaining.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining` : `₹${Math.abs(remaining).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} over budget`}
            </p>
        </Card>
    );
};

const Budgets: React.FC = () => {
    const { state } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-brand-white">Budgets</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-accent text-brand-dark font-semibold py-2 px-4 rounded-md hover:bg-brand-accent-dark transition-colors duration-300 flex items-center gap-2">
                    <Plus size={18} /> Add Budget
                </button>
            </div>

            {state.budgets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {state.budgets.map((budget) => (
                        <BudgetCard key={budget.category} budget={budget} />
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                     <h2 className="text-xl font-semibold text-brand-white">No budgets set yet.</h2>
                     <p className="text-brand-slate mt-2">Click "Add Budget" to start tracking your spending goals.</p>
                </Card>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set New Budget">
                <BudgetForm onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Budgets;