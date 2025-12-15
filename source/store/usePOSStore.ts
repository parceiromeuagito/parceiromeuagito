import { create } from 'zustand';
import { CatalogItem, Customer, OrderItem } from '../types';

interface CartItem extends OrderItem {
    product: CatalogItem;
}

interface PaymentDetails {
    method: 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'online' | 'split';
    amount: number;
    receivedAmount?: number; // Para dinheiro
    change?: number; // Troco
    installments?: number; // Para crédito
    payments?: Array<{
        method: 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'online';
        amount: number;
        installments?: number;
    }>;
}

interface POSState {
    cart: CartItem[];
    selectedCustomer: Customer | null;
    discount: number;
    paymentDetails: PaymentDetails | null; // Substitui paymentMethod simples

    // Actions
    addToCart: (product: CatalogItem) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    setCustomer: (customer: Customer | null) => void;
    setDiscount: (value: number) => void;
    setPaymentDetails: (details: PaymentDetails | null) => void;
    clearSale: () => void;

    // Getters
    getSubtotal: () => number;
    getTotal: () => number;
}

export const usePOSStore = create<POSState>((set, get) => ({
    cart: [],
    selectedCustomer: null,
    discount: 0,
    paymentDetails: null,

    addToCart: (product) => {
        const { cart } = get();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            set({
                cart: cart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            });
        } else {
            set({
                cart: [...cart, {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    product: product
                }]
            });
        }
    },

    removeFromCart: (productId) => {
        set({ cart: get().cart.filter(item => item.id !== productId) });
    },

    updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
            get().removeFromCart(productId);
            return;
        }
        set({
            cart: get().cart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        });
    },

    setCustomer: (customer) => set({ selectedCustomer: customer }),
    setDiscount: (value) => {
        const subtotal = get().getSubtotal();
        if (value < 0) {
            set({ discount: 0 });
        } else if (value > subtotal) {
            set({ discount: subtotal });
        } else {
            set({ discount: value });
        }
    },
    setPaymentDetails: (details) => set({ paymentDetails: details }),

    clearSale: () => set({
        cart: [],
        selectedCustomer: null,
        discount: 0,
        paymentDetails: null
    }),

    getSubtotal: () => {
        return get().cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    },

    getTotal: () => {
        const subtotal = get().getSubtotal();
        return Math.max(0, subtotal - get().discount);
    }
}));
