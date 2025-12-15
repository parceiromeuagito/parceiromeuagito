import { useState } from "react";
import { MessageCircle, Search, User, Clock } from "lucide-react";
import { useOrderStore } from "../store/useOrderStore";
import PremiumFeature from "../components/PremiumFeature";

const Chat = () => {
  const { orders = [] } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Filtra pedidos que têm chat (mensagens)
  const ordersWithChat = (orders || [])
    .filter(
      (order) =>
        order?.chatHistory &&
        Array.isArray(order.chatHistory) &&
        order.chatHistory.length > 0,
    )
    .sort((a, b) => {
      const lastMessageA = a.chatHistory?.[a.chatHistory.length - 1];
      const lastMessageB = b.chatHistory?.[b.chatHistory.length - 1];
      const timeA = lastMessageA?.timestamp
        ? lastMessageA.timestamp instanceof Date
          ? lastMessageA.timestamp.getTime()
          : new Date(lastMessageA.timestamp).getTime()
        : 0;
      const timeB = lastMessageB?.timestamp
        ? lastMessageB.timestamp instanceof Date
          ? lastMessageB.timestamp.getTime()
          : new Date(lastMessageB.timestamp).getTime()
        : 0;
      return timeB - timeA;
    });

  const filteredOrders = ordersWithChat.filter(
    (order) =>
      order?.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.id?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <PremiumFeature
      minPlan="pro"
      fallback={
        <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Mensagens Bloqueadas
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
            O sistema de mensagens está disponível apenas nos planos Pro e
            Enterprise. Faça upgrade para conversar com seus clientes em tempo
            real!
          </p>
          <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
            Ver Planos
          </button>
        </div>
      }
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 p-6 -m-8 mb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Mensagens
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {ordersWithChat.length} conversas ativas
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente ou pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageCircle className="w-16 h-16 text-gray-300 dark:text-zinc-700 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {searchTerm
                  ? "Nenhuma conversa encontrada"
                  : "Nenhuma mensagem ainda"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                {searchTerm
                  ? "Tente buscar por outro termo"
                  : "As conversas com clientes aparecerão aqui quando iniciadas através dos pedidos."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => {
                const lastMessage =
                  order.chatHistory[order.chatHistory.length - 1];
                const unreadCount = order.chatHistory.filter(
                  (msg) => msg.sender === "customer",
                ).length;

                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              {order.customerName}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Pedido #{order.id}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              {lastMessage.timestamp instanceof Date
                                ? lastMessage.timestamp.toLocaleTimeString(
                                    "pt-BR",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )
                                : new Date(
                                    lastMessage.timestamp,
                                  ).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                            </div>
                            {unreadCount > 0 && (
                              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {lastMessage.sender === "business" && "Você: "}
                          {lastMessage.content}
                        </p>

                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">
                          💡 Acesse os chats através da página de Pedidos
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PremiumFeature>
  );
};

export default Chat;
