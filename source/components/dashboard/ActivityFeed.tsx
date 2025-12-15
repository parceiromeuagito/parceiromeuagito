import { useMemo } from "react";
import { useOrderStore } from "../../store/useOrderStore";
import { formatDate } from "../../lib/utils";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function ActivityFeed() {
  const { orders } = useOrderStore();

  const recentActivities = useMemo(() => {
    return orders.slice(0, 10).map((order) => ({
      id: order.id,
      type: order.type,
      customer: order.customerName,
      avatar: order.customerAvatar,
      status: order.status,
      timestamp: order.createdAt,
      message:
        order.type === "hotel"
          ? "Nova reserva de quarto"
          : order.type === "tickets"
            ? "Comprou ingressos"
            : `Status: ${order.status}`,
    }));
    // .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Já vem ordenado do store geralmente, mas ok
  }, [orders]);

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 flex flex-col overflow-hidden h-[480px]">
      <div className="p-6 border-b border-zinc-800">
        <h3 className="text-lg font-bold text-white">Atividade Recente</h3>
        <p className="text-sm text-zinc-500">Últimas interações</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {recentActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <p>Nenhuma atividade recente.</p>
          </div>
        ) : (
          recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="group flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
            >
              <div className="relative">
                <img
                  src={
                    activity.avatar ||
                    `https://ui-avatars.com/api/?name=${activity.customer}&background=random`
                  }
                  alt={activity.customer}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-zinc-900 rounded-full ${
                    activity.status === "pending"
                      ? "bg-yellow-500"
                      : activity.status === "completed"
                        ? "bg-green-500"
                        : "bg-blue-500"
                  }`}
                ></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                    {activity.customer}
                  </p>
                  <span className="text-xs text-zinc-500">
                    {formatDate(new Date(activity.timestamp)).split(" ")[1]}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 truncate group-hover:text-zinc-400 transition-colors">
                  {activity.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
        <Link
          to="/dashboard/orders"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all"
        >
          Ver Central de Pedidos
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
