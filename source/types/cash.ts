// Tipos para gestão de caixa
export interface CashRegisterState {
    isOpen: boolean;
    openedAt?: Date;
    closedAt?: Date;
    startAmount: number;
    currentBalance: number;
    transactions: CashTransaction[];
}

export interface CashTransaction {
    id: string;
    type: 'opening' | 'closing' | 'sale' | 'supply' | 'bleed';
    amount: number;
    description: string;
    timestamp: Date;
    user: string;
}
