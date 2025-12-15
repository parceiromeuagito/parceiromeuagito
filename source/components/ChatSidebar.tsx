import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  User,
  Clock,
  ChevronRight,
  ChevronLeft,
  Send,
} from "lucide-react";
import { Order, Message } from "../types";
import { cn } from "../lib/utils";
import { useOrderStore } from "../store/useOrderStore";

interface ChatSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  externalSelectedOrder?: Order | null;
}

const ChatSidebar = ({
  isCollapsed = false,
  onToggleCollapse,
  externalSelectedOrder,
}: ChatSidebarProps) => {
  const { orders, addOrderMessage } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const onSendMessage = (orderId: string, content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "business",
      content,
      timestamp: new Date(),
    };
    addOrderMessage(orderId, newMessage);
  };

  // Reage a seleção externa (do balão dos cards)
  useEffect(() => {
    if (externalSelectedOrder) {
      setActiveChatOrder(externalSelectedOrder);
    }
  }, [externalSelectedOrder]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (activeChatOrder) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChatOrder?.chatHistory]);

  // Filtra pedidos com chat e ordena por última mensagem
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

  const handleSendClick = () => {
    if (messageInput.trim() && activeChatOrder && onSendMessage) {
      onSendMessage(activeChatOrder.id, messageInput);
      setMessageInput("");
    }
  };

  const handleChatClick = (order: Order) => {
    setActiveChatOrder(order);
    setSearchTerm("");
  };

  const handleBackToList = () => {
    setActiveChatOrder(null);
  };

  // Versão colapsada
  if (isCollapsed) {
    return (
      <div className="fixed right-0 top-0 h-screen w-16 bg-white dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-800 flex flex-col items-center py-6 z-40">
        <button
          onClick={onToggleCollapse}
          className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors relative"
          title="Expandir chats"
        >
          <MessageCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          {ordersWithChat.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
              {ordersWithChat.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Versão expandida - Mostrando chat ativo
  if (activeChatOrder) {
    return (
      <div className="fixed right-0 top-0 h-screen w-72 bg-white dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-800 flex flex-col z-40">
        {/* Header do Chat */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3">
          <button
            onClick={handleBackToList}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
            title="Voltar"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">
              {activeChatOrder.customerName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pedido #{activeChatOrder.id}
            </p>
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
            title="Recolher"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeChatOrder.chatHistory.map((msg: Message) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.sender === "business" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2",
                  msg.sender === "business"
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white",
                )}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    msg.sender === "business"
                      ? "text-white/70"
                      : "text-gray-500 dark:text-gray-400",
                  )}
                >
                  {msg.timestamp instanceof Date
                    ? msg.timestamp.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Mensagem */}
        <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendClick()}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <button
              onClick={handleSendClick}
              className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Versão expandida - Lista de conversas
  return (
    <div className="fixed right-0 top-0 h-screen w-72 bg-white dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-800 flex flex-col z-40">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-gray-900 dark:text-white">
              Conversas
            </h2>
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
            title="Recolher"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar conversa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
        />
      </div>

      {/* Lista de Conversas */}
      <div className="flex-1 overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-zinc-700 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Nenhuma conversa encontrada"
                : "Nenhuma mensagem ainda"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredOrders.map((order) => {
              const lastMessage =
                order.chatHistory[order.chatHistory.length - 1];
              const unreadCount = order.chatHistory.filter(
                (msg) => msg.sender === "customer",
              ).length;

              return (
                <button
                  key={order.id}
                  onClick={() => handleChatClick(order)}
                  className="w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all text-left border border-transparent hover:border-primary/30 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                          {order.customerName}
                        </h3>
                        {unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Pedido #{order.id}
                      </p>

                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {lastMessage.sender === "business" && "Você: "}
                        {lastMessage.content}
                      </p>

                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        {lastMessage.timestamp instanceof Date
                          ? lastMessage.timestamp.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : new Date(lastMessage.timestamp).toLocaleTimeString(
                              "pt-BR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
