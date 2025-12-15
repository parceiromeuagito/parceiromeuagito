import { create } from "zustand";
import {
  ServiceConfig,
  PlanTier,
  UserProfile,
  IntegrationConfig,
  BusinessType,
} from "../types";
import { PLANS } from "../data/plans";
import { loadData, saveData } from "../lib/persistence";

// --- Configuração Inicial ---
const DEFAULT_INTEGRATIONS: IntegrationConfig[] = [
  { id: "1", provider: "ifood", name: "iFood Delivery", connected: false },
  { id: "2", provider: "booking", name: "Booking.com", connected: false },
  {
    id: "3",
    provider: "google_reserve",
    name: "Google Reservas",
    connected: false,
  },
  { id: "4", provider: "eventbrite", name: "Eventbrite", connected: false },
];

const DEFAULT_CONFIG: ServiceConfig = {
  businessTypes: ["delivery"],
  primaryType: "delivery",
  autoAccept: false,
  workingHours: { start: "09:00", end: "18:00" },
  currency: "BRL",
  notificationsEnabled: true,
  plan: "starter",
  integrations: DEFAULT_INTEGRATIONS,
  printer: {
    autoPrintOnAccept: false,
    paperWidth: "80mm",
    fontSize: "normal",
    copies: 1,
    customHeader: "*** UNIMANAGER STORE ***",
    customFooter: "Obrigado pela preferência!",
    showCustomerAddress: true,
  },
  theme: "dark",
};

const loadInitialConfig = (): ServiceConfig => {
  try {
    const saved = localStorage.getItem("businessConfig");
    if (!saved) return DEFAULT_CONFIG;

    const parsed = JSON.parse(saved);

    if (!parsed.businessTypes && parsed.businessType) {
      parsed.businessTypes = [parsed.businessType];
    }

    if (!Array.isArray(parsed.businessTypes)) {
      parsed.businessTypes = DEFAULT_CONFIG.businessTypes;
    }

    if (!parsed.integrations) {
      parsed.integrations = DEFAULT_INTEGRATIONS;
    }

    if (!parsed.printer) {
      parsed.printer = DEFAULT_CONFIG.printer;
    }

    // Backward compatibility for primaryType
    if (!parsed.primaryType) {
      parsed.primaryType =
        parsed.businessTypes && parsed.businessTypes.length > 0
          ? parsed.businessTypes[0]
          : "delivery";
    }

    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
};

interface BusinessState {
  config: ServiceConfig;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  updateConfig: (updates: Partial<ServiceConfig>) => void;
  updatePlan: (newPlan: PlanTier) => void;
  toggleBusinessType: (type: BusinessType) => void;
  setPrimaryType: (type: BusinessType) => void;
  toggleIntegration: (providerId: string, apiKey: string) => void;
  resetSystem: () => void;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  config: loadInitialConfig(),
  user: loadData<UserProfile | null>("businessUser", null),
  isAuthenticated: !!localStorage.getItem("businessUser"),

  login: (email: string) =>
    set(() => {
      const mockUser: UserProfile = {
        name: "Admin User",
        email,
        avatar:
          "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
        role: "admin",
      };
      saveData("businessUser", mockUser);
      return { user: mockUser, isAuthenticated: true };
    }),

  logout: () =>
    set(() => {
      localStorage.removeItem("businessUser");
      return { user: null, isAuthenticated: false };
    }),

  updateConfig: (updates: Partial<ServiceConfig>) =>
    set((state) => {
      const newConfig = { ...state.config, ...updates };
      saveData("businessConfig", newConfig);
      return { config: newConfig };
    }),

  toggleIntegration: (providerId: string, apiKey: string) =>
    set((state) => {
      const newIntegrations = state.config.integrations.map((int) => {
        if (int.id === providerId) {
          return {
            ...int,
            connected: !int.connected,
            apiKey: !int.connected ? apiKey : undefined,
            lastSync: !int.connected ? new Date() : undefined,
          };
        }
        return int;
      });
      const newConfig = { ...state.config, integrations: newIntegrations };
      saveData("businessConfig", newConfig);
      return { config: newConfig };
    }),

  updatePlan: (newPlan: PlanTier) =>
    set((state) => {
      const planDef = PLANS[newPlan];
      let newBusinessTypes = state.config.businessTypes;

      if (newBusinessTypes.length > planDef.maxBusinessTypes) {
        newBusinessTypes = newBusinessTypes.slice(0, planDef.maxBusinessTypes);
      }

      const newConfig = {
        ...state.config,
        plan: newPlan,
        businessTypes: newBusinessTypes,
      };
      saveData("businessConfig", newConfig);
      return { config: newConfig };
    }),

  toggleBusinessType: (type: BusinessType) =>
    set((state) => {
      const currentTypes = state.config.businessTypes;
      const planDef = PLANS[state.config.plan];
      let newTypes: BusinessType[];

      if (currentTypes.includes(type)) {
        if (currentTypes.length === 1) return state; // Don't change if only one left
        newTypes = currentTypes.filter((t) => t !== type);
      } else {
        if (currentTypes.length >= planDef.maxBusinessTypes) return state; // Don't change if max reached
        newTypes = [...currentTypes, type];
      }

      const newConfig = { ...state.config, businessTypes: newTypes };
      saveData("businessConfig", newConfig);
      return { config: newConfig };
    }),

  setPrimaryType: (type: BusinessType) =>
    set((state) => {
      // Ensure primary type is also in businessTypes
      let newTypes = state.config.businessTypes;
      if (!newTypes.includes(type)) {
        newTypes = [...newTypes, type];
      }

      const newConfig = {
        ...state.config,
        primaryType: type,
        businessTypes: newTypes,
      };
      saveData("businessConfig", newConfig);
      return { config: newConfig };
    }),

  resetSystem: () => {
    localStorage.clear();
    window.location.href = "/login";
  },
}));

export const getBusinessContext = (
  types: BusinessType[],
  config: ServiceConfig,
) => {
  if (types && types.length > 1) {
    return {
      label: "Multi-Serviços",
      itemLabel: "Item",
      customerLabel: "Cliente",
      actionLabel: "Solicitação",
      metrics: ["Vendas Totais", "Pedidos", "Conversão"],
    };
  }

  const type =
    config.primaryType || (types && types.length > 0 ? types[0] : "delivery");

  switch (type) {
    case "hotel":
      return {
        label: "Hotelaria",
        itemLabel: "Acomodação",
        customerLabel: "Hóspede",
        actionLabel: "Check-in/Out",
        metrics: ["Ocupação", "RevPAR", "Check-ins Hoje"],
      };
    case "tickets":
      return {
        label: "Eventos",
        itemLabel: "Ingresso",
        customerLabel: "Participante",
        actionLabel: "Validar",
        metrics: ["Ingressos Vendidos", "Receita Bilheteria", "Check-ins"],
      };
    case "scheduling":
      return {
        label: "Serviços",
        itemLabel: "Serviço",
        customerLabel: "Cliente",
        actionLabel: "Agenda",
        metrics: ["Agendamentos", "Horas Ocupadas", "Retenção"],
      };
    case "reservation":
      return {
        label: "Restaurante",
        itemLabel: "Mesa/Item",
        customerLabel: "Cliente",
        actionLabel: "Reserva",
        metrics: ["Mesas Ocupadas", "Giro de Mesa", "No-shows"],
      };
    default:
      return {
        label: "Comércio",
        itemLabel: "Produto",
        customerLabel: "Cliente",
        actionLabel: "Pedido",
        metrics: ["Vendas", "Ticket Médio", "Conversão"],
      };
  }
};
