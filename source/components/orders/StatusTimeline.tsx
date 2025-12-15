import { StatusChange } from '../../types';
import { formatDate } from '../../lib/utils';
import { CheckCircle2, Clock, XCircle, Truck, ShoppingBag, ChefHat } from 'lucide-react';

interface StatusTimelineProps {
    history: StatusChange[];
}

export function StatusTimeline({ history }: StatusTimelineProps) {
    if (!history || history.length === 0) return null;

    // Ordenar do mais recente para o mais antigo
    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const getIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'accepted': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
            case 'preparing': return <ChefHat className="w-4 h-4 text-orange-500" />;
            case 'ready': return <ShoppingBag className="w-4 h-4 text-purple-500" />;
            case 'delivering': return <Truck className="w-4 h-4 text-indigo-500" />;
            case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'cancelled':
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendente';
            case 'accepted': return 'Aceito';
            case 'preparing': return 'Em Preparo';
            case 'ready': return 'Pronto';
            case 'delivering': return 'Em Entrega';
            case 'completed': return 'Concluído';
            case 'cancelled': return 'Cancelado';
            case 'rejected': return 'Recusado';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Histórico do Pedido</h4>
            <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                {sortedHistory.map((change, idx) => (
                    <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-0 bg-white p-1 rounded-full border border-gray-200">
                            {getIcon(change.status)}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-sm">{getLabel(change.status)}</span>
                            <span className="text-xs text-gray-500">
                                {formatDate(new Date(change.timestamp))} por <span className="font-medium text-gray-700">{change.user}</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
