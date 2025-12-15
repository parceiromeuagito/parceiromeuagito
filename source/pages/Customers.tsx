import { useState } from 'react';
import { useCustomerStore } from '../store/useCustomerStore';
import { formatCurrency, formatDate } from '../lib/utils';
import { Search, User, Phone, Mail, Star, MoreHorizontal, Filter } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

const Customers = () => {
  const { customers } = useCustomerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, _setFilter] = useState<'all' | 'vip' | 'active'>('all');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
    const matchesFilter = filter === 'all' ||
      (filter === 'vip' && c.totalSpent > 1000) ||
      (filter === 'active' && c.status === 'active');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestão de Clientes</h2>
          <p className="text-zinc-400">Visualize o histórico e gerencie o relacionamento com seus clientes.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm text-white placeholder-zinc-500"
            />
          </div>
          <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Contato</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-center">Pedidos</th>
                <th className="px-6 py-4 font-medium">Total Gasto</th>
                <th className="px-6 py-4 font-medium">Última Compra</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12">
                    <div className="flex justify-center">
                      <EmptyState
                        icon={<User className="w-8 h-8" />}
                        title="Nenhum cliente encontrado"
                        description={searchTerm
                          ? `Não encontramos clientes correspondentes a "${searchTerm}".`
                          : "Sua base de clientes aparecerá aqui."
                        }
                      />
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={customer.avatar || `https://ui-avatars.com/api/?name=${customer.name}&background=random`}
                          alt={customer.name}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                        />
                        <div>
                          <p className="font-bold text-white">{customer.name}</p>
                          {customer.totalSpent > 1000 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-900/20 px-1.5 py-0.5 rounded mt-0.5 border border-amber-900/30">
                              <Star className="w-3 h-3 fill-current" /> VIP
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3" /> {customer.phone}
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3" /> {customer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${customer.status === 'active' ? 'bg-green-900/20 text-green-400 border border-green-900/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-zinc-300">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {formatDate(new Date(customer.lastOrderDate)).split(' ')[0]}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
