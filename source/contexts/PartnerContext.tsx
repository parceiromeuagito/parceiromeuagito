import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { useToast } from "./ToastContext";
import { useNotifications } from "./NotificationContext";
import {
  BusinessType,
  BusinessContext,
  getBusinessContext,
} from "@/lib/businessContext";
import type { CashRegisterState } from "../types/cash";
import type { InventoryControl, StockAlert } from "../types/inventory";
import type { PrinterConfig } from "../lib/printer";
import { printOrderReceipt, DEFAULT_PRINTER_CONFIG } from "../lib/printer";
import { PlanType } from "../data/plans";
import { useOrder, ServiceConfig, ServiceType } from "./OrderContext";

// --- TIPOS ---
export type ItemType =
  | "food"
  | "product"
  | "service"
  | "event"
  | "accommodation"
  | "combo"; // Adicionado 'combo'

export interface MenuItem {
  id: number;
  type: ItemType;
  name: string;
  price: number;
  category: string;
  image: string | null;
  active: boolean;
  description?: string;

  // Campos para Produtos/Comida
  stock?: number;
  colors?: string[];
  sizes?: string[];
  ingredients?: string;
  calories?: number; // em kcal
  prepTime?: number; // em minutos
  servingSize?: number; // serve quantas pessoas
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  isPopular?: boolean;

  // Campos para Combos
  comboItems?: string[]; // Lista de nomes dos produtos incluídos no combo

  // Campos para Serviços
  duration?: string; // Ex: '30 min', '1h'

  // Campos para Eventos
  date?: string; // Ex: 'DD/MM/AAAA'
  location?: string; // Endereço ou nome do local

  // Campos para Acomodações
  capacity?: number; // Número de pessoas
  amenities?: string[]; // Ex: ['Wi-Fi', 'Piscina']

  // NOVO: Controle de Inventário/Estoque
  inventory?: InventoryControl;
}

export interface PartnerOrder {
  id: string;
  customer: string;
  items: { name: string; qtd: number; obs?: string }[];
  total: number;
  status:
    | "pending"
    | "preparing"
    | "ready"
    | "delivering"
    | "completed"
    | "cancelled";
  time: string;
  address: string;
  paymentMethod: string;
  type: "delivery" | "pickup" | "table" | "booking" | "event" | "stay";
  scheduledFor?: string;
  details?: Record<string, unknown>; // Para armazenar dados específicos (check-in, check-out, mesa, etc)
  createdAt: string; // ISO Date String
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "sale" | "withdrawal" | "fee";
  status: "completed" | "processing";
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  minOrder: number;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  expiryDate: string;
}

// NOVO: Interface de Disponibilidade
export interface AvailabilityBlock {
  date: string; // YYYY-MM-DD
  isFullDay: boolean;
  blockedSlots: string[]; // ["09:00", "10:00"]
}

