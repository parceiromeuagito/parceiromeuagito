import { Order } from "../types";

export function sortOrdersIntelligently(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    // 1. Pendentes sempre no topo
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (b.status === "pending" && a.status !== "pending") return 1;

    // 2. Depois por data (mais recente primeiro)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
