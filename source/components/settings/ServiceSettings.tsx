import { useOrder } from '../../contexts/OrderContext';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Bell } from 'lucide-react';

export function ServiceSettings() {
    const { services, toggleAutoAccept } = useOrder();

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Configurações de Serviços</h3>
            <div className="grid gap-4">
                {services.filter(s => s.enabled).map(service => (
                    <div key={service.id} className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                        <Bell className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                            <Label className="text-base font-medium text-zinc-200">{service.name}</Label>
                            <p className="text-xs text-zinc-500">
                                Aceitar automaticamente novos pedidos de {service.name.toLowerCase()}
                            </p>
                        </div>
                        <Switch
                            checked={service.autoAccept}
                            onCheckedChange={() => toggleAutoAccept(service.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
