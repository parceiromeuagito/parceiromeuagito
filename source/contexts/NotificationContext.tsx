import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification, NotificationType, NotificationSettings } from '../types/notification';
import { useToast } from './ToastContext';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    settings: NotificationSettings;
    addNotification: (title: string, message: string, type?: NotificationType, link?: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    updateSettings: (newSettings: Partial<NotificationSettings>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEFAULT_SETTINGS: NotificationSettings = {
    email: true,
    push: true,
    sms: false,
    events: {
        newOrder: true,
        orderStatus: true,
        stockLow: true,
        dailyReport: false
    }
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
    const { addToast } = useToast();

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = (title: string, message: string, type: NotificationType = 'info', link?: string) => {
        const newNotification: Notification = {
            id: Date.now().toString(),
            title,
            message,
            type,
            read: false,
            timestamp: new Date(),
            link
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Mostrar toast também para feedback imediato
        addToast(title, type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info');
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const updateSettings = (newSettings: Partial<NotificationSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    // Simulação de eventos periódicos (apenas para demonstração)
    useEffect(() => {
        const interval = setInterval(() => {
            // 10% de chance de gerar uma notificação a cada 30s
            if (Math.random() < 0.1 && settings.events.newOrder) {
                addNotification(
                    'Novo Pedido Recebido!',
                    'Você recebeu um novo pedido de Delivery (#9999).',
                    'success',
                    '/dashboard/orders'
                );
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [settings]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            settings,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearAll,
            updateSettings
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
