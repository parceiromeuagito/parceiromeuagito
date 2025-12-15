import { BusinessType } from '../types';

export const SERVICE_COLORS: Record<BusinessType, { bg: string; text: string; border: string; icon: string }> = {
    restaurant: {
        bg: 'bg-orange-900/20',
        text: 'text-orange-500',
        border: 'border-orange-900/30',
        icon: 'text-orange-500'
    },
    hotel: {
        bg: 'bg-blue-900/20',
        text: 'text-blue-500',
        border: 'border-blue-900/30',
        icon: 'text-blue-500'
    },
    tickets: {
        bg: 'bg-purple-900/20',
        text: 'text-purple-500',
        border: 'border-purple-900/30',
        icon: 'text-purple-500'
    },
    delivery: {
        bg: 'bg-green-900/20',
        text: 'text-green-500',
        border: 'border-green-900/30',
        icon: 'text-green-500'
    },
    appointments: {
        bg: 'bg-pink-900/20',
        text: 'text-pink-500',
        border: 'border-pink-900/30',
        icon: 'text-pink-500'
    }
};

export const getServiceColor = (type: BusinessType) => {
    return SERVICE_COLORS[type] || {
        bg: 'bg-zinc-800',
        text: 'text-zinc-400',
        border: 'border-zinc-700',
        icon: 'text-zinc-400'
    };
};