interface PartnerContextType {
  // Menu
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: number, data: Partial<MenuItem>) => void;
  deleteMenuItem: (id: number) => void;
  toggleMenuItemStatus: (id: number) => void;

  // Orders
  // Orders (Delegado para OrderContext)
  orders: PartnerOrder[];
  updateOrderStatus: (
    orderId: string,
    newStatus: PartnerOrder["status"],
  ) => void;

  // Stats
  stats: {
    salesToday: number;
    activeOrdersCount: number;
    completedOrdersCount: number;
    averageRating: number;
    totalReviews: number;
    balanceAvailable: number;
  };

  // Reviews
  reviews: Review[];
  replyToReview: (reviewId: string, reply: string) => void;

  // Finance
  transactions: Transaction[];
  requestWithdrawal: () => void;

  // Marketing
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, "id" | "usedCount">) => void;
  toggleCouponStatus: (id: string) => void;
  deleteCoupon: (id: string) => void;

  // Agenda / Disponibilidade (NOVO)
  availability: AvailabilityBlock[];
  toggleDayBlock: (date: string) => void;
  toggleSlotBlock: (date: string, time: string) => void;
  isDateBlocked: (date: string) => boolean;
  isSlotBlocked: (date: string, time: string) => boolean;

  // Gestão de Caixa (NOVO)
  cashRegister: CashRegisterState;
  openRegister: (startAmount: number) => void;
  closeRegister: () => void;
  addCashTransaction: (
    type: "supply" | "bleed",
    amount: number,
    description: string,
  ) => void;

  // Gestão de Inventário/Estoque (NOVO)
  checkStockAvailability: (productId: number, quantity: number) => boolean;
  deductStock: (productId: number, quantity: number) => void;
  replenishStock: (
    productId: number,
    quantity: number,
    reason?: string,
  ) => void;
  getStockAlerts: () => StockAlert[];

  // Configuração de Impressora (NOVO)
  printerConfig: PrinterConfig;
  setPrinterConfig: (config: PrinterConfig) => void;

  // Criação de Pedidos (NOVO)
  // Criação de Pedidos (NOVO)
  addOrder: (order: Partial<PartnerOrder>) => void;

  // Planos Premium (NOVO)
  currentPlan: PlanType;
  upgradePlan: (plan: PlanType) => void;

  // Integrações (NOVO)
  integrations: Record<string, { connected: boolean; apiKey?: string }>;
  toggleIntegration: (provider: string, apiKey?: string) => void;

  // Contexto de Negócio (NOVO - Tarefa 17)
  businessType: BusinessType;
  setBusinessType: (type: BusinessType) => void;
  businessContext: BusinessContext;

  // Financeiro (NOVO - Tarefa 16.2)
  // deductBalance: (amount: number) => boolean; // Removido - não implementado

  // OrderContext Exports (NOVO - Tarefa 19)
  services: ServiceConfig[];
  toggleService: (serviceId: ServiceType) => void;
  sendMessage: (orderId: string, message: string) => void;
  selectedService: ServiceType | "all";
  setSelectedService: (service: ServiceType | "all") => void;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

// --- DADOS MOCKADOS ---
const INITIAL_MENU: MenuItem[] = [
  {
    id: 1,
    type: "food",
    name: "Pizza Calabresa",
    price: 45.9,
    category: "Pizzas",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200",
    active: true,
    description: "Molho de tomate, mussarela, calabresa fatiada e cebola.",
    stock: 100,
    prepTime: 25,
    servingSize: 2,
    isSpicy: true,
  },
  {
    id: 2,
    type: "product",
    name: "Tênis Running Pro",
    price: 299.9,
    category: "Esportes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
    active: true,
    description: "Ideal para corridas de longa distância.",
    stock: 15,
    colors: ["#000000", "#FFFFFF", "#FF0000"],
    sizes: ["39", "40", "41", "42"],
  },
  {
    id: 3,
    type: "service",
    name: "Corte de Cabelo",
    price: 50.0,
    category: "Barbearia",
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200",
    active: true,
    description: "Corte moderno com acabamento na navalha.",
    duration: "45 min",
  },
  {
    id: 4,
    type: "event",
    name: "Workshop de React",
    price: 150.0,
    category: "Educação",
    image: "https://images.unsplash.com/photo-1540575467063-178a509324fc?w=200",
    active: true,
    description: "Aprenda hooks e context API.",
    date: "20/12/2024",
    location: "Auditório Principal",
  },
  {
    id: 5,
    type: "combo",
    name: "Combo Família",
    price: 120.0,
    category: "Pizzas",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200",
    active: true,
    description: "2 Pizzas grandes + Refri 2L",
    comboItems: ["Pizza Calabresa", "Pizza Margherita", "Coca-Cola 2L"],
    isPopular: true,
  },
];

