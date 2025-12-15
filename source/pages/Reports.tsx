import { useState } from "react";
import ReactECharts from "echarts-for-react";
import { useOrderStore } from "../store/useOrderStore";
import { useCashRegisterStore } from "../store/useCashRegisterStore";
import { formatCurrency, formatDate } from "../lib/utils";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Download,
} from "lucide-react";
import PremiumFeature from "../components/PremiumFeature";

const Reports = () => {
  const { orders } = useOrderStore();
  const { cashRegister } = useCashRegisterStore();
  const [activeTab, setActiveTab] = useState<"sales" | "cash" | "products">(
    "sales",
  );

  // --- DADOS PARA RELATÓRIOS ---

  // 1. Vendas por Método de Pagamento
  const salesByMethod = orders.reduce(
    (acc, order) => {
      acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.total;
      return acc;
    },
    {} as Record<string, number>,
  );

  const paymentChartOption = {
    tooltip: { trigger: "item" },
    legend: { bottom: "0%" },
    series: [
      {
        name: "Método de Pagamento",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
        label: { show: false },
        data: [
          { value: salesByMethod["credit_card"] || 0, name: "Crédito" },
          { value: salesByMethod["debit_card"] || 0, name: "Débito" },
          { value: salesByMethod["pix"] || 0, name: "PIX" },
          { value: salesByMethod["cash"] || 0, name: "Dinheiro" },
        ],
      },
    ],
  };

  // 2. Vendas por Dia (Simulado com base nos pedidos existentes)
  const salesByDay = orders.reduce(
    (acc, order) => {
      const day = formatDate(new Date(order.createdAt)).split(" ")[0]; // DD/MM/YYYY
      acc[day] = (acc[day] || 0) + order.total;
      return acc;
    },
    {} as Record<string, number>,
  );

  const salesTrendOption = {
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: Object.keys(salesByDay) },
    yAxis: { type: "value" },
    series: [
      {
        data: Object.values(salesByDay),
        type: "bar",
        itemStyle: { color: "#3b82f6", borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  // 3. Movimentações de Caixa (Tabela)
  const cashTransactions = [...cashRegister.transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Relatórios Gerenciais
          </h2>
          <p className="text-gray-500">
            Análise detalhada de vendas, financeiro e estoque.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "sales" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
          >
            Vendas
          </button>
          <button
            onClick={() => setActiveTab("cash")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "cash" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
          >
            Caixa Diário
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "products" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
          >
            Produtos
          </button>
        </div>
      </div>

      <PremiumFeature
        minPlan="pro"
        fallback={
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">
              Relatórios Avançados
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Tenha acesso a métricas detalhadas, relatórios de caixa e análise
              de produtos com o plano PRO.
            </p>
            <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90">
              Fazer Upgrade Agora
            </button>
          </div>
        }
      >
        {/* TAB: VENDAS */}
        {activeTab === "sales" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Evolução de Vendas
              </h3>
              <ReactECharts
                option={salesTrendOption}
                style={{ height: "300px" }}
              />
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Métodos de Pagamento
              </h3>
              <ReactECharts
                option={paymentChartOption}
                style={{ height: "300px" }}
              />
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">Últimos Pedidos</h3>
                <button className="text-sm text-primary font-bold hover:underline">
                  Ver Todos
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500">
                      <th className="pb-3 font-medium">ID</th>
                      <th className="pb-3 font-medium">Data</th>
                      <th className="pb-3 font-medium">Cliente</th>
                      <th className="pb-3 font-medium">Pagamento</th>
                      <th className="pb-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                      >
                        <td className="py-3 font-mono text-gray-600">
                          {order.id}
                        </td>
                        <td className="py-3 text-gray-600">
                          {formatDate(new Date(order.createdAt))}
                        </td>
                        <td className="py-3 font-medium text-gray-900">
                          {order.customerName}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600 uppercase">
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CAIXA */}
        {activeTab === "cash" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Saldo Atual</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {formatCurrency(cashRegister.currentBalance)}
                </h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">
                  Entradas (Vendas + Suprimentos)
                </p>
                <h3 className="text-3xl font-bold text-green-600">
                  {formatCurrency(
                    cashTransactions
                      .filter((t) => t.type === "sale" || t.type === "supply")
                      .reduce((acc, t) => acc + t.amount, 0),
                  )}
                </h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Saídas (Sangrias)</p>
                <h3 className="text-3xl font-bold text-red-600">
                  {formatCurrency(
                    cashTransactions
                      .filter((t) => t.type === "bleed")
                      .reduce((acc, t) => acc + t.amount, 0),
                  )}
                </h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  Extrato de Movimentações
                </h3>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200">
                  <Download className="w-4 h-4" /> Exportar
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500">
                      <th className="px-4 py-3 font-medium rounded-l-lg">
                        Data/Hora
                      </th>
                      <th className="px-4 py-3 font-medium">Tipo</th>
                      <th className="px-4 py-3 font-medium">Descrição</th>
                      <th className="px-4 py-3 font-medium">Operador</th>
                      <th className="px-4 py-3 font-medium text-right rounded-r-lg">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashTransactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-gray-400"
                        >
                          Nenhuma movimentação registrada.
                        </td>
                      </tr>
                    ) : (
                      cashTransactions.map((t) => (
                        <tr
                          key={t.id}
                          className="border-b border-gray-50 hover:bg-gray-50/50"
                        >
                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(new Date(t.timestamp))}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                t.type === "sale"
                                  ? "bg-green-100 text-green-700"
                                  : t.type === "bleed"
                                    ? "bg-red-100 text-red-700"
                                    : t.type === "supply"
                                      ? "bg-primary/20 text-primary"
                                      : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {t.type === "opening"
                                ? "Abertura"
                                : t.type === "closing"
                                  ? "Fechamento"
                                  : t.type === "sale"
                                    ? "Venda"
                                    : t.type === "bleed"
                                      ? "Sangria"
                                      : "Suprimento"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {t.description}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{t.user}</td>
                          <td
                            className={`px-4 py-3 text-right font-bold ${
                              t.type === "bleed" || t.type === "closing"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {t.type === "bleed" || t.type === "closing"
                              ? "-"
                              : "+"}
                            {formatCurrency(t.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PRODUTOS */}
        {activeTab === "products" && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
              Desempenho de Produtos
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Baseado nos pedidos realizados.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="pb-3 font-medium">Produto</th>
                    <th className="pb-3 font-medium text-center">
                      Qtd. Vendida
                    </th>
                    <th className="pb-3 font-medium text-right">
                      Receita Gerada
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const productStats = orders.reduce(
                      (acc, order) => {
                        if (
                          order.status === "cancelled" ||
                          order.status === "rejected"
                        )
                          return acc;
                        order.items.forEach((item) => {
                          if (!acc[item.name]) {
                            acc[item.name] = { quantity: 0, revenue: 0 };
                          }
                          acc[item.name].quantity += item.quantity;
                          acc[item.name].revenue += item.price * item.quantity;
                        });
                        return acc;
                      },
                      {} as Record<
                        string,
                        { quantity: number; revenue: number }
                      >,
                    );

                    const sortedProducts = Object.entries(productStats)
                      .sort(([, a], [, b]) => b.revenue - a.revenue)
                      .slice(0, 10); // Top 10

                    if (sortedProducts.length === 0) {
                      return (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-8 text-center text-gray-400"
                          >
                            Nenhum dado de vendas disponível.
                          </td>
                        </tr>
                      );
                    }

                    return sortedProducts.map(([name, stats]) => (
                      <tr
                        key={name}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="py-3 font-medium text-gray-900">
                          {name}
                        </td>
                        <td className="py-3 text-center">{stats.quantity}</td>
                        <td className="py-3 text-right font-bold">
                          {formatCurrency(stats.revenue)}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PremiumFeature>
    </div>
  );
};

export default Reports;
