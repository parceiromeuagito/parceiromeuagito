import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useToast } from './ToastContext';

// --- TIPOS ---

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
export type ServiceType = 'delivery' | 'pickup' | 'table' | 'booking' | 'event' | 'stay';

export interface OrderMessage {
    id: string;
    orderId: string;
    senderId: string;
    senderType: 'establishment' | 'customer' | 'system';
    message: string;
    timestamp: string;
}

export interface Order {
    id: string;
    customer: string;
    items: { name: string; qtd: number; obs?: string; price?: number }[];
    total: number;
    status: OrderStatus;
    time: string; // Hora formatada
    createdAt: string; // ISO Date
    address: string;
    paymentMethod: string;
    type: ServiceType;
    scheduledFor?: string;
    details?: Record<string, unknown>;
    messages: OrderMessage[];
}

export interface ServiceConfig {
    id: ServiceType;
    name: string;
    enabled: boolean;
    autoAccept: boolean;
}

interface OrderContextType {
    orders: Order[];
    services: ServiceConfig[];
    selectedService: ServiceType | 'all';
    setSelectedService: (service: ServiceType | 'all') => void;

    // Ações de Pedidos
    addOrder: (order: Omit<Order, 'id' | 'time' | 'createdAt' | 'messages'>) => void;
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    sendMessage: (orderId: string, message: string) => void;

    // Ações de Serviços
    toggleService: (serviceId: ServiceType) => void;
    toggleAutoAccept: (serviceId: ServiceType) => void;

    // Getters
    getOrdersByStatus: (status: OrderStatus) => Order[];
    getOrdersByService: (service: ServiceType) => Order[];
    getPendingCount: () => number;
}

// --- ESTADO INICIAL ---

const defaultServices: ServiceConfig[] = [
    { id: 'delivery', name: 'Delivery', enabled: true, autoAccept: false },
    { id: 'pickup', name: 'Retirada', enabled: true, autoAccept: false },
    { id: 'table', name: 'Mesa', enabled: false, autoAccept: false },
    { id: 'booking', name: 'Reserva', enabled: false, autoAccept: false },
    { id: 'event', name: 'Evento', enabled: false, autoAccept: false },
    { id: 'stay', name: 'Hospedagem', enabled: false, autoAccept: false },
];

// --- CONTEXTO ---

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const { addToast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [services, setServices] = useState<ServiceConfig[]>(defaultServices);
    const [selectedService, setSelectedService] = useState<ServiceType | 'all'>('all');

    // Auto-Aceite (T24.2)
    React.useEffect(() => {
        orders.forEach(order => {
            if (order.status === 'pending') {
                const service = services.find(s => s.id === order.type);
                if (service?.autoAccept) {
                    updateOrderStatus(order.id, 'preparing');
                }
            }
        });
    }, [orders, services]);

    // Polling de Atualização (T26)
    React.useEffect(() => {
        const interval = setInterval(() => {
            console.log('🔄 Polling: Buscando novos pedidos...');
            // Aqui entraria a chamada para a API:
            // fetchOrders().then(newOrders => mergeOrders(newOrders));
        }, 10000); // 10 segundos

        return () => clearInterval(interval);
    }, []);

    // --- AÇÕES ---

    const addOrder = useCallback((newOrderData: Omit<Order, 'id' | 'time' | 'createdAt' | 'messages'>) => {
        const newOrder: Order = {
            id: Date.now().toString(),
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            createdAt: new Date().toISOString(),
            messages: [],
            ...newOrderData
        };

        setOrders(prev => [newOrder, ...prev]);

        // Simular notificação sonora aqui se necessário
        addToast(`Novo pedido recebido! #${newOrder.id.slice(-4)}`, 'info');
    }, [addToast]);

    const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                // Lógica de auto-mensagens de sistema
                let systemMsg = '';
                if (status === 'preparing') systemMsg = 'Pedido aceito e em preparo.';
                if (status === 'ready') systemMsg = 'Pedido pronto!';
                if (status === 'delivering') systemMsg = 'Pedido saiu para entrega.';
                if (status === 'completed') systemMsg = 'Pedido entregue.';
                if (status === 'cancelled') systemMsg = 'Pedido cancelado.';

                const updatedOrder = { ...o, status };

                if (systemMsg) {
                    updatedOrder.messages = [
                        ...o.messages,
                        {
                            id: Date.now().toString(),
                            orderId,
                            senderId: 'system',
                            senderType: 'system',
                            message: systemMsg,
                            timestamp: new Date().toISOString()
                        }
                    ];
                }

                return updatedOrder;
            }
            return o;
        }));

        addToast(`Status do pedido atualizado para ${status}`, 'success');
    }, [addToast]);

    const sendMessage = useCallback((orderId: string, message: string) => {
        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                return {
                    ...o,
                    messages: [
                        ...o.messages,
                        {
                            id: Date.now().toString(),
                            orderId,
                            senderId: 'partner', // Assumindo que quem manda é o parceiro logado
                            senderType: 'establishment',
                            message,
                            timestamp: new Date().toISOString()
                        }
                    ]
                };
            }
            return o;
        }));
    }, []);

    const toggleService = useCallback((serviceId: ServiceType) => {
        setServices(prev => prev.map(s =>
            s.id === serviceId ? { ...s, enabled: !s.enabled } : s
        ));
    }, []);

    const toggleAutoAccept = useCallback((serviceId: ServiceType) => {
        setServices(prev => prev.map(s =>
            s.id === serviceId ? { ...s, autoAccept: !s.autoAccept } : s
        ));
    }, []);

    // --- GETTERS ---

    const getOrdersByStatus = useCallback((status: OrderStatus) => {
        return orders.filter(o => o.status === status);
    }, [orders]);

    const getOrdersByService = useCallback((service: ServiceType) => {
        return orders.filter(o => o.type === service);
    }, [orders]);

    const getPendingCount = useCallback(() => {
        return orders.filter(o => o.status === 'pending').length;
    }, [orders]);

    return (
        <OrderContext.Provider value={{
            orders,
            services,
            selectedService,
            setSelectedService,
            addOrder,
            updateOrderStatus,
            sendMessage,
            toggleService,
            toggleAutoAccept,
            getOrdersByStatus,
            getOrdersByService,
            getPendingCount
        }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrder() {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
}
