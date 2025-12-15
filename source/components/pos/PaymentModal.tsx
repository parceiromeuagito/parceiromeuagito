import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  DollarSign,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle,
  Trash2,
  Plus,
} from "lucide-react";
import { formatCurrency } from "../../lib/utils";
import { usePOSStore } from "../../store/usePOSStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
}

interface PartialPayment {
  id: string;
  method: "credit_card" | "debit_card" | "pix" | "cash" | "online";
  amount: number;
  installments?: number;
}

const PaymentModal = ({
  isOpen,
  onClose,
  onConfirm,
  total,
}: PaymentModalProps) => {
  const { setPaymentDetails } = usePOSStore();

  // Estado para múltiplos pagamentos
  const [payments, setPayments] = useState<PartialPayment[]>([]);

  // Estado do pagamento atual sendo adicionado
  const [currentMethod, setCurrentMethod] = useState<
    "credit_card" | "debit_card" | "pix" | "cash"
  >("cash");
  const [amountToPay, setAmountToPay] = useState<string>("");
  const [receivedAmount, setReceivedAmount] = useState<string>(""); // Apenas para cálculo de troco visual
  const [installments, setInstallments] = useState<number>(1);

  // Totais calculados
  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setPayments([]);
      setCurrentMethod("cash");
      setAmountToPay(total.toFixed(2));
      setReceivedAmount("");
      setInstallments(1);
    }
  }, [isOpen, total]);

  // Atualiza o valor sugerido quando o restante muda
  useEffect(() => {
    if (remaining > 0) {
      setAmountToPay(remaining.toFixed(2));
    } else {
      setAmountToPay("");
    }
  }, [remaining]);

  const handleAddPayment = () => {
    const val = parseFloat(amountToPay);
    if (!val || val <= 0) return;

    if (val > remaining + 0.01 && payments.length > 0) {
      // Se já tem pagamentos parciais, não deixa pagar muito a mais (exceto troco em dinheiro único)
      // Mas vamos permitir flexibilidade, o usuário gerencia.
    }

    const newPayment: PartialPayment = {
      id: Date.now().toString(),
      method: currentMethod,
      amount: val,
      installments: currentMethod === "credit_card" ? installments : undefined,
    };

    setPayments([...payments, newPayment]);

    // Reset para o próximo
    setCurrentMethod("cash");
    setInstallments(1);
    setReceivedAmount("");
  };

  const handleRemovePayment = (id: string) => {
    setPayments(payments.filter((p) => p.id !== id));
  };

  const handleConfirm = () => {
    // Se houver apenas um pagamento, mantém compatibilidade simples
    // Se houver múltiplos, usa o tipo 'split'

    // Caso especial: Pagamento único em dinheiro com troco
    if (payments.length === 0 && currentMethod === "cash" && receivedAmount) {
      const received = parseFloat(receivedAmount);
      const changeVal = Math.max(0, received - total);

      setPaymentDetails({
        method: "cash",
        amount: total,
        receivedAmount: received,
        change: changeVal,
      });
      onConfirm();
      return;
    }

    // Se o usuário preencheu algo mas não adicionou à lista, e é o valor total restante, adiciona automaticamente
    if (payments.length === 0 && amountToPay) {
      const val = parseFloat(amountToPay);
      if (Math.abs(val - total) < 0.01) {
        setPaymentDetails({
          method: currentMethod,
          amount: total,
          installments:
            currentMethod === "credit_card" ? installments : undefined,
        });
        onConfirm();
        return;
      }
    }

    // Fluxo de múltiplos pagamentos
    if (remaining > 0.01) {
      // Ainda falta pagar
      return;
    }

    setPaymentDetails({
      method: payments.length > 1 ? "split" : payments[0].method,
      amount: total,
      payments: payments.map((p) => ({
        method: p.method,
        amount: p.amount,
        installments: p.installments,
      })),
    });

    onConfirm();
  };

  // Cálculo de troco visual para o input atual (apenas dinheiro)
  const currentChange =
    currentMethod === "cash" && receivedAmount
      ? Math.max(0, parseFloat(receivedAmount) - parseFloat(amountToPay || "0"))
      : 0;

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
          className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[600px]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ESQUERDA: Seleção e Input */}
          <div className="flex-1 flex flex-col p-6 border-r border-gray-100 dark:border-zinc-800">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary" />
                Pagamento
              </h3>
              <p className="text-sm text-gray-500">
                Selecione o método e o valor
              </p>
            </div>

            {/* Method Selection */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { id: "cash", icon: Banknote, label: "Dinheiro" },
                { id: "credit_card", icon: CreditCard, label: "Crédito" },
                { id: "debit_card", icon: CreditCard, label: "Débito" },
                { id: "pix", icon: QrCode, label: "Pix" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setCurrentMethod(m.id as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    currentMethod === m.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
                  }`}
                >
                  <m.icon
                    className={`w-5 h-5 mb-1 ${currentMethod === m.id ? "text-primary" : "text-gray-400"}`}
                  />
                  <span className="text-[10px] font-bold">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Valor a Pagar
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    R$
                  </span>
                  <Input
                    type="number"
                    value={amountToPay}
                    onChange={(e) => setAmountToPay(e.target.value)}
                    className="pl-10 text-lg font-bold text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {currentMethod === "cash" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Valor Recebido (Troco)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      R$
                    </span>
                    <Input
                      type="number"
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(e.target.value)}
                      className="pl-10 text-lg font-bold text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  {currentChange > 0 && (
                    <p className="text-right text-green-600 font-bold mt-1">
                      Troco: {formatCurrency(currentChange)}
                    </p>
                  )}
                </div>
              )}

              {currentMethod === "credit_card" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Parcelas
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(parseInt(e.target.value))}
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 10, 12].map((i) => (
                      <option key={i} value={i}>
                        {i}x de{" "}
                        {formatCurrency((parseFloat(amountToPay) || 0) / i)} sem
                        juros
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Button
                onClick={handleAddPayment}
                disabled={!amountToPay || parseFloat(amountToPay) <= 0}
                className="w-full mt-4"
                variant="secondary"
              >
                <Plus className="w-4 h-4 mr-2" /> Adicionar Pagamento
              </Button>
            </div>
          </div>

          {/* DIREITA: Resumo e Lista */}
          <div className="w-full md:w-96 bg-gray-50 dark:bg-zinc-950 p-6 flex flex-col border-l border-gray-100 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-gray-900 dark:text-white">
                Resumo
              </h4>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total da Venda</span>
                <span className="font-bold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Pago</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(totalPaid)}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-200 dark:border-zinc-800">
                <span>Restante</span>
                <span className="text-primary">
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>

            {/* Lista de Pagamentos */}
            <div className="flex-1 overflow-y-auto custom-scrollbar mb-4">
              <h5 className="text-xs font-bold text-gray-500 uppercase mb-3">
                Pagamentos Adicionados
              </h5>
              {payments.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">
                  Nenhum pagamento adicionado
                </p>
              ) : (
                <div className="space-y-2">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-800 flex justify-between items-center shadow-sm"
                    >
                      <div>
                        <p className="font-bold text-sm flex items-center gap-2">
                          {p.method === "cash" && (
                            <Banknote className="w-3 h-3" />
                          )}
                          {p.method === "credit_card" && (
                            <CreditCard className="w-3 h-3" />
                          )}
                          {p.method === "debit_card" && (
                            <CreditCard className="w-3 h-3" />
                          )}
                          {p.method === "pix" && <QrCode className="w-3 h-3" />}
                          <span className="capitalize">
                            {p.method.replace("_", " ")}
                          </span>
                        </p>
                        {p.installments && p.installments > 1 && (
                          <p className="text-xs text-gray-500">
                            {p.installments}x parcelas
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">
                          {formatCurrency(p.amount)}
                        </span>
                        <button
                          onClick={() => handleRemovePayment(p.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
              onClick={handleConfirm}
              disabled={
                remaining > 0.01 &&
                !(
                  payments.length === 0 &&
                  currentMethod === "cash" &&
                  receivedAmount &&
                  parseFloat(receivedAmount) >= total
                )
              }
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Finalizar Venda
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;
