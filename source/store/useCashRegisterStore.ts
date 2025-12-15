import { create } from 'zustand';
import { CashRegisterState } from '../types';
import { loadData, saveData } from '../lib/persistence';

interface CashRegisterStore {
    cashRegister: CashRegisterState;
    openRegister: (startAmount: number, user: string) => void;
    closeRegister: (user: string) => void;
    addCashTransaction: (type: 'supply' | 'bleed', amount: number, description: string, user: string) => void;
    registerSale: (amount: number, description: string, user: string) => void;
}

const DEFAULT_CASH_REGISTER: CashRegisterState = {
    isOpen: false,
    startAmount: 0,
    currentBalance: 0,
    transactions: []
};



export const useCashRegisterStore = create<CashRegisterStore>((set) => ({
    cashRegister: loadData<CashRegisterState>('businessCashRegister', DEFAULT_CASH_REGISTER),

    openRegister: (startAmount, user) => set(() => {
        const newState = {
            isOpen: true,
            openedAt: new Date(),
            startAmount,
            currentBalance: startAmount,
            transactions: [{
                id: Date.now().toString(),
                type: 'opening' as const,
                amount: startAmount,
                description: 'Abertura de Caixa',
                timestamp: new Date(),
                user
            }]
        };
        saveData('businessCashRegister', newState);
        return { cashRegister: newState };
    }),

    closeRegister: (user) => set((state) => {
        const newState = {
            ...state.cashRegister,
            isOpen: false,
            closedAt: new Date(),
            transactions: [{
                id: Date.now().toString(),
                type: 'closing' as const,
                amount: state.cashRegister.currentBalance,
                description: 'Fechamento de Caixa',
                timestamp: new Date(),
                user
            }, ...state.cashRegister.transactions]
        };
        saveData('businessCashRegister', newState);
        return { cashRegister: newState };
    }),

    addCashTransaction: (type, amount, description, user) => set((state) => {
        const newBalance = type === 'supply'
            ? state.cashRegister.currentBalance + amount
            : state.cashRegister.currentBalance - amount;

        const newState = {
            ...state.cashRegister,
            currentBalance: newBalance,
            transactions: [{
                id: Date.now().toString(),
                type,
                amount,
                description,
                timestamp: new Date(),
                user
            }, ...state.cashRegister.transactions]
        };
        saveData('businessCashRegister', newState);
        return { cashRegister: newState };
    }),

    registerSale: (amount, description, user) => set((state) => {
        const newState = {
            ...state.cashRegister,
            currentBalance: state.cashRegister.currentBalance + amount,
            transactions: [{
                id: Date.now().toString(),
                type: 'sale' as const,
                amount,
                description,
                timestamp: new Date(),
                user
            }, ...state.cashRegister.transactions]
        };
        saveData('businessCashRegister', newState);
        return { cashRegister: newState };
    })
}));
