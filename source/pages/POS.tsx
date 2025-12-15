import { useState, useEffect } from 'react';
import { useCatalogStore } from '../store/useCatalogStore';
import { useOrderStore } from '../store/useOrderStore';
import { useCashRegisterStore } from '../store/useCashRegisterStore';
import { usePOSStore } from '../store/usePOSStore';
import { Search, Grid, List, User, Trash2, Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '../lib/utils';
import { useToast } from '../contexts/ToastContext';
import { Order } from '../types';
import PaymentModal from '../components/pos/PaymentModal';

/**
 * Página do Sistema de Ponto de Venda (POS)
 */
const POS = () => {
    const { catalog } = useCatalogStore();
    const { addOrder } = useOrderStore();
    const { cashRegister } = useCashRegisterStore();
    const {
        cart, addToCart, updateQuantity,
        getSubtotal, getTotal, discount,
        paymentDetails, clearSale,
        selectedCustomer
    } = usePOSStore();
    const { addToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Filtragem de produtos
    const categories = ['all', ...Array.from(new Set(catalog.map(item => item.category)))];

    const filteredProducts = catalog.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory && item.available;
    });

    /**
     * Abre o modal de pagamento
     */
    const handleOpenPayment = () => {
        if (cart.length === 0) {
            addToast('Carrinho vazio', 'warning');
            return;
        }

        if (!cashRegister.isOpen) {
            addToast('Caixa fechado! Abra o caixa antes de vender.', 'error');
            return;
        }

        setIsPaymentModalOpen(true);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        /**
         * Atalhos de teclado para POS
         * F2: Foco na busca
         * F9: Abrir pagamento
         * ESC: Cancelar operação
         */
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                const searchInput = document.getElementById('pos-search-input');
                if (searchInput) searchInput.focus();
            }
            if (e.key === 'F9') {
                e.preventDefault();
                handleOpenPayment();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                if (isPaymentModalOpen) {
                    setIsPaymentModalOpen(false);
                } else if (cart.length > 0) {
                    if (confirm('Limpar venda atual?')) {
                        clearSale();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, isPaymentModalOpen, cashRegister.isOpen]);

    /**
     * Confirma o pagamento e finaliza a venda
     */
    const handleConfirmPayment = () => {
        try {
            if (!paymentDetails) {
                addToast('Detalhes do pagamento inválidos', 'error');
                return;
            }

            const newOrder: Order = {
                id: Date.now().toString(),
                customerName: selectedCustomer?.name || 'Cliente Balcão',
                customerContact: selectedCustomer?.phone || '',
                customerAvatar: selectedCustomer?.avatar,
                type: 'delivery', // Default type, could be dynamic
                source: 'counter',
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    details: ''
                })),
                total: getTotal(),
                status: 'completed', // Venda balcão já sai completa
                createdAt: new Date(),
                paymentMethod: paymentDetails.method,
                paymentDetails: {
                    receivedAmount: paymentDetails.receivedAmount,
                    change: paymentDetails.change,
                    installments: paymentDetails.installments,
                    payments: paymentDetails.payments
                },
                chatHistory: [],
                statusHistory: [{
                    status: 'completed',
                    timestamp: new Date(),
                    user: 'POS'
                }]
            };

            addOrder(newOrder);
            addToast('Venda realizada com sucesso!', 'success');
            setIsPaymentModalOpen(false);
            clearSale();
        } catch (error) {
            addToast('Erro ao finalizar venda', 'error');
            console.error(error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] gap-4 p-4 overflow-hidden bg-black/95">

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={handleConfirmPayment}
                total={getTotal()}
            />

            {/* LADO ESQUERDO: CATÁLOGO */}
            <div className="flex-1 flex flex-col gap-4 bg-zinc-900 rounded-xl p-4 shadow-sm overflow-hidden border border-zinc-800">
                {/* Header Catálogo */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                        <Input
                            id="pos-search-input"
                            placeholder="Buscar produtos... (F2)"
                            className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categorias */}
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {categories.map(cat => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(cat)}
                            className={`capitalize whitespace-nowrap ${selectedCategory === cat ? 'bg-primary text-white hover:bg-primary/90' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-white'}`}
                        >
                            {cat === 'all' ? 'Todos' : cat}
                        </Button>
                    ))}
                </div>

                {/* Grid de Produtos */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="flex flex-col items-start p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-primary/50 hover:bg-zinc-800 transition-all text-left group"
                            >
                                <div className="w-full aspect-square rounded-md bg-zinc-800 mb-3 overflow-hidden relative">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                            <Grid className="w-8 h-8" />
                                        </div>
                                    )}
                                    {product.stock !== undefined && (
                                        <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="absolute top-2 right-2 text-[10px] h-5">
                                            {product.stock} un
                                        </Badge>
                                    )}
                                </div>
                                <h3 className="font-medium text-sm line-clamp-2 mb-1 text-zinc-200 group-hover:text-white">{product.name}</h3>
                                <p className="text-primary font-bold">{formatCurrency(product.price)}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* LADO DIREITO: CARRINHO & PAGAMENTO */}
            <div className="w-96 flex flex-col bg-zinc-900 rounded-xl shadow-sm overflow-hidden border border-zinc-800">

                {/* Header Carrinho */}
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <h2 className="font-semibold flex items-center gap-2 text-white">
                        <List className="w-4 h-4" /> Carrinho
                    </h2>
                    <Button variant="ghost" size="icon" onClick={clearSale} className="text-red-500 hover:text-red-400 hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                {/* Lista de Itens */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="flex flex-col gap-3">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-zinc-500 text-sm text-center">
                                <List className="w-8 h-8 mb-2 opacity-20" />
                                <p>Carrinho vazio</p>
                                <p className="text-xs">Selecione produtos ao lado</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex gap-3 items-start group">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-zinc-200">{item.name}</p>
                                        <p className="text-xs text-zinc-500">{formatCurrency(item.price)} un</p>
                                    </div>

                                    <div className="flex items-center gap-2 bg-zinc-800 rounded-md p-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-sm font-medium w-4 text-center text-white">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>

                                    <div className="text-right min-w-[60px]">
                                        <p className="text-sm font-semibold text-white">{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Painel de Totais e Pagamento */}
                <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 space-y-4">

                    {/* Cliente (Placeholder) */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500 flex items-center gap-2">
                            <User className="w-4 h-4" /> Cliente
                        </span>
                        <span className="font-medium text-zinc-300">{selectedCustomer?.name || 'Consumidor Final'}</span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-zinc-800">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Subtotal</span>
                            <span className="text-zinc-300">{formatCurrency(getSubtotal())}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Desconto</span>
                            <span className="text-red-400">-{formatCurrency(discount)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold pt-2">
                            <span className="text-white">Total</span>
                            <span className="text-primary">{formatCurrency(getTotal())}</span>
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
                        onClick={handleOpenPayment}
                        disabled={cart.length === 0}
                    >
                        Finalizar Venda
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default POS;
