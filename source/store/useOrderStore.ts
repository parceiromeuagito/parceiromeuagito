import { create } from 'zustand';
import { Order, OrderStatus, Message, Customer } from '../types';
import { getMockOrders } from '../data/mock';
import { useCatalogStore } from './useCatalogStore';
import { useCashRegisterStore } from './useCashRegisterStore';
import { useCustomerStore } from './useCustomerStore';
import { useBusinessStore } from './useBusinessStore';
import { faker } from '@faker-js/faker';
import { loadData, saveData } from '../lib/persistence';

interface OrderState {
    orders: Order[];
    addOrder: (order: Order) => void;
    updateOrderStatus: (id: string, status: OrderStatus) => void;
    addOrderMessage: (orderId: string, message: Message) => void;
    returnOrderItems: (orderId: string, itemsToReturn: { itemId: string, quantity: number }[]) => void;
}



export const useOrderStore = create<OrderState>((set) => ({
    orders: loadData<Order[]>('businessOrders', getMockOrders(['delivery'])),

    addOrder: (order) => {
        // 0. Verificar Caixa (Bloqueio de Segurança)
        const cashRegister = useCashRegisterStore.getState().cashRegister;
        if (!cashRegister.isOpen && (order.paymentMethod === 'cash' || order.paymentMethod === 'debit_card')) {
            throw new Error("Caixa fechado. Abra o caixa para registrar vendas em dinheiro ou débito.");
        }

        // 1. Verificar Estoque (Acesso direto ao store de catálogo)
        const catalog = useCatalogStore.getState().catalog;
        const insufficientStock = order.items.some(orderItem => {
            const catalogItem = catalog.find(c => c.id === orderItem.id);
            return catalogItem && catalogItem.stock !== undefined && catalogItem.stock < orderItem.quantity;
        });

        if (insufficientStock) {
            throw new Error("Estoque insuficiente para um ou mais itens.");
        }

        // 2. Deduzir Estoque
        order.items.forEach(orderItem => {
            useCatalogStore.getState().updateItemStock(orderItem.id, -orderItem.quantity);
        });

        // 3. Adicionar Pedido
        set((state) => {
            const orderWithHistory = {
                ...order,
                statusHistory: order.statusHistory || [{
                    status: order.status,
                    timestamp: new Date(),
                    user: useBusinessStore.getState().user?.name || 'Sistema'
                }]
            };
            const newOrders = [orderWithHistory, ...state.orders];
            saveData('businessOrders', newOrders);
            return { orders: newOrders };
        });

        // 4. Registrar no Caixa (Se necessário)
        const currentUser = useBusinessStore.getState().user?.name || 'Sistema';

        // Como já validamos acima, aqui só registramos se estiver tudo ok
        if (cashRegister.isOpen && (order.paymentMethod === 'cash' || order.paymentMethod === 'debit_card')) {
            useCashRegisterStore.getState().registerSale(order.total, `Venda Pedido #${order.id}`, currentUser);
        }

        // 5. Atualizar CRM (Cliente)
        const customers = useCustomerStore.getState().customers;
        const existingCustomer = customers.find(c => c.name === order.customerName);

        if (existingCustomer) {
            useCustomerStore.getState().updateCustomer(existingCustomer.id, {
                totalOrders: existingCustomer.totalOrders + 1,
                totalSpent: existingCustomer.totalSpent + order.total,
                lastOrderDate: new Date()
            });
        } else {
            const newCustomer: Customer = {
                id: faker.string.uuid(),
                name: order.customerName,
                phone: order.customerContact,
                avatar: order.customerAvatar,
                totalOrders: 1,
                totalSpent: order.total,
                lastOrderDate: new Date(),
                status: 'active'
            };
            useCustomerStore.getState().addCustomer(newCustomer);
        }

        // 6. Play Notification Sound
        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(e => console.log('Audio play failed', e));
        } catch (e) {
            console.error('Error playing notification sound', e);
        }
    },

    updateOrderStatus: (id, status) => set((state) => {
        const order = state.orders.find(o => o.id === id);

        // Restore stock if cancelling/rejecting an active order
        if (order && (status === 'cancelled' || status === 'rejected') && order.status !== 'cancelled' && order.status !== 'rejected') {
            order.items.forEach(item => {
                useCatalogStore.getState().updateItemStock(item.id, item.quantity);
            });
        }

        const newOrders = state.orders.map(o => {
            if (o.id === id) {
                return {
                    ...o,
                    status,
                    statusHistory: [
                        ...(o.statusHistory || []),
                        {
                            status,
                            timestamp: new Date(),
                            user: useBusinessStore.getState().user?.name || 'Sistema'
                        }
                    ]
                };
            }
            return o;
        });
        saveData('businessOrders', newOrders);
        return { orders: newOrders };
    }),

    addOrderMessage: (orderId: string, message: Message) => set((state) => {
        const newOrders = state.orders.map(o =>
            o.id === orderId
                ? { ...o, chatHistory: [...o.chatHistory, message] }
                : o
        );
        saveData('businessOrders', newOrders);
        return { orders: newOrders };
    }),

    returnOrderItems: (orderId, itemsToReturn) => set((state) => {
        const order = state.orders.find(o => o.id === orderId);
        if (!order) throw new Error("Pedido não encontrado.");

        // 1. Validar devolução
        let refundTotal = 0;
        itemsToReturn.forEach(returnItem => {
            const originalItem = order.items.find(i => i.id === returnItem.itemId);
            if (!originalItem) throw new Error(`Item ${returnItem.itemId} não encontrado no pedido.`);
            if (returnItem.quantity > originalItem.quantity) throw new Error(`Quantidade a devolver maior que a comprada para o item ${originalItem.name}.`);
            refundTotal += originalItem.price * returnItem.quantity;
        });

        // 2. Atualizar Estoque (Devolver itens)
        itemsToReturn.forEach(returnItem => {
            useCatalogStore.getState().updateItemStock(returnItem.itemId, returnItem.quantity);
        });

        // 3. Registrar Reembolso no Caixa (se foi pago em dinheiro/débito e caixa estiver aberto)
        const cashRegister = useCashRegisterStore.getState().cashRegister;
        const currentUser = useBusinessStore.getState().user?.name || 'Sistema';

        if (cashRegister.isOpen && (order.paymentMethod === 'cash' || order.paymentMethod === 'debit_card')) {
            // Verifica se tem saldo suficiente para reembolso em dinheiro
            if (order.paymentMethod === 'cash' && cashRegister.currentBalance < refundTotal) {
                throw new Error("Saldo em caixa insuficiente para realizar o reembolso em dinheiro.");
            }
            useCashRegisterStore.getState().addCashTransaction('bleed', refundTotal, `Reembolso Pedido #${order.id}`, currentUser);
        }

        // 4. Atualizar Status do Pedido
        // Verifica se devolveu tudo
        const totalItemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);
        const totalReturnedCount = itemsToReturn.reduce((acc, item) => acc + item.quantity, 0);

        const newStatus: OrderStatus = totalReturnedCount >= totalItemsCount ? 'returned' : 'partially_returned';

        const newOrders = state.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        saveData('businessOrders', newOrders);
        return { orders: newOrders };
    })
}));
