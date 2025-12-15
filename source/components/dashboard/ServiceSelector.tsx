import React from "react";
import { useOrder, ServiceType } from "@/contexts/OrderContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bike, Utensils, Calendar, Ticket, Bed, Store } from "lucide-react";

export function ServiceSelector() {
  const { services, selectedService, setSelectedService, getOrdersByService } =
    useOrder();

  const icons: Record<ServiceType, React.ReactNode> = {
    delivery: <Bike className="w-4 h-4" />,
    pickup: <Store className="w-4 h-4" />,
    table: <Utensils className="w-4 h-4" />,
    booking: <Calendar className="w-4 h-4" />,
    event: <Ticket className="w-4 h-4" />,
    stay: <Bed className="w-4 h-4" />,
  };

  // Filtrar apenas serviços habilitados
  const activeServices = services.filter((s) => s.enabled);

  if (activeServices.length <= 1) return null; // Não mostrar se só tiver 1 ou 0 serviços

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
      <Button
        variant={selectedService === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => setSelectedService("all")}
        className={`rounded-full ${selectedService === "all" ? "bg-primary text-primary-foreground" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}
      >
        Todos
      </Button>

      {activeServices.map((service) => {
        const pendingCount = getOrdersByService(service.id).filter(
          (o) => o.status === "pending",
        ).length;

        return (
          <Button
            key={service.id}
            variant={selectedService === service.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedService(service.id)}
            className={`rounded-full gap-2 ${
              selectedService === service.id
                ? "bg-primary text-primary-foreground"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {icons[service.id]}
            {service.name}
            {pendingCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 px-1.5 text-[10px] bg-red-500/20 text-red-500 hover:bg-red-500/30 border-0"
              >
                {pendingCount}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
