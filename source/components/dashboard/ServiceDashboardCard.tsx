import { useMemo } from 'react';
import { useOrder, ServiceConfig } from '../../contexts/OrderContext';
import { formatCurrency } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Package, Calendar, Utensils, BedDouble, Ticket, ShoppingBag, Zap } from 'lucide-react';
import { getServiceColor } from '../../lib/colors';
import { BusinessType } from '../../types';

export function ServiceDashboardCard({ service }: { service: ServiceConfig }) {
    const { orders } = useOrder();

    const stats = useMemo(() => {
        const serviceOrders = orders.filter(o => o.type === service.id);
        return {
            total: serviceOrders.length,
            pending: serviceOrders.filter(o => o.status === 'pending').length,
            accepted: serviceOrders.filter(o => o.status === 'accepted').length,
            revenue: serviceOrders.reduce((sum, o) => sum + o.total, 0)
        };
    }, [orders, service.id]);

    const colors = getServiceColor(service.id as BusinessType);

    const getIcon = (type: string) => {
        switch (type) {
            case 'delivery': return <ShoppingBag className={`w-5 h-5 ${colors.icon}`} />;
            case 'restaurant': return <Utensils className={`w-5 h-5 ${colors.icon}`} />;
            case 'hotel': return <BedDouble className={`w-5 h-5 ${colors.icon}`} />;
            case 'tickets': return <Ticket className={`w-5 h-5 ${colors.icon}`} />;
            case 'appointments': return <Calendar className={`w-5 h-5 ${colors.icon}`} />;
            default: return <Package className={`w-5 h-5 ${colors.icon}`} />;
        }
    };

    return (
        <Card className={`border-l-4 ${colors.border.replace('border', 'border-l')} bg-zinc-900/50 backdrop-blur-sm border-zinc-800 overflow-hidden relative group`}>
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150`}>
                {getIcon(service.id)}
            </div>
            <CardHeader className="pb-2 relative z-10">
                <div className="flex justify-between items-start">
                    <CardTitle className={`flex items-center gap-2 text-lg text-zinc-100`}>
                        <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                            {getIcon(service.id)}
                        </div>
                        {service.name}
                    </CardTitle>
                    {service.autoAccept && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 gap-1">
                            <Zap className="w-3 h-3 fill-current" />
                            Auto
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Total</p>
                        <p className="text-2xl font-bold text-zinc-200">{stats.total}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Pendentes</p>
                        <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Aceitos</p>
                        <p className="text-2xl font-bold text-green-500">{stats.accepted}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Receita</p>
                        <p className="text-2xl font-bold text-zinc-200">{formatCurrency(stats.revenue)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
