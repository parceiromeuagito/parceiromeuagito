import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown, ArrowUp, Lock, Unlock, History, AlertTriangle, Printer } from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { useCashRegisterStore } from '../store/useCashRegisterStore';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { printCashReport } from '../lib/printer';

interface CashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CashRegisterModal = ({ isOpen, onClose }: CashRegisterModalProps) => {
  const { config, user } = useBusinessStore();
  const { cashRegister, openRegister, closeRegister, addCashTransaction } = useCashRegisterStore();
  const { addToast } = useToast();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [action, setAction] = useState<'open' | 'supply' | 'bleed' | 'close' | 'view'>('view');

  const handlePrintReport = () => {
    try {
      printCashReport(cashRegister, config.printer);
      addToast('Relatório enviado para impressora', 'success');
    } catch (_e) {
      addToast('Erro ao imprimir relatório', 'error');
    }
  };

  const handleAction = () => {
    const val = parseFloat(amount);
    const userName = user?.name || 'Operador';

    if (action !== 'close' && (!val || val <= 0)) {
      addToast('Informe um valor válido', 'error');
      return;
    }

    switch (action) {
      case 'open':
        openRegister(val, userName);
        addToast('Caixa aberto com sucesso!', 'success');
        break;
      case 'supply':
        addCashTransaction('supply', val, description || 'Suprimento de Caixa', userName);
        addToast('Suprimento registrado', 'success');
        break;
      case 'bleed':
        if (val > cashRegister.currentBalance) {
          addToast('Saldo insuficiente para sangria', 'error');
          return;
        }
        addCashTransaction('bleed', val, description || 'Sangria de Caixa', userName);
        addToast('Sangria registrada', 'success');
        break;
      case 'close':
        closeRegister(userName);
        addToast('Caixa fechado. Relatório gerado.', 'success');
        // Sugere impressão ao fechar
        setTimeout(() => {
          if (window.confirm("Deseja imprimir o relatório de fechamento agora?")) {
            printCashReport(cashRegister, config.printer);
          }
        }, 500);
        break;
    }

    setAmount('');
    setDescription('');
    setAction('view');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center ${cashRegister.isOpen ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <div>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${cashRegister.isOpen ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                {cashRegister.isOpen ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                Frente de Caixa
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {cashRegister.isOpen
                  ? `Aberto em ${formatDate(new Date(cashRegister.openedAt!))}`
                  : 'Caixa Fechado - Inicie o turno para vender'}
              </p>
            </div>
            <div className="flex gap-2">
              {/* Botão de Impressão (Visível sempre que houver dados) */}
              {(cashRegister.isOpen || cashRegister.transactions.length > 0) && (
                <button
                  onClick={handlePrintReport}
                  className="p-2 bg-white dark:bg-zinc-800 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 transition-colors"
                  title="Imprimir Relatório"
                >
                  <Printer className="w-5 h-5" />
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

            {/* Status Card */}
            <div className="bg-gray-900 dark:bg-zinc-950 text-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-800 dark:border-zinc-800">
              <p className="text-gray-400 text-sm font-medium mb-1">Saldo em Caixa</p>
              <h2 className="text-4xl font-bold tracking-tight">{formatCurrency(cashRegister.currentBalance)}</h2>
              <div className="flex gap-4 mt-4 text-sm">
                <div className="bg-white/10 px-3 py-1 rounded-lg">
                  <span className="text-gray-400 block text-xs">Fundo Inicial</span>
                  <span className="font-bold">{formatCurrency(cashRegister.startAmount)}</span>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-lg">
                  <span className="text-gray-400 block text-xs">Vendas (Dinheiro)</span>
                  <span className="font-bold text-green-400">
                    {formatCurrency(cashRegister.transactions.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Grid */}
            {cashRegister.isOpen ? (
              <div className="grid grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => setAction('supply')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${action === 'supply' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-100 dark:border-zinc-800 hover:border-green-200 dark:hover:border-green-900/50 hover:bg-green-50/50 dark:hover:bg-green-900/10 text-gray-600 dark:text-zinc-400'}`}
                >
                  <ArrowUp className="w-6 h-6 text-green-500" />
                  <span className="font-bold text-sm">Suprimento</span>
                </button>
                <button
                  onClick={() => setAction('bleed')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${action === 'bleed' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-gray-100 dark:border-zinc-800 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50/50 dark:hover:bg-red-900/10 text-gray-600 dark:text-zinc-400'}`}
                >
                  <ArrowDown className="w-6 h-6 text-red-500" />
                  <span className="font-bold text-sm">Sangria</span>
                </button>
                <button
                  onClick={() => setAction('close')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${action === 'close' ? 'border-gray-800 dark:border-zinc-700 bg-gray-800 dark:bg-zinc-800 text-white' : 'border-gray-100 dark:border-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400'}`}
                >
                  <Lock className="w-6 h-6" />
                  <span className="font-bold text-sm">Fechar Caixa</span>
                </button>
              </div>
            ) : (
              <div className="mb-8">
                <button
                  onClick={() => setAction('open')}
                  className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <Unlock className="w-5 h-5" />
                  Abrir Caixa
                </button>
              </div>
            )}

            {/* Action Form */}
            {action !== 'view' && action !== 'close' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 mb-8"
              >
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                  {action === 'open' ? 'Abertura de Caixa' : action === 'supply' ? 'Registrar Suprimento' : 'Registrar Sangria'}
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500"
                      placeholder="0.00"
                    />
                  </div>
                  {action !== 'open' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">Motivo / Descrição</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500"
                        placeholder="Ex: Pagamento Fornecedor"
                      />
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setAction('view')} className="flex-1 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700">Cancelar</button>
                    <button onClick={handleAction} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">Confirmar</button>
                  </div>
                </div>
              </motion.div>
            )}

            {action === 'close' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20 mb-8"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-900 dark:text-red-400 mb-1">Confirmar Fechamento?</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Isso encerrará o turno atual e gerará o relatório Z. O saldo final esperado é de <strong>{formatCurrency(cashRegister.currentBalance)}</strong>.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setAction('view')} className="px-4 py-2 bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-900/30 rounded-lg text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10">Cancelar</button>
                      <button onClick={handleAction} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">Fechar Caixa</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* History */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                Movimentações do Turno
              </h4>
              <div className="space-y-2">
                {cashRegister.transactions.length === 0 ? (
                  <p className="text-center text-gray-400 dark:text-zinc-500 text-sm py-4">Nenhuma movimentação registrada.</p>
                ) : (
                  cashRegister.transactions.map((t) => (
                    <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-100 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${t.type === 'sale' || t.type === 'supply' || t.type === 'opening' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{t.description}</p>
                          <p className="text-xs text-gray-400 dark:text-zinc-500">{formatDate(new Date(t.timestamp))}</p>
                        </div>
                      </div>
                      <span className={`font-mono font-bold text-sm ${t.type === 'sale' || t.type === 'supply' || t.type === 'opening' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                        {t.type === 'bleed' || t.type === 'closing' ? '-' : '+'}{formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CashRegisterModal;
