import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, DollarSign, Tag, Briefcase, Users, Clock, Layers } from 'lucide-react';
import { BusinessType, CatalogItem } from '../types';
import { useBusinessStore } from '../store/useBusinessStore';
import { useCatalogStore } from '../store/useCatalogStore';
import { useToast } from '../contexts/ToastContext';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemLabel?: string; // Opcional, para customizar o texto
}

const AddItemModal = ({ isOpen, onClose }: AddItemModalProps) => {
  const { config } = useBusinessStore();
  const { addItemToCatalog } = useCatalogStore();
  const { addToast } = useToast();

  // Form State Base
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<BusinessType>(config.businessTypes[0]);

  // Campos Específicos (Polimórficos)
  const [capacity, setCapacity] = useState(''); // Hotel
  const [duration, setDuration] = useState(''); // Serviços
  const [stock, setStock] = useState('');       // Varejo/Ingressos

  // Atualiza o tipo selecionado se a config mudar
  useEffect(() => {
    if (config.businessTypes.length > 0) {
      setSelectedType(config.businessTypes[0]);
    }
  }, [config.businessTypes]);

  const handleSubmit = () => {
    if (!name || !price || !category) {
      addToast('Preencha os campos obrigatórios', 'error');
      return;
    }

    const newItem: CatalogItem = {
      id: Date.now().toString(),
      name,
      price: parseFloat(price),
      category,
      description,
      image: `https://source.unsplash.com/random/800x600/?${category},${selectedType}`, // Tenta pegar imagem relevante
      available: true,
      type: selectedType,
      // Adiciona campos específicos apenas se preenchidos e relevantes
      ...(selectedType === 'hotel' && capacity ? { capacity: parseInt(capacity) } : {}),
      ...(selectedType === 'scheduling' && duration ? { duration: parseInt(duration) } : {}),
      ...((selectedType === 'tickets' || selectedType === 'ecommerce') && stock ? { stock: parseInt(stock) } : {}),
    };

    addItemToCatalog(newItem);
    addToast(`${name} adicionado ao catálogo!`, 'success');

    // Reset form
    setName('');
    setPrice('');
    setCategory('');
    setDescription('');
    setCapacity('');
    setDuration('');
    setStock('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-950">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Adicionar Novo Item</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Preencha os dados para cadastrar no catálogo.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">

            {/* Seletor de Tipo (Aparece apenas se houver > 1 tipo configurado) */}
            {config.businessTypes.length > 1 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2">Segmento do Item</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as BusinessType)}
                    className="w-full pl-9 pr-4 py-2.5 border border-blue-200 dark:border-blue-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-zinc-900 text-sm font-medium text-gray-700 dark:text-zinc-200"
                  >
                    {config.businessTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'hotel' ? 'Acomodação (Hotelaria)' :
                          type === 'tickets' ? 'Ingresso (Eventos)' :
                            type === 'reservation' ? 'Item de Menu (Restaurante)' :
                              type === 'scheduling' ? 'Serviço (Agendamento)' :
                                'Produto (Varejo)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div className="flex justify-center">
              <div className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-zinc-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
                <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-full group-hover:bg-white dark:group-hover:bg-zinc-700 transition-colors mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">Clique para enviar imagem</span>
              </div>
            </div>

            {/* Basic Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Nome do Item</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500"
                  placeholder={selectedType === 'hotel' ? "Ex: Suíte Master" : "Ex: Hamburguer Artesanal"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Preço (R$)</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500"
                      placeholder="0,00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Categoria</label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500"
                      placeholder="Ex: Premium"
                    />
                  </div>
                </div>
              </div>

              {/* Campos Condicionais (A Mágica Polimórfica) */}
              <AnimatePresence mode='wait'>
                {selectedType === 'hotel' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-700"
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Capacidade Máxima</label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500"
                        placeholder="Ex: 4 Pessoas"
                      />
                    </div>
                  </motion.div>
                )}

                {selectedType === 'scheduling' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-700"
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Duração do Serviço (min)</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500"
                        placeholder="Ex: 60 minutos"
                      />
                    </div>
                  </motion.div>
                )}

                {(selectedType === 'tickets' || selectedType === 'ecommerce') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-700"
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Estoque Inicial</label>
                    <div className="relative">
                      <Layers className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500"
                        placeholder="Ex: 100 unidades"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Descrição Detalhada</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500"
                  placeholder="Descreva os detalhes, regras ou ingredientes..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2.5 text-gray-600 dark:text-zinc-400 font-medium hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSubmit} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Salvar Item
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddItemModal;
