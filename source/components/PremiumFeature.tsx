import React from 'react';
import { Lock } from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { PlanTier } from '../types';
import { Link } from 'react-router-dom';

interface PremiumFeatureProps {
  minPlan: PlanTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

const PLAN_LEVELS: Record<PlanTier, number> = {
  starter: 1,
  pro: 2,
  enterprise: 3
};

const PremiumFeature = ({ minPlan, children, fallback, className = '' }: PremiumFeatureProps) => {
  const { config } = useBusinessStore();
  const currentLevel = PLAN_LEVELS[config.plan];
  const requiredLevel = PLAN_LEVELS[minPlan];

  if (currentLevel >= requiredLevel) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={`relative group overflow-hidden rounded-xl border border-gray-200 bg-gray-50 ${className}`}>
      <div className="absolute inset-0 bg-gray-100/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-4 text-center transition-opacity">
        <div className="bg-white p-3 rounded-full shadow-lg mb-2">
          <Lock className="w-5 h-5 text-gray-400" />
        </div>
        <h4 className="text-sm font-bold text-gray-900">Recurso Premium</h4>
        <p className="text-xs text-gray-500 mb-3 max-w-[200px]">
          Disponível no plano <span className="uppercase font-bold text-blue-600">{minPlan}</span>
        </p>
        <Link 
          to="/settings" 
          className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Fazer Upgrade
        </Link>
      </div>
      <div className="opacity-50 pointer-events-none filter blur-sm select-none">
        {children}
      </div>
    </div>
  );
};

export default PremiumFeature;
