import { PlanDef } from "../types";

export type PlanType = "starter" | "pro" | "enterprise";

export const PLANS: Record<string, PlanDef> = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 0,
    maxBusinessTypes: 1,
    features: [
      "1 Segmento de Atuação",
      "Gestão de Pedidos Básica",
      "Catálogo de Produtos",
      "Sem acesso ao Chat",
      "Relatórios Simples",
    ],
    color: "bg-gray-500",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 99,
    maxBusinessTypes: 3,
    features: [
      "Até 3 Segmentos de Atuação",
      "Chat com Clientes",
      "Painel de Métricas Avançado",
      "Múltiplos Usuários",
      "Suporte Prioritário",
    ],
    color: "bg-blue-600",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    maxBusinessTypes: 99,
    features: [
      "Segmentos Ilimitados",
      "API de Integração",
      "Gerente de Conta Dedicado",
      "White Label",
      "IA de Atendimento",
    ],
    color: "bg-purple-600",
  },
};
