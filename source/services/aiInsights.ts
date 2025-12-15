import { SimpleLinearRegression } from 'ml-regression';
import { mean, standardDeviation } from 'simple-statistics';
import type { Order } from '@/types';

export type TimeRange = '7d' | '30d';

export interface InsightAction {
    label: string;
    type: 'discount' | 'stock' | 'staff' | 'marketing';
    payload?: Record<string, unknown>;
}

export interface OptimizationSuggestion {
    id: string;
    message: string;
    type: 'opportunity' | 'warning' | 'info';
    action?: InsightAction;
}

// Mock de Calendário Externo (Simulado - para uso futuro)
const _EXTERNAL_CONTEXT = {
    weather: { nextWeekend: 'rainy', temp: 18 },
    holidays: [
        { name: 'Dia dos Namorados', daysUntil: 12 },
        { name: 'Feriado Municipal', daysUntil: 3 }
    ],
    events: [
        { name: 'Show no Estádio', daysUntil: 5, impact: 'high' }
    ]
};

export class AIInsightsService {
    static predictDemand(historicalData: number[]): {
        prediction: number;
        confidence: number;
        trend: 'up' | 'down' | 'stable';
    } {
        if (historicalData.length < 3) {
            return { prediction: 0, confidence: 0, trend: 'stable' };
        }

        const x = historicalData.map((_, i) => i);
        const y = historicalData;

        const regression = new SimpleLinearRegression(x, y);
        const nextValue = regression.predict(historicalData.length);

        const avg = mean(historicalData);
        const stdDev = standardDeviation(historicalData);
        // Confiança baseada na variabilidade dos dados (menor desvio = maior confiança)
        const cv = stdDev / (avg || 1); // Coeficiente de variação
        const confidence = Math.max(0, Math.min(100, (1 - cv) * 100));

        const slope = regression.slope;
        const trend = slope > (avg * 0.05) ? 'up' :
            slope < -(avg * 0.05) ? 'down' : 'stable';

        return {
            prediction: Math.max(0, Math.round(nextValue)),
            confidence: Math.round(confidence),
            trend
        };
    }

    static generateOptimizations(orders: Order[]): string[] {
        const suggestions: string[] = [];

        if (orders.length === 0) return ['Comece a vender para receber insights!'];

        // 1. Análise de horários de pico
        const hourlyOrders = this.groupByHour(orders);
        const peakHourEntry = Object.entries(hourlyOrders)
            .sort(([, a], [, b]) => b - a)[0];

        if (peakHourEntry) {
            const peakHour = parseInt(peakHourEntry[0]);
            suggestions.push(`Horário de pico detectado às ${peakHour}h. Considere reforçar a equipe neste horário.`);
        }

        // 2. Análise de produtos populares (Mockado por enquanto pois PartnerOrder não tem itens detalhados acessíveis facilmente aqui sem o Menu)
        // Vamos usar o total do pedido como proxy para "Ticket Médio"
        const avgTicket = mean(orders.map(o => o.total));
        if (avgTicket < 50) {
            suggestions.push('Seu ticket médio está abaixo de R$ 50. Crie combos para aumentar o valor por pedido.');
        } else if (avgTicket > 150) {
            suggestions.push('Ticket médio alto! Ofereça programas de fidelidade para reter esses clientes VIP.');
        }

        // 3. Análise de tempo de preparo (Simulado, pois não temos histórico de status detalhado ainda)
        // Se tivermos muitos pedidos cancelados
        const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
        if (cancelledCount > orders.length * 0.1) {
            suggestions.push(`Taxa de cancelamento alta (${cancelledCount} pedidos). Verifique seu estoque e tempo de resposta.`);
        }

        return suggestions;
    }

    private static groupByHour(orders: Order[]): Record<number, number> {
        return orders.reduce((acc, order) => {
            const hour = new Date(order.createdAt).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);
    }
}
