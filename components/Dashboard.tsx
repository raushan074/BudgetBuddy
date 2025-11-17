import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAppContext } from '../hooks/useAppContext';
import Card from './common/Card';
import { CATEGORIES } from '../constants';

const Dashboard: React.FC = () => {
  const { state } = useAppContext();
  const { transactions } = state;

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expenses += t.amount;
      }
    });
    return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!categoryMap[t.category]) {
          categoryMap[t.category] = 0;
        }
        categoryMap[t.category] += t.amount;
      });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [transactions]);
  
  const incomeVsExpenseData = [
      { name: 'Income', value: totalIncome },
      { name: 'Expenses', value: totalExpenses },
  ];

  const PIE_COLORS = ['#64ffda', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

  const SummaryCard = ({ icon, title, amount, color, delay }: { icon: React.ReactNode, title: string, amount: number, color: string, delay: number }) => (
    <Card className="flex-1 min-w-[200px]" delay={delay}>
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-brand-slate text-sm">{title}</p>
          <p className="text-2xl font-bold text-brand-white">
            ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-brand-white">Dashboard</motion.h1>

      <div className="flex flex-wrap gap-6">
        <SummaryCard icon={<ArrowUpCircle size={24} className="text-brand-dark"/>} title="Total Income" amount={totalIncome} color="bg-brand-accent" delay={0.1} />
        <SummaryCard icon={<ArrowDownCircle size={24} className="text-brand-dark"/>} title="Total Expenses" amount={totalExpenses} color="bg-red-400" delay={0.2} />
        <SummaryCard icon={<Scale size={24} className="text-brand-dark"/>} title="Balance" amount={balance} color="bg-blue-400" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3" delay={0.4}>
          <h2 className="text-xl font-semibold text-brand-white mb-4">Income vs. Expenses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeVsExpenseData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                cursor={{fill: 'rgba(100, 255, 218, 0.1)'}} 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#e2e8f0' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="value" >
                {incomeVsExpenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#64ffda' : '#f87171'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="lg:col-span-2" delay={0.5}>
          <h2 className="text-xl font-semibold text-brand-white mb-4">Expense Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {expenseByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;