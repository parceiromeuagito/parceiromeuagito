import ReactECharts from "echarts-for-react";
import {
  Users,
  Clock,
  DollarSign,
  Activity,
  CalendarCheck,
  BedDouble,
  Layers,
  Download,
  FileText,
  Ticket,
  UtensilsCrossed,
  Truck,
  LucideIcon,
} from "lucide-react";
import { formatCurrency } from "../lib/utils";
import {
  useBusinessStore,
  getBusinessContext,
} from "../store/useBusinessStore";
import { useOrderStore } from "../store/useOrderStore";
import { motion } from "framer-motion";
import PremiumFeature from "../components/PremiumFeature";
import { useToast } from "../contexts/ToastContext";
import { AIInsightsCard } from "../components/dashboard/AIInsightsCard";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
}: StatCardProps) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-zinc-800 text-white`}>
        <Icon className="w-6 h-6 text-primary" />
      </div>
      {trend && (
        <span
          className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${Number(trend) > 0 ? "text-green-400 bg-green-900/20" : "text-red-400 bg-red-900/20"}`}
        >
          {Number(trend) > 0 ? "+" : ""}
          {trend}%
        </span>
      )}
    </div>
    <h3 className="text-zinc-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    <p className="text-xs text-zinc-500 mt-2 font-medium">{subtext}</p>
  </motion.div>
);

import { DashboardSkeleton } from "../components/skeletons/DashboardSkeleton";
import { useState, useEffect, useMemo } from "react";

import { useOrder } from "../contexts/OrderContext";
import { ServiceDashboardCard } from "../components/dashboard/ServiceDashboardCard";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";

const Dashboard = () => {
  const { config } = useBusinessStore();
  const { orders } = useOrderStore();
  const { services } = useOrder(); // Usando contexto para pegar serviços
  const context = getBusinessContext(config.businessTypes, config);
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating initial load
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => o.status !== "cancelled" && o.status !== "rejected")
      .reduce((acc, order) => acc + order.total, 0);

    const active = orders.filter((o) =>
      ["pending", "preparing", "accepted", "ready", "delivering"].includes(
        o.status,
      ),
    ).length;
    const completed = orders.filter((o) => o.status === "completed").length;

    return { revenue, active, completed };
  }, [orders]);

  const MainIcon = useMemo(() => {
    return config.businessTypes.length > 1
      ? Layers
      : config.primaryType === "hotel"
        ? BedDouble
        : config.primaryType === "scheduling"
          ? CalendarCheck
          : config.primaryType === "tickets"
            ? Ticket
            : config.primaryType === "reservation"
              ? UtensilsCrossed
              : config.primaryType === "delivery"
                ? Truck
                : Users;
  }, [config.businessTypes, config.primaryType]);

  const chartOption = useMemo(
    () => ({
      color: ["#f97316", "#10b981"], // Orange primary
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(24, 24, 27, 0.9)",
        borderColor: "#27272a",
        textStyle: { color: "#e4e4e7" },
      },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#71717a", margin: 15 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { type: "dashed", color: "#27272a" } },
        axisLabel: { color: "#71717a" },
      },
      series: [
        {
          name: "Receita",
          type: "line",
          smooth: true,
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(249, 115, 22, 0.2)" },
                { offset: 1, color: "rgba(249, 115, 22, 0)" },
              ],
            },
          },
          showSymbol: false,
          data: [
            1200,
            1320,
            1010,
            1340,
            2900,
            3300,
            stats.revenue > 4000 ? stats.revenue : 3100,
          ],
        },
      ],
    }),
    [stats.revenue],
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const handleExport = (type: "csv" | "pdf") => {
    addToast(`Relatório ${type.toUpperCase()} gerado com sucesso!`, "success");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Visão Geral</h2>
          <p className="text-zinc-400">
            Acompanhe o desempenho do seu {context.label.toLowerCase()}.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>

          <PremiumFeature
            minPlan="pro"
            fallback={
              <button
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-500 rounded-lg text-sm font-medium cursor-not-allowed"
                title="Requer Plano Pro"
              >
                <FileText className="w-4 h-4" />
                PDF Detalhado
              </button>
            }
          >
            <button
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <FileText className="w-4 h-4" />
              PDF Detalhado
            </button>
          </PremiumFeature>
        </div>
      </div>

      {/* AI Insights - Top Priority */}
      <AIInsightsCard />

      {/* Service Dashboards (T27) */}
      {services.some((s) => s.enabled) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services
            .filter((s) => s.enabled)
            .map((service) => (
              <ServiceDashboardCard key={service.id} service={service} />
            ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receita Total"
          value={formatCurrency(stats.revenue)}
          subtext="Acumulado"
          icon={DollarSign}
          trend="12.5"
          color="bg-emerald-500"
        />
        <StatCard
          title={context.metrics[0]}
          value={orders.length}
          subtext="Total acumulado"
          icon={MainIcon}
          trend="8.2"
          color="bg-primary"
        />
        <StatCard
          title="Em Andamento"
          value={stats.active}
          subtext="Necessitam atenção"
          icon={Activity}
          color="bg-amber-500"
        />
        <StatCard
          title="Concluídos"
          value={stats.completed}
          subtext="Finalizados com sucesso"
          icon={Clock}
          trend="5.1"
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Análise de Desempenho
                </h3>
                <p className="text-sm text-zinc-500">Receita x Período</p>
              </div>
              <div className="flex gap-2">
                {["Dia", "Semana", "Mês"].map((period) => (
                  <button
                    key={period}
                    className="px-3 py-1 text-xs font-medium rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <ReactECharts option={chartOption} style={{ height: "350px" }} />
          </div>
        </div>

        {/* Live Feed / Recent Activity */}
        <ActivityFeed />
      </div>
    </div>
  );
};

export default Dashboard;