const INITIAL_ORDERS: PartnerOrder[] = [
  {
    id: "#1234",
    type: "delivery",
    customer: "João Silva",
    items: [
      { name: "Pizza Calabresa", qtd: 2, obs: "Sem cebola" },
      { name: "Coca-Cola 2L", qtd: 1 },
    ],
    total: 103.8,
    status: "pending",
    time: "19:30",
    address: "Rua das Flores, 123 - Apt 402",
    paymentMethod: "Cartão de Crédito",
    createdAt: new Date().toISOString(),
  },
  {
    id: "#1235",
    type: "booking",
    customer: "Ana Souza",
    items: [{ name: "Corte de Cabelo", qtd: 1 }],
    total: 50.0,
    status: "preparing",
    time: "14:00",
    scheduledFor: "Hoje, 15:30",
    address: "Na Loja",
    paymentMethod: "PIX",
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: "r1",
    customerName: "Maria Oliveira",
    rating: 5,
    comment: "A melhor pizza da região! Chegou super quente.",
    date: "Ontem",
    reply: "Obrigado Maria! Ficamos felizes que gostou.",
  },
  {
    id: "r2",
    customerName: "Pedro Santos",
    rating: 4,
    comment: "Muito boa, mas demorou um pouco mais que o previsto.",
    date: "2 dias atrás",
  },
  {
    id: "r3",
    customerName: "Lucas Lima",
    rating: 5,
    comment: "Recheio generoso, massa perfeita.",
    date: "3 dias atrás",
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    date: "Hoje, 19:30",
    description: "Venda #1234",
    amount: 103.8,
    type: "sale",
    status: "completed",
  },
  {
    id: "t2",
    date: "Hoje, 18:15",
    description: "Venda #1230",
    amount: 24.0,
    type: "sale",
    status: "completed",
  },
  {
    id: "t3",
    date: "Ontem",
    description: "Taxa de Serviço Semanal",
    amount: -50.0,
    type: "fee",
    status: "completed",
  },
  {
    id: "t4",
    date: "15/10/2023",
    description: "Saque para Conta Bancária",
    amount: -1200.0,
    type: "withdrawal",
    status: "completed",
  },
];

const INITIAL_COUPONS: Coupon[] = [
  {
    id: "c1",
    code: "BEMVINDO10",
    discount: 10,
    type: "percentage",
    minOrder: 50,
    usageLimit: 100,
    usedCount: 45,
    active: true,
    expiryDate: "2024-12-31",
  },
  {
    id: "c2",
    code: "FRETEGRATIS",
    discount: 0,
    type: "fixed",
    minOrder: 80,
    usageLimit: 50,
    usedCount: 50,
    active: false,
    expiryDate: "2024-10-10",
  },
];

