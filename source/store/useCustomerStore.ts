import { create } from 'zustand';
import { Customer } from '../types';
import { loadData, saveData } from '../lib/persistence';

interface CustomerState {
    customers: Customer[];
    addCustomer: (customer: Customer) => void;
    updateCustomer: (id: string, updates: Partial<Customer>) => void;
}



export const useCustomerStore = create<CustomerState>((set) => ({
    customers: loadData<Customer[]>('businessCustomers', []),

    addCustomer: (customer) => set((state) => {
        const newCustomers = [customer, ...state.customers];
        saveData('businessCustomers', newCustomers);
        return { customers: newCustomers };
    }),

    updateCustomer: (id, updates) => set((state) => {
        const newCustomers = state.customers.map(c => c.id === id ? { ...c, ...updates } : c);
        saveData('businessCustomers', newCustomers);
        return { customers: newCustomers };
    })
}));
