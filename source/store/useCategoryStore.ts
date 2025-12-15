import { create } from 'zustand';
import { Category } from '../types/category';
import { loadData, saveData } from '../lib/persistence';

interface CategoryState {
    categories: Category[];
    addCategory: (category: Category) => void;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    deleteCategory: (id: string) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
    categories: loadData<Category[]>('businessCategories', []),

    addCategory: (category) => set((state) => {
        const newCategories = [...state.categories, category];
        saveData('businessCategories', newCategories);
        return { categories: newCategories };
    }),

    updateCategory: (id, updates) => set((state) => {
        const newCategories = state.categories.map(c => c.id === id ? { ...c, ...updates } : c);
        saveData('businessCategories', newCategories);
        return { categories: newCategories };
    }),

    deleteCategory: (id) => set((state) => {
        const newCategories = state.categories.filter(c => c.id !== id);
        saveData('businessCategories', newCategories);
        return { categories: newCategories };
    })
}));