export const PartnerProvider = ({ children }: { children: ReactNode }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  // Orders agora vem do OrderContext
  const {
    orders: contextOrders,
    addOrder: contextAddOrder,
    updateOrderStatus: contextUpdateOrderStatus,
    services,
    toggleService,
    sendMessage,
    selectedService,
    setSelectedService,
  } = useOrder();
  // Adaptador para manter compatibilidade de tipos se necessário (mas as interfaces são compatíveis)
  const orders = contextOrders as PartnerOrder[];

  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [transactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([]);
  const [cashRegister, setCashRegister] = useState<CashRegisterState>({
    isOpen: false,
    startAmount: 0,
    currentBalance: 0,
    transactions: [],
  });

  // NOVO: Configuração de Impressora
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(
    DEFAULT_PRINTER_CONFIG,
  );

  // NOVO: Planos Premium
  const [currentPlan, setCurrentPlan] = useState<PlanType>("starter");

  // NOVO: Integrações
  const [integrations, setIntegrations] = useState<
    Record<string, { connected: boolean; apiKey?: string }>
  >({});

  // NOVO: Contexto de Negócio
  const [businessType, setBusinessType] = useState<BusinessType>("restaurant");
  const businessContext = useMemo(
    () => getBusinessContext(businessType),
    [businessType],
  );

  const { addToast } = useToast();
  const { addNotification, settings: notificationSettings } =
    useNotifications();

  // --- MENU ACTIONS ---
  const addMenuItem = (item: Omit<MenuItem, "id">) => {
    const newItem = { ...item, id: Date.now() };
    setMenuItems((prev) => [newItem, ...prev]);
    addToast("Item adicionado ao catálogo!", "success");
  };

  const updateMenuItem = (id: number, data: Partial<MenuItem>) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item)),
    );
    addToast("Item atualizado.", "success");
  };

  const deleteMenuItem = (id: number) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
    addToast("Item removido.", "info");
  };

  const toggleMenuItemStatus = (id: number) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = !item.active;
          addToast(`Item ${newStatus ? "ativado" : "desativado"}.`, "info");
          return { ...item, active: newStatus };
        }
        return item;
      }),
    );
  };

  // --- ORDER ACTIONS (ADAPTERS) ---
  const addOrder = (newOrderData: Partial<PartnerOrder>) => {
    // Adaptar para o formato do OrderContext
    // O OrderContext espera Omit<Order, 'id' | 'time' | 'createdAt' | 'messages'>
    // Mas aqui recebemos Partial<PartnerOrder>

    // Vamos garantir que os campos obrigatórios existam ou tenham defaults
    const orderToCreate = {
      customer: newOrderData.customer || "Cliente Balcão",
      items: newOrderData.items || [],
      total: newOrderData.total || 0,
      status: newOrderData.status || "pending",
      address: newOrderData.address || "Balcão",
      paymentMethod: newOrderData.paymentMethod || "cash",
      type: newOrderData.type || "delivery",
      scheduledFor: newOrderData.scheduledFor,
      details: newOrderData.details,
    };

    contextAddOrder(orderToCreate);

    // NOVO: Notificação de Novo Pedido
    if (notificationSettings.events.newOrder) {
      addNotification(
        "Novo Pedido Manual",
        `Pedido criado para ${orderToCreate.customer}.`,
        "success",
        "/portal/orders",
      );
    }
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: PartnerOrder["status"],
  ) => {
    // Lógica de verificação de estoque e outros efeitos colaterais
    // Precisamos encontrar o pedido no array atual (que vem do context)
    const order = orders.find((o) => o.id === orderId);

    if (order) {
      // NOVO: Verificar estoque antes de aceitar pedido
      if (newStatus === "preparing" && order.status === "pending") {
        // Verificar estoque de cada item do pedido
        for (const orderItem of order.items) {
          // Encontrar o produto no menu pelo nome
          const product = menuItems.find(
            (item) => item.name === orderItem.name,
          );

          // VERIFICAÇÃO DE ESTOQUE (Generalizada para todos os tipos com inventário ativo)
          if (product && product.inventory?.enabled) {
            // Verificar se há estoque suficiente
            const hasStock = checkStockAvailability(product.id, orderItem.qtd);

            if (!hasStock) {
              addToast(
                `❌ Estoque insuficiente: ${product.name} (${product.inventory.quantity} disponíveis, pedido: ${orderItem.qtd})`,
                "error",
              );
              return; // Não aceita o pedido
            }
          }
        }

        // Se passou na verificação, processar "consumo" específico por tipo
        for (const orderItem of order.items) {
          const product = menuItems.find(
            (item) => item.name === orderItem.name,
          );

          if (product) {
            // 1. PRODUTOS E EVENTOS (Ingressos): Deduzir Quantidade
            if (
              (product.type === "product" ||
                product.type === "event" ||
                product.type === "food") &&
              product.inventory?.enabled
            ) {
              deductStock(product.id, orderItem.qtd);
            }

            // 2. AGENDAMENTOS (Serviços): Bloquear Horário na Agenda
            else if (product.type === "service" || order.type === "booking") {
              // Se o pedido tem data e hora agendada
              if (order.details?.bookingDate && order.details?.bookingTime) {
                // Verifica se já não está bloqueado (embora a UI deva prevenir, é bom garantir)
                if (
                  !isSlotBlocked(
                    order.details.bookingDate,
                    order.details.bookingTime,
                  )
                ) {
                  toggleSlotBlock(
                    order.details.bookingDate,
                    order.details.bookingTime,
                  );
                  addToast(
                    `📅 Agenda bloqueada: ${order.details.bookingDate} às ${order.details.bookingTime}`,
                    "info",
                  );
                }
              }
            }

            // 3. HOSPEDAGEM: Bloquear Datas (Diárias)
            else if (
              product.type === "accommodation" ||
              order.type === "stay"
            ) {
              if (order.details?.checkIn && order.details?.checkOut) {
                if (product.inventory?.enabled) {
                  deductStock(product.id, orderItem.qtd);
                }
              }
            }
          }
        }

        // NOVO: Auto-print ao aceitar pedido
        if (printerConfig.autoPrintOnAccept) {
          printOrderReceipt(order, printerConfig);
          addToast("🖨️ Imprimindo pedido...", "info");
        }
      }

      // NOVO: Integrar com Caixa se pedido for concluído e pagamento em dinheiro
      if (newStatus === "completed" && order.status !== "completed") {
        if (order.paymentMethod === "cash") {
          // Verifica se caixa está aberto
          if (cashRegister.isOpen) {
            addCashTransaction("supply", order.total, `Pedido #${order.id}`);
            addToast("💰 Venda registrada no caixa!", "success");
          } else {
            addToast(
              "⚠️ Caixa fechado. Venda não registrada no fluxo.",
              "warning",
            );
          }
        }
      }
    }

    // Chama a função original do OrderContext
    contextUpdateOrderStatus(orderId, newStatus);
  };

  // --- REVIEW ACTIONS ---
  const replyToReview = (reviewId: string, reply: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, reply } : r)),
    );
    addToast("Resposta enviada com sucesso!", "success");
  };

  // --- FINANCE ACTIONS ---
  const requestWithdrawal = () => {
    addToast("Solicitação de saque enviada! Prazo: 1 dia útil.", "success");
  };

  // --- MARKETING ACTIONS ---
  const addCoupon = (coupon: Omit<Coupon, "id" | "usedCount">) => {
    const newCoupon = { ...coupon, id: `c-${Date.now()}`, usedCount: 0 };
    setCoupons((prev) => [newCoupon, ...prev]);
    addToast("Cupom criado com sucesso!", "success");
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    );
    addToast("Status do cupom alterado.", "info");
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    addToast("Cupom excluído.", "info");
  };

  // --- AVAILABILITY ACTIONS ---
  const toggleDayBlock = (date: string) => {
    setAvailability((prev) => {
      const exists = prev.find((a) => a.date === date);
      if (exists) {
        // Se já existe e está fullDay, remove. Se não, torna fullDay.
        if (exists.isFullDay) {
          return prev.filter((a) => a.date !== date); // Desbloqueia
        } else {
          return prev.map((a) =>
            a.date === date ? { ...a, isFullDay: true, blockedSlots: [] } : a,
          );
        }
      } else {
        return [...prev, { date, isFullDay: true, blockedSlots: [] }];
      }
    });
  };

  const toggleSlotBlock = (date: string, time: string) => {
    setAvailability((prev) => {
      const exists = prev.find((a) => a.date === date);
      if (exists) {
        const isSlotBlocked = exists.blockedSlots.includes(time);
        const newSlots = isSlotBlocked
          ? exists.blockedSlots.filter((s) => s !== time)
          : [...exists.blockedSlots, time];

        // Se não sobrar slots e não for dia inteiro, remove a entrada
        if (newSlots.length === 0 && !exists.isFullDay) {
          return prev.filter((a) => a.date !== date);
        }

        return prev.map((a) =>
          a.date === date ? { ...a, blockedSlots: newSlots } : a,
        );
      } else {
        return [...prev, { date, isFullDay: false, blockedSlots: [time] }];
      }
    });
  };

  const isDateBlocked = (date: string) => {
    const entry = availability.find((a) => a.date === date);
    return entry ? entry.isFullDay : false;
  };

  const isSlotBlocked = (date: string, time: string) => {
    const entry = availability.find((a) => a.date === date);
    if (!entry) return false;
    if (entry.isFullDay) return true;
    return entry.blockedSlots.includes(time);
  };

  // --- CASH REGISTER ACTIONS ---
  const openRegister = (startAmount: number) => {
    setCashRegister({
      isOpen: true,
      openedAt: new Date(),
      startAmount,
      currentBalance: startAmount,
      transactions: [
        {
          id: Date.now().toString(),
          type: "opening",
          amount: startAmount,
          description: "Abertura de Caixa",
          timestamp: new Date(),
          user: "Admin", // TODO: pegar do contexto de usuário
        },
      ],
    });
    addToast("Caixa aberto com sucesso!", "success");
  };

  const closeRegister = () => {
    setCashRegister((prev) => ({
      ...prev,
      isOpen: false,
      closedAt: new Date(),
      transactions: [
        {
          id: Date.now().toString(),
          type: "closing",
          amount: prev.currentBalance,
          description: "Fechamento de Caixa",
          timestamp: new Date(),
          user: "Admin",
        },
        ...prev.transactions,
      ],
    }));
    addToast("Caixa fechado com sucesso!", "success");
  };

  const addCashTransaction = (
    type: "supply" | "bleed",
    amount: number,
    description: string,
  ) => {
    setCashRegister((prev) => {
      const newBalance =
        type === "supply"
          ? prev.currentBalance + amount
          : prev.currentBalance - amount;

      return {
        ...prev,
        currentBalance: newBalance,
        transactions: [
          {
            id: Date.now().toString(),
            type,
            amount,
            description,
            timestamp: new Date(),
            user: "Admin",
          },
          ...prev.transactions,
        ],
      };
    });
    addToast(
      type === "supply" ? "Suprimento registrado!" : "Sangria registrada!",
      "success",
    );
  };

  // --- INVENTORY/STOCK MANAGEMENT ---

  /**
   * Verifica se há estoque disponível para um produto
   * @param productId ID do produto
   * @param quantity Quantidade desejada
   * @returns true se há estoque suficiente, false caso contrário
   */
  const checkStockAvailability = (
    productId: number,
    quantity: number,
  ): boolean => {
    const product = menuItems.find((p) => p.id === productId);

    // Se produto não existe, retorna false
    if (!product) return false;

    // Se produto não tem controle de inventário, retorna true (sempre disponível)
    if (!product.inventory || !product.inventory.enabled) return true;

    // Verifica se há estoque suficiente
    return product.inventory.quantity >= quantity;
  };

  /**
   * Deduz estoque de um produto (ao aceitar pedido)
   * @param productId ID do produto
   * @param quantity Quantidade a deduzir
   */
  const deductStock = (productId: number, quantity: number): void => {
    setMenuItems((prev) =>
      prev.map((product) => {
        if (product.id === productId && product.inventory?.enabled) {
          const newQuantity = product.inventory.quantity - quantity;

          // Atualiza estoque
          const updatedProduct = {
            ...product,
            inventory: {
              ...product.inventory,
              quantity: Math.max(0, newQuantity), // Nunca negativo
            },
            // Se estoque = 0, desativa produto automaticamente
            active: newQuantity > 0 ? product.active : false,
          };

          // Alerta se estoque baixo
          if (newQuantity <= product.inventory.minAlert && newQuantity > 0) {
            addToast(
              `⚠️ Estoque baixo: ${product.name} (${newQuantity} unidades)`,
              "warning",
            );

            // NOVO: Notificação persistente de estoque baixo
            if (notificationSettings.events.stockLow) {
              addNotification(
                "Estoque Baixo",
                `O produto ${product.name} atingiu o nível de alerta (${newQuantity} restantes).`,
                "warning",
                "/portal/menu",
              );
            }
          } else if (newQuantity === 0) {
            addToast(`🚫 Estoque esgotado: ${product.name}`, "error");
          }

          return updatedProduct;
        }
        return product;
      }),
    );
  };

  /**
   * Repõe estoque de um produto
   * @param productId ID do produto
   * @param quantity Quantidade a adicionar
   * @param reason Motivo da reposição (opcional)
   */
  const replenishStock = (
    productId: number,
    quantity: number,
    _reason?: string,
  ): void => {
    setMenuItems((prev) =>
      prev.map((product) => {
        if (product.id === productId && product.inventory?.enabled) {
          const newQuantity = product.inventory.quantity + quantity;

          addToast(
            `✅ Estoque reposto: ${product.name} (+${quantity} unidades)`,
            "success",
          );

          return {
            ...product,
            inventory: {
              ...product.inventory,
              quantity: newQuantity,
            },
            // Reativa produto se estava desativado por falta de estoque
            active: true,
          };
        }
        return product;
      }),
    );
  };

  /**
   * Obtém lista de alertas de estoque baixo
   * @returns Array de alertas de estoque
   */
  const getStockAlerts = (): StockAlert[] => {
    return menuItems
      .filter(
        (product) =>
          product.inventory?.enabled &&
          product.inventory.quantity <= product.inventory.minAlert,
      )
      .map((product) => {
        const currentStock = product.inventory!.quantity;
        const minAlert = product.inventory!.minAlert;

        // Determina severidade
        let severity: "low" | "critical" | "out" = "low";
        if (currentStock === 0) {
          severity = "out";
        } else if (currentStock < minAlert / 2) {
          severity = "critical";
        }

        return {
          productId: product.id,
          productName: product.name,
          currentStock,
          minAlert,
          severity,
        };
      })
      .sort((a, b) => {
        // Ordena por severidade: out > critical > low
        const severityOrder = { out: 3, critical: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
  };

  // --- PLANS ACTIONS ---
  const upgradePlan = (plan: PlanType) => {
    setCurrentPlan(plan);
    addToast(`Parabéns! Você agora é ${plan.toUpperCase()}! 🚀`, "success");
  };

  // --- INTEGRATIONS ACTIONS ---
  const toggleIntegration = (provider: string, apiKey?: string) => {
    setIntegrations((prev) => {
      const isConnected = prev[provider]?.connected;

      if (isConnected) {
        // Desconectar
        const newIntegrations = { ...prev };
        delete newIntegrations[provider];
        addToast(`Integração com ${provider} desconectada.`, "info");
        return newIntegrations;
      } else {
        // Conectar
        addToast(
          `Integração com ${provider} conectada com sucesso!`,
          "success",
        );
        return {
          ...prev,
          [provider]: { connected: true, apiKey },
        };
      }
    });
  };

  // --- STATS ---
  const stats = useMemo(() => {
    const salesToday = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((acc, curr) => acc + curr.total, 0);
    const activeOrdersCount = orders.filter((o) =>
      ["pending", "preparing", "ready", "delivering"].includes(o.status),
    ).length;
    const completedOrdersCount = orders.filter(
      (o) => o.status === "completed",
    ).length;
    const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const balanceAvailable = 1450.5 + salesToday;

    return {
      salesToday,
      activeOrdersCount,
      completedOrdersCount,
      averageRating,
      totalReviews: reviews.length,
      balanceAvailable,
    };
  }, [orders, reviews]);

  return (
    <PartnerContext.Provider
      value={{
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuItemStatus,
        orders,
        updateOrderStatus,
        stats,
        reviews,
        replyToReview,
        transactions,
        requestWithdrawal,
        coupons,
        addCoupon,
        toggleCouponStatus,
        deleteCoupon,
        availability,
        toggleDayBlock,
        toggleSlotBlock,
        isDateBlocked,
        isSlotBlocked,
        cashRegister,
        openRegister,
        closeRegister,
        addCashTransaction,
        checkStockAvailability,
        deductStock,
        replenishStock,
        getStockAlerts,
        printerConfig,
        setPrinterConfig,
        addOrder,
        currentPlan,
        upgradePlan,
        integrations,
        toggleIntegration,
        businessType,
        setBusinessType,
        businessContext,
        services,
        toggleService,
        sendMessage,
        selectedService,
        setSelectedService,
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => {
  const context = useContext(PartnerContext);
  if (context === undefined) {
    throw new Error("usePartner must be used within a PartnerProvider");
  }
  return context;
};
