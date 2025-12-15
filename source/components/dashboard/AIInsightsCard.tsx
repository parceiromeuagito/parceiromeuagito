import { useMemo, useState } from "react";
import { useOrderStore } from "@/store/useOrderStore";
import { AIInsightsService } from "@/services/aiInsights";
import PremiumFeature from "@/components/PremiumFeature";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Wand2,
} from "lucide-react";
import { CreativeStudioModal } from "@/components/marketing/CreativeStudioModal";
import { InsightType } from "@/services/creativeAI";

export function AIInsightsCard() {
  const { orders } = useOrderStore();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [selectedInsightType, setSelectedInsightType] =
    useState<InsightType>("rainy_day");

  const insights = useMemo(() => {
    // Agrupar vendas por dia (últimos 7 dias)
    // Mockando dados históricos para demonstração se não houver pedidos suficientes
    let dailyRevenue: number[] = [];

    if (orders.length < 5) {
      // Mock data para demonstração inicial
      dailyRevenue = [1200, 1350, 1100, 1500, 1800, 1600, 1900];
    } else {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toDateString();
      });

      dailyRevenue = last7Days.map((dateStr) => {
        return orders
          .filter((o) => new Date(o.createdAt).toDateString() === dateStr)
          .reduce((sum, o) => sum + o.total, 0);
      });
    }

    const prediction = AIInsightsService.predictDemand(dailyRevenue);
    const optimizations = AIInsightsService.generateOptimizations(orders);

    return { prediction, optimizations };
  }, [orders]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <PremiumFeature
      minPlan="enterprise"
      fallback={
        <Card className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-gray-600 dark:text-zinc-400">
              <Sparkles className="w-5 h-5" />
              IA Insights &amp; Previsões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-full">
                <Sparkles className="w-6 h-6 text-gray-400 dark:text-zinc-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Desbloqueie a Inteligência Artificial
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-500 max-w-xs mx-auto mt-1">
                  Receba previsões de vendas e dicas de otimização exclusivas no
                  plano Enterprise.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      }
    >
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-900/80 border-gray-200 dark:border-zinc-800 shadow-lg shadow-purple-100/20 dark:shadow-purple-900/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              IA Insights
            </div>
            <Badge
              variant="outline"
              className="border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10"
            >
              Beta
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Previsão */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                Previsão para Hoje
              </p>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(insights.prediction.prediction)}
              </div>
            </div>
          </div>

          {/* Sugestões */}
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <h4 className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
              Sugestões de Otimização
            </h4>
            <ul className="space-y-2">
              {insights.optimizations.map((opt, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between bg-gray-100 dark:bg-zinc-800/30 p-2 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-500 shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-zinc-400">
                      {opt}
                    </span>
                  </div>
                  {/* Botão de Ação Criativa (Simulado: sempre abre rainy_day por enquanto para demo) */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] text-purple-700 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/10"
                    onClick={() => {
                      setSelectedInsightType("rainy_day"); // Demo
                      setIsStudioOpen(true);
                    }}
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Criar Ação
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <CreativeStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        insightType={selectedInsightType}
      />
    </PremiumFeature>
  );
}
