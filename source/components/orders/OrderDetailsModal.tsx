import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, CreditCard, MessageCircle, Printer, Globe, Store, Check, Ban, ArrowRight } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { printOrderReceipt } from '../../lib/printer';
import { useToast } from '../../contexts/ToastContext';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useOrderStore } from '../../store/useOrderStore';
import { StatusTimeline } from './StatusTimeline';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
    onOpenChat: () => void;
}

/**
 * Modal com detalhes completos do pedido
 * @param props Props do modal
 */
export function OrderDetailsModal({ isOpen, onClose, order, onOpenChat }: OrderDetailsModalProps) {
    const { addToast } = useToast();
    const { config } = useBusinessStore();
    const { updateOrderStatus } = useOrderStore();

    if (!order) return null;

    /**
     * Imprime o recibo do pedido
     */
    const handlePrint = () => {
        try {
            printOrderReceipt(order, config.printer);
            addToast('Enviado para impressão', 'success');
        } catch (e) {
            addToast('Erro ao imprimir', 'error');
        }
    };

    /**
     * Atualiza o status do pedido
     * @param newStatus Novo status do pedido
     */
    const handleStatusChange = (newStatus: OrderStatus) => {
        updateOrderStatus(order.id, newStatus);
        addToast(`Pedido ${newStatus === 'accepted' ? 'aceito' : newStatus === 'rejected' ? 'recusado' : 'atualizado'}!`, 'success');
        onClose();
    };

    /**
     * Retorna o ícone correspondente à fonte do pedido
     * @param source Fonte do pedido
     */
    const getSourceIcon = (source: string) => {
        if (source === 'counter') return <Store className="w-4 h-4" />;
        if (source.includes('marketplace')) return <Globe className="w-4 h-4" />;
        return <User className="w-4 h-4" />;
    };

    /**
     * Retorna o rótulo correspondente à fonte do pedido
     * @param source Fonte do pedido
     */
    const getSourceLabel = (source: string) => {
        if (source === 'counter') return 'Balcão (Presencial)';
        if (source === 'marketplace_ifood') return 'iFood';
        if (source === 'marketplace_booking') return 'Booking.com';
        return 'App / Online';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl pointer-events-auto max-h-[90vh] flex flex-col overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-xl font-bold text-gray-900">Detalhes da Solicitação</h2>
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>ID: {order.id}</span>
                                        <span>•</span>
                                        <span>{formatDate(new Date(order.createdAt))}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 bg-gray-200 px-2 py-0.5 rounded-full text-xs font-bold text-gray-700">
                                            {getSourceIcon(order.source)}
                                            {getSourceLabel(order.source)}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Customer Info */}
                                <section className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <img
                                        src={order.customerAvatar || `https://ui-avatars.com/api/?name=${order.customerName}`}
                                        alt={order.customerName}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{order.customerName}</h3>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {order.customerContact}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { onClose(); onOpenChat(); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Chat
                                    </button>
                                </section>

                                {/* Items / Service Details */}
                                <section>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Itens do Pedido</h3>
                                    <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                                        {order.items.map((item) => (
                                            <div key={`${item.id}-${item.name}`} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-200 text-sm font-bold text-gray-700">
                                                        {item.quantity}x
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.name}</p>
                                                        {item.details && <p className="text-xs text-gray-500">{item.details}</p>}
                                                    </div>
                                                </div>
                                                <span className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                        <div className="p-4 bg-gray-100 flex justify-between items-center">
                                            <span className="font-bold text-gray-600">Total</span>
                                            <span className="text-xl font-bold text-gray-900">{formatCurrency(order.total)}</span>
                                        </div>
                                    </div>
                                </section>

                                {/* Context Data */}
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl border border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Pagamento</h4>
                                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                                            <CreditCard className="w-5 h-5 text-gray-400" />
                                            {order.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : order.paymentMethod}
                                            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Pago</span>
                                        </div>
                                    </div>

                                    {/* Status Timeline (T30) */}
                                    <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                                        <StatusTimeline history={order.statusHistory} />
                                    </div>
                                </section>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end items-center">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium mr-auto"
                                >
                                    <Printer className="w-4 h-4" />
                                    Imprimir
                                </button>

                                {order.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange('rejected')}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors"
                                        >
                                            <Ban className="w-4 h-4" />
                                            Recusar
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange('accepted')}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20"
                                        >
                                            <Check className="w-4 h-4" />
                                            Aceitar
                                        </button>
                                    </>
                                )}

                                {order.status === 'accepted' && (
                                    <button
                                        onClick={() => handleStatusChange('preparing')}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                        Iniciar Preparo
                                    </button>
                                )}

                                {order.status === 'preparing' && (
                                    <button
                                        onClick={() => handleStatusChange('ready')}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors"
                                    >
                                        <Check className="w-4 h-4" />
                                        Marcar Pronto
                                    </button>
                                )}

                                {order.status === 'ready' && (
                                    <button
                                        onClick={() => handleStatusChange('delivering')}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                        {order.type === 'delivery' ? 'Enviar Entrega' : 'Entregar ao Cliente'}
                                    </button>
                                )}

                                {order.status === 'delivering' && (
                                    <button
                                        onClick={() => handleStatusChange('completed')}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                                    >
                                        <Check className="w-4 h-4" />
                                        Concluir Pedido
                                    </button>
                                )}

                                {['completed', 'cancelled', 'rejected'].includes(order.status) && (
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
                                    >
                                        Fechar
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
