import { motion, AnimatePresence } from 'framer-motion';
import { Package, MessageSquare, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPopover = ({ isOpen, onClose }: NotificationsPopoverProps) => {
  const navigate = useNavigate();

  // Adicionamos a propriedade 'path' para definir o destino
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Novo Pedido #1234',
      desc: 'Mesa 4 solicitou atendimento',
      time: '2 min atrás',
      icon: Package,
      color: 'bg-orange-100 text-orange-600',
      path: '/orders'
    },
    {
      id: 2,
      type: 'msg',
      title: 'Nova Mensagem',
      desc: 'Cliente João: "O check-in pode ser..."',
      time: '15 min atrás',
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-600',
      path: '/orders'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Estoque Baixo',
      desc: 'Item "Cerveja Artesanal" está acabando',
      time: '1h atrás',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
      path: '/menu'
    },
  ];

  const handleNotificationClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Notificações</h3>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">3 Novas</span>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.path)}
                  className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer group"
                >
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-xl h-fit ${notif.color}`}>
                      <notif.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{notif.title}</h4>
                        <span className="text-[10px] text-gray-400">{notif.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
              <button className="text-xs font-bold text-gray-600 hover:text-blue-600 transition-colors">
                Marcar todas como lidas
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPopover;
