export const PRODUCT_CATEGORIES = {
  menu: { name: "Cardápio", icon: "UtensilsCrossed" },
  room: { name: "Quartos", icon: "Bed" },
  event: { name: "Ingressos", icon: "Ticket" },
  service: { name: "Serviços", icon: "Calendar" },
  table: { name: "Mesas", icon: "Armchair" },
  shopping: { name: "Produtos", icon: "ShoppingBag" },
};

export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
  serviceType: string;
}
