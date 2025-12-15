import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============= MOCK API FUNCTIONS =============
// Em produção, estas funções chamariam um backend real

const mockOrders = [
  {
    id: '1',
    customerName: 'João Silva',
    total: 150.50,
    status: 'pending',
    items: ['Pizza Margherita', 'Refrigerante'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    customerName: 'Maria Santos',
    total: 89.90,
    status: 'preparing',
    items: ['Burger Deluxe'],
    createdAt: new Date().toISOString(),
  },
];

// ============= HOOKS CUSTOMIZADOS =============

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      // Simular latência de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockOrders;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockOrders.find(o => o.id === orderId) || null;
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { orderId: string; status: string }) => {
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, ...data };
    },
    onSuccess: () => {
      // Invalidar cache de pedidos para refetch automático
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  interface OrderInput {
    customerName: string;
    items: string[];
    total: number;
    status?: string;
  }

  return useMutation({
    mutationFn: async (orderData: OrderInput) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: Math.random().toString(), createdAt: new Date().toISOString(), ...orderData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// ============= HOOKS PARA DASHBOARD =============

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        totalRevenue: 12500.50,
        totalOrders: 156,
        activeOrders: 8,
        completedOrders: 148,
        revenueData: [1200, 1900, 1400, 2210, 2290, 2000, 2181],
      };
    },
  });
}

// ============= HOOKS PARA MENU =============

export function useMenuItems() {
  return useQuery({
    queryKey: ['menu', 'items'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        { id: '1', name: 'Pizza Margherita', category: 'pizzas', price: 45.90 },
        { id: '2', name: 'Burger Deluxe', category: 'burgers', price: 35.90 },
        { id: '3', name: 'Coca-Cola', category: 'drinks', price: 8.90 },
      ];
    },
  });
}

// ============= HOOKS PARA FINANCEIRO =============

export function useFinancialReport(period: 'daily' | 'weekly' | 'monthly') {
  return useQuery({
    queryKey: ['financial', 'report', period],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        period,
        revenue: 12500.50,
        expenses: 3200.00,
        profit: 9300.50,
        transactions: [],
      };
    },
  });
}
