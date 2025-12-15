export type BusinessType =
  | "restaurant"
  | "hotel"
  | "event"
  | "service"
  | "retail";

export interface BusinessContext {
  type: BusinessType;
  label: string;
  itemLabel: string;
  customerLabel: string;
  actionLabel: string;
  metrics: {
    sales: string;
    active: string;
    rating: string;
  };
}

export function getBusinessContext(type: BusinessType): BusinessContext {
  const contexts: Record<BusinessType, BusinessContext> = {
    restaurant: {
      type: "restaurant",
      label: "Restaurante",
      itemLabel: "Prato",
      customerLabel: "Cliente",
      actionLabel: "Pedido",
      metrics: {
        sales: "Vendas Hoje",
        active: "Pedidos Ativos",
        rating: "Avaliação",
      },
    },
    hotel: {
      type: "hotel",
      label: "Hotelaria",
      itemLabel: "Acomodação",
      customerLabel: "Hóspede",
      actionLabel: "Reserva",
      metrics: {
        sales: "Receita Diária",
        active: "Check-ins Hoje",
        rating: "Avaliação",
      },
    },
    event: {
      type: "event",
      label: "Eventos",
      itemLabel: "Ingresso",
      customerLabel: "Participante",
      actionLabel: "Venda",
      metrics: {
        sales: "Bilheteria",
        active: "Ingressos Vendidos",
        rating: "Satisfação",
      },
    },
    service: {
      type: "service",
      label: "Serviços",
      itemLabel: "Serviço",
      customerLabel: "Cliente",
      actionLabel: "Agendamento",
      metrics: {
        sales: "Faturamento",
        active: "Agendamentos",
        rating: "Avaliação",
      },
    },
    retail: {
      type: "retail",
      label: "Varejo",
      itemLabel: "Produto",
      customerLabel: "Cliente",
      actionLabel: "Venda",
      metrics: {
        sales: "Vendas",
        active: "Carrinhos Ativos",
        rating: "Avaliação",
      },
    },
  };

  return contexts[type] || contexts.restaurant;
}
