import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Order, OrderStatus } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import {
  MessageCircle,
  Calendar as CalendarIcon, BedDouble, Ticket,
  Check, Zap,
  LayoutList, Kanban as KanbanIcon, ArrowRight, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderDetailsModal } from '../components/orders/OrderDetailsModal';
import { EmptyState } from '../components/ui/EmptyState';
import { useBusinessStore } from '../store/useBusinessStore';
import { useOrderStore } from '../store/useOrderStore';
import { useToast } from '../contexts/ToastContext';
import { printOrderReceipt } from '../lib/printer';

type OutletContext = {
  setSelectedChatOrder: (order: Order | null) => void;
  isChatSidebarCollapsed: boolean;
  setIsChatSidebarCollapsed: (collapsed: boolean) => void;
};

import { sortOrdersIntelligently } from '../lib/orderSorting';

/**
 * Página de Pedidos
 * Exibe lista de pedidos em diferentes visualizações (Kanban, Lista, Calendário)
 * Permite gerenciamento de status, chat e detalhes dos pedidos
 */
const Orders = () => {
  const { setSelectedChatOrder, isChatSidebarCollapsed, setIsChatSidebarCollapsed } = useOutletContext<OutletContext>();
  const { config, updateConfig } = useBusinessStore();
  const { orders: rawOrders, updateOrderStatus } = useOrderStore();

  // Ordenação Inteligente (T23)
  const orders = useMemo(() => sortOrdersIntelligently(rawOrders), [rawOrders]);

  const { addToast } = useToast();

  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const canUseChat = config.plan !== 'starter';

  useEffect(() => {
    if (config.autoAccept) {
      const pending = orders.filter(o => o.status === 'pending');
      pending.forEach(o => {
        updateOrderStatus(o.id, 'accepted');
        if (config.printer.autoPrintOnAccept) {
          try {
            printOrderReceipt(o, config.printer);
          } catch (e) {
            console.error("Impressão automática bloqueada pelo navegador");
          }
        }
      });
      if (pending.length > 0) {
        addToast(`${pending.length} pedidos aceitos automaticamente`, 'info');
      }
    }
  }, [config.autoAccept, orders, config.printer]);

  /**
   * Atualiza o status de um pedido e exibe mensagem de confirmação
   * @param id - ID do pedido
   * @param newStatus - Novo status do pedido
   */
  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    updateOrderStatus(id, newStatus);

    if (newStatus === 'accepted' && config.printer.autoPrintOnAccept) {
      const orderToPrint = orders.find(o => o.id === id);
      if (orderToPrint) {
        printOrderReceipt(orderToPrint, config.printer);
        addToast('Enviado para impressão automática', 'info');
      }
    }

    const statusMessages: Record<OrderStatus, string> = {
      accepted: 'Solicitação aceita!',
      preparing: 'Iniciado preparo/atendimento.',
      ready: 'Marcado como pronto.',
      delivering: 'Saiu para entrega/check-in.',
      completed: 'Pedido finalizado.',
      rejected: 'Solicitação recusada.',
      pending: 'Retornado para pendente.',
      cancelled: 'Pedido cancelado.',
      returned: 'Pedido devolvido.',
      partially_returned: 'Pedido parcialmente devolvido.'
    };

    addToast(statusMessages[newStatus] || 'Status atualizado.', newStatus === 'rejected' || newStatus === 'cancelled' ? 'error' : 'success');
  };

  /**
   * Abre o chat para um pedido específico
   * @param e - Evento do click
   * @param order - Objeto do pedido
   */
  const openChat = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    if (!canUseChat) {
      addToast("Faça upgrade para o plano Pro para usar o chat!", "warning");
      return;
    }
    // Expande a sidebar se estiver colapsada
    if (isChatSidebarCollapsed) {
      setIsChatSidebarCollapsed(false);
    }
    // Define o pedido selecionado para a sidebar
    setSelectedChatOrder(order);
  };

  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  /**
   * Abre modal com detalhes do pedido
   * @param order - Objeto do pedido
   */
  const openDetails = (order: Order) => {
    setSelectedOrderForDetails(order);
    setIsDetailsOpen(true);
  };

  /**
   * Renderiza detalhes específicos do tipo de pedido (delivery, pickup, dine-in)
   * @param order - Objeto do pedido
   */
  const renderSpecificDetails = (order: Order) => {
    switch (order.type) {
      case 'hotel':
        return (
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2 bg-zinc-800/50 p-1.5 rounded border border-zinc-700">
            <BedDouble className="w-3 h-3" />
            {order.checkIn ? formatDate(new Date(order.checkIn)).split(' ')[0] : 'N/A'} • {order.items[0].quantity} Noites
          </div>
        );
      case 'reservation':
        return (
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2 bg-zinc-800/50 p-1.5 rounded border border-zinc-700">
            <CalendarIcon className="w-3 h-3" />
            {order.schedulingDate ? formatDate(new Date(order.schedulingDate)) : 'Hoje'} • {order.guests || 2} Pessoas
          </div>
        );
      case 'tickets':
        return (
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2 bg-zinc-800/50 p-1.5 rounded border border-zinc-700">
            <Ticket className="w-3 h-3" />
            Assento: {order.seatNumber || 'Geral'}
          </div>
        );
      default:
        return null;
    }
  };

  /**
   * Alterna entre abas de visualização (active/history)
   */
  const handleTabChange = (tab: 'active' | 'history') => {
    setActiveTab(tab);
  };

  /**
   * Alterna modo de visualização (kanban/list/calendar)
   */
  const handleViewModeChange = (mode: 'kanban' | 'list' | 'calendar') => {
    setViewMode(mode);
  };

  /**
   * Alterna configuração de aceite automático
   */
  const handleAutoAcceptToggle = (checked: boolean) => {
    updateConfig({ autoAccept: checked });
    addToast(checked ? 'Aceite automático ativado' : 'Aceite automático desativado', 'success');
  };

  /**
   * Fecha modal de detalhes
   */
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  /**
   * Abre chat a partir do modal de detalhes
   */
  const handleOpenChatFromDetails = () => {
    handleCloseDetails();
    if (canUseChat && selectedOrderForDetails) {
      setSelectedChatOrder(selectedOrderForDetails);
      if (isChatSidebarCollapsed) {
        setIsChatSidebarCollapsed(false);
      }
    }
  };

  /**
   * Avança o status do pedido na coluna Kanban
   */
  const handleAdvanceStatus = (e: React.MouseEvent, orderId: string, currentStatus: OrderStatus) => {
    e.stopPropagation();
    const nextStatus: OrderStatus = currentStatus === 'accepted' ? 'preparing' : currentStatus === 'preparing' ? 'ready' : 'delivering';
    handleStatusChange(orderId, nextStatus);
  };

  /**
   * Completa o pedido a partir da coluna Entrega
   */
  const handleCompleteOrder = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    handleStatusChange(orderId, 'completed');
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['accepted', 'preparing', 'ready', 'delivering'].includes(o.status));
  const historyOrders = orders.filter(o => ['completed', 'cancelled', 'rejected'].includes(o.status));

  const kanbanColumns: { id: OrderStatus; label: string; color: string; borderColor: string }[] = [
    { id: 'accepted', label: 'A Fazer / Aceitos', color: 'text-primary', borderColor: 'border-primary' },
    { id: 'preparing', label: 'Em Preparo', color: 'text-amber-500', borderColor: 'border-amber-500' },
    { id: 'ready', label: 'Pronto', color: 'text-green-500', borderColor: 'border-green-500' },
    { id: 'delivering', label: 'Entrega / Check-in', color: 'text-purple-500', borderColor: 'border-purple-500' },
  ];

  // --- CALENDAR VIEW RENDERER ---
  const renderCalendarView = () => {
    // Agrupa pedidos por data
    const ordersByDate = activeOrders.reduce((acc, order) => {
      const date = order.checkIn || order.schedulingDate || order.createdAt;
      const dateKey = new Date(date).toLocaleDateString('pt-BR');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(order);
      return acc;
    }, {} as Record<string, Order[]>);

    const sortedDates = Object.keys(ordersByDate).sort((a, b) => {
      const [da, ma, ya] = a.split('/').map(Number);
      const [db, mb, yb] = b.split('/').map(Number);
      return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
    });

    return (
      <div className="h-full overflow-y-auto p-6 custom-scrollbar">
        {sortedDates.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <EmptyState
              icon={<CalendarIcon className="w-8 h-8" />}
              title="Nenhum agendamento"
              description="Não há reservas ou agendamentos ativos para exibir no calendário."
            />
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="mb-8">
              <h3 className="text-lg font-bold text-white mb-4 sticky top-0 bg-zinc-950 py-2 z-10 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {date}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {ordersByDate[date].map(order => (
                  <button
                    key={order.id}
                    onClick={() => openDetails(order)}
                    className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-sm hover:shadow-md hover:border-zinc-700 transition-all cursor-pointer flex gap-4 text-left w-full"
                  >
                    <div className="flex-col items-center justify-center px-3 py-2 bg-zinc-800 rounded-lg text-primary hidden sm:flex">
                      <span className="text-xs font-bold uppercase">{new Date(order.checkIn || order.schedulingDate || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-zinc-200">{order.customerName}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${order.status === 'accepted' ? 'bg-primary/20 text-primary' : 'bg-green-900/20 text-green-400'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 mb-2">{order.items[0].name} {order.items.length > 1 && `+ ${order.items.length - 1}`}</p>
                      {renderSpecificDetails(order)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
      <OrderDetailsModal
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        order={selectedOrderForDetails}
        onOpenChat={handleOpenChatFromDetails}
      />

      {/* Header da Página */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestão de Solicitações</h2>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => handleTabChange('active')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Em Andamento
              </button>
              <button
                onClick={() => handleTabChange('history')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Histórico
              </button>
            </div>

            {activeTab === 'active' && (
              <div className="h-6 w-px bg-zinc-800 hidden lg:block" />
            )}

            {activeTab === 'active' && (
              <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 hidden lg:flex">
                <button
                  onClick={() => handleViewModeChange('kanban')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-zinc-800 text-primary shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                  title="Visualização Kanban"
                >
                  <KanbanIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-primary shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                  title="Visualização Lista"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewModeChange('calendar')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-zinc-800 text-primary shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                  title="Visualização Calendário"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <label className="flex items-center gap-2 cursor-pointer bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl shadow-sm hover:bg-zinc-800 transition-colors">
            <div className={`p-1.5 rounded-full ${config.autoAccept ? 'bg-yellow-900/30 text-yellow-500' : 'bg-zinc-800 text-zinc-500'}`}>
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-300">Auto-Aceite</span>
              <span className="text-[10px] text-zinc-500">{config.autoAccept ? 'Ativado' : 'Desativado'}</span>
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={config.autoAccept}
              onChange={(e) => handleAutoAcceptToggle(e.target.checked)}
            />
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">

        {activeTab === 'active' && !config.autoAccept && pendingOrders.length > 0 && (
          <div className="mb-6 shrink-0">
            <h3 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              Novas Solicitações ({pendingOrders.length})
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              <AnimatePresence>
                {pendingOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layoutId={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="min-w-[300px] md:min-w-[350px] bg-zinc-900 p-4 rounded-xl border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-all cursor-pointer border-y border-r border-zinc-800"
                    onClick={() => openDetails(order)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-white">{order.customerName}</span>
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">{order.type}</span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-3 line-clamp-1">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'rejected'); }}
                        className="flex-1 py-1.5 border border-red-900/50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-900/20"
                      >
                        Recusar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'accepted'); }}
                        className="flex-1 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm"
                      >
                        Aceitar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden bg-zinc-900/30 rounded-2xl border border-zinc-800 p-1 relative">

          {activeTab === 'history' ? (
            <div className="h-full overflow-y-auto p-4 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold text-zinc-500 uppercase border-b border-zinc-800">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {historyOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12">
                        <EmptyState
                          icon={<LayoutList className="w-8 h-8" />}
                          title="Nenhum pedido no histórico"
                          description="Os pedidos concluídos ou cancelados aparecerão aqui."
                        />
                      </td>
                    </tr>
                  ) : (
                    historyOrders.map(order => (
                      <tr key={order.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-zinc-500">{order.id}</td>
                        <td className="px-4 py-3 font-medium text-zinc-200">{order.customerName}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold uppercase bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                            {order.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500">{formatDate(new Date(order.createdAt))}</td>
                        <td className="px-4 py-3 font-medium text-zinc-200">{formatCurrency(order.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                            }`}>
                            {order.status === 'completed' ? 'Concluído' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openDetails(order)}
                            className="text-primary hover:underline font-medium text-xs"
                          >
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <EmptyState
                icon={<LayoutList className="w-8 h-8" />}
                title="Nenhum pedido ativo"
                description="Aguardando novos pedidos. Eles aparecerão aqui automaticamente."
              />
            </div>
          ) : viewMode === 'calendar' ? (
            renderCalendarView()
          ) : viewMode === 'kanban' ? (
            <div className="h-full overflow-x-auto overflow-y-hidden flex gap-4 p-4 custom-scrollbar">
              {kanbanColumns.map(col => {
                const colOrders = activeOrders.filter(o => o.status === col.id);
                return (
                  <div key={col.id} className="flex-1 min-w-[280px] max-w-[350px] flex flex-col h-full">
                    <div className="flex items-center justify-between p-3 rounded-t-xl border-b border-zinc-800 bg-zinc-900 mb-2 shadow-sm">
                      <span className={`font-bold text-sm ${col.color}`}>{col.label}</span>
                      <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                        {colOrders.length}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar pb-4">
                      {colOrders.map(order => (
                        <motion.button
                          key={order.id}
                          onClick={() => openDetails(order)}
                          className={`w-full text-left bg-zinc-900 p-4 rounded-xl border-l-2 ${col.borderColor} border-y border-r border-zinc-800 shadow-sm hover:shadow-md hover:border-zinc-700 transition-all cursor-pointer group relative`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-zinc-200 text-sm">{order.customerName}</h4>
                            <span className="text-[10px] text-zinc-500 font-mono">{order.id}</span>
                          </div>

                          <div className="text-xs text-zinc-500 mb-3 space-y-1">
                            {order.items.map((item) => (
                              <div key={`${order.id}-${item.name}`} className="flex justify-between">
                                <span>{item.quantity}x {item.name}</span>
                              </div>
                            ))}
                          </div>

                          {renderSpecificDetails(order)}

                          <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                            <div className="relative">
                              <button
                                onClick={(e) => openChat(e, order)}
                                className={`p-1.5 rounded-lg transition-colors relative flex items-center gap-1 ${!canUseChat ? 'text-zinc-600 cursor-not-allowed' :
                                  order.chatHistory.length > 0 ? 'text-primary hover:bg-primary/10' : 'text-zinc-500 hover:bg-zinc-800'
                                  }`}
                              >
                                {canUseChat ? <MessageCircle className="w-4 h-4" /> : <Lock className="w-3 h-3" />}
                                {!canUseChat && <span className="text-[10px] font-bold">Pro</span>}

                                {canUseChat && order.chatHistory.length > 0 && (
                                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                )}
                              </button>
                            </div>

                            <div className="flex gap-1">
                              {col.id !== 'delivering' && (
                                <button
                                  onClick={(e) => handleAdvanceStatus(e, order.id, col.id)}
                                  className="flex items-center gap-1 px-2 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-bold hover:bg-zinc-700 hover:text-white transition-colors"
                                >
                                  Avançar <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                              {col.id === 'delivering' && (
                                <button
                                  onClick={(e) => handleCompleteOrder(e, order.id)}
                                  className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                                >
                                  Concluir <Check className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 content-start custom-scrollbar">
              {activeOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => openDetails(order)}
                  className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer text-left"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                      ${order.status === 'accepted' ? 'bg-primary/20 text-primary' :
                        order.status === 'preparing' ? 'bg-amber-900/20 text-amber-500' :
                          order.status === 'ready' ? 'bg-green-900/20 text-green-500' :
                            'bg-purple-900/20 text-purple-500'}`}>
                      {order.status === 'delivering' ? 'Em Entrega' : order.status}
                    </span>
                    <span className="text-xs font-bold text-zinc-500">{formatCurrency(order.total)}</span>
                  </div>
                  <h4 className="font-bold text-zinc-200 mb-1">{order.customerName}</h4>
                  <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => openChat(e, order)}
                      className={`flex-1 py-2 border border-zinc-800 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${!canUseChat ? 'bg-zinc-900 text-zinc-600' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    >
                      {canUseChat ? 'Chat' : <><Lock className="w-3 h-3" /> Chat (Pro)</>}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = order.status === 'accepted' ? 'preparing' : order.status === 'preparing' ? 'ready' : order.status === 'ready' ? 'delivering' : 'completed';
                        handleStatusChange(order.id, next);
                      }}
                      className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                    >
                      Avançar
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
