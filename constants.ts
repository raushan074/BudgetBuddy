
import { ShoppingCart, Home, Car, Utensils, Shirt, Film, Heart, GraduationCap, Gift, DollarSign } from 'lucide-react';
import type { Category } from './types';

export const CATEGORIES: Category[] = [
    { name: 'Groceries', icon: ShoppingCart },
    { name: 'Housing', icon: Home },
    { name: 'Transportation', icon: Car },
    { name: 'Food', icon: Utensils },
    { name: 'Apparel', icon: Shirt },
    { name: 'Entertainment', icon: Film },
    { name: 'Health', icon: Heart },
    { name: 'Education', icon: GraduationCap },
    { name: 'Gifts', icon: Gift },
    { name: 'Salary', icon: DollarSign },
    { name: 'Other', icon: DollarSign },
];
