import React, { useState } from 'react';
import { formatCurrency } from '../lib/utils';
import {
  Edit2, Trash2, Plus, Search,
  Bed, Tag, Package, Clock, Briefcase
} from 'lucide-react';
import { useBusinessStore, getBusinessContext } from '../store/useBusinessStore';
import { useCatalogStore } from '../store/useCatalogStore';
import { motion, AnimatePresence } from 'framer-motion';
import AddItemModal from '../components/AddItemModal';

const Menu = () => {
  const { config } = useBusinessStore();
  const { catalog, removeItemFromCatalog, updateItemStock } = useCatalogStore();
  const context = getBusinessContext(config.businessTypes, config);

  const [filter, setFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const categories = ['Todos', ...Array.from(new Set(catalog.map(p => p.category)))];

  const filteredItems = catalog.filter(item => {
    const matchesCategory = filter === 'Todos' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Ícone dinâmico baseado no tipo do item (não mais global)
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'hotel': return Bed;
      case 'tickets': return Tag;
      case 'scheduling': return Clock;
      default: return Package;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciar {context.itemLabel}s</h2>
          <p className="text-zinc-400">Adicione, edite ou remova itens do seu catálogo.</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-medium hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo {context.itemLabel}
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === cat
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-transparent'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder={`Buscar...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border-transparent focus:bg-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm text-white placeholder-zinc-500 transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <AnimatePresence mode='popLayout'>
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhum item encontrado</h3>
              <p className="text-zinc-500 max-w-md">
                Não encontramos nada com os filtros atuais. Tente buscar por outro termo ou adicione um novo item.
              </p>
            </motion.div>
          ) : (
            filteredItems.map((item) => {
              const TypeIcon = getItemIcon(item.type);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id}
                  className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden group hover:shadow-xl hover:border-zinc-700 transition-all duration-300"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <button className="p-2 bg-zinc-900/90 backdrop-blur-sm rounded-lg shadow-sm text-zinc-300 hover:text-primary hover:bg-zinc-800 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const qtd = prompt('Quantidade a adicionar ao estoque:', '10');
                          if (qtd && !isNaN(Number(qtd))) {
                            updateItemStock(item.id, Number(qtd));
                            alert(`Estoque atualizado! (+${qtd})`);
                          }
                        }}
                        className="p-2 bg-zinc-900/90 backdrop-blur-sm rounded-lg shadow-sm text-zinc-300 hover:text-green-400 hover:bg-zinc-800 transition-colors"
                        title="Repor Estoque"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItemFromCatalog(item.id)}
                        className="p-2 bg-zinc-900/90 backdrop-blur-sm rounded-lg shadow-sm text-zinc-300 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="absolute top-3 left-3">
                      <span className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase rounded-md border border-white/10">
                        <TypeIcon className="w-3 h-3" />
                        {item.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-lg mb-1 line-clamp-1" title={item.name}>
                      {item.name}
                    </h3>

                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-xl font-bold text-zinc-200">{formatCurrency(item.price)}</span>
                      {item.type === 'hotel' && <span className="text-xs text-zinc-500">/ noite</span>}
                    </div>

                    <p className="text-sm text-zinc-400 line-clamp-2 h-10 mb-4 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-4 border-t border-zinc-800 flex items-center gap-4 text-xs text-zinc-500 font-medium">
                      {item.type === 'hotel' && item.capacity && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4 text-zinc-600" />
                          {item.capacity} Pessoas
                        </div>
                      )}
                      {item.type === 'scheduling' && item.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-zinc-600" />
                          {item.duration} min
                        </div>
                      )}
                      <div className={`ml-auto flex items-center gap-1.5 ${item.available ? 'text-green-400' : 'text-red-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {item.available ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Menu;
