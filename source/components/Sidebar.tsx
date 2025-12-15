import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useBusinessStore, getBusinessContext } from '../store/useBusinessStore';
import { useCashRegisterStore } from '../store/useCashRegisterStore';
import { useSecurity, usePermissions, Permission } from '../contexts/SecurityContext';
import { PLANS } from '../data/plans';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  ShoppingCart,
  List,
  Users,
  BarChart3,
  Settings,
  LogOut,
  X,
  ChevronRight,
  ChevronLeft,
  Store,
  Crown,
  Wand2,
  MessageCircle,
  DollarSign,
  User,
  Shield,
  UserCog,
} from 'lucide-react';
import { useState } from 'react';
import CashRegisterModal from './CashRegisterModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Interface disponível para uso futuro
// interface NavItem {
//   icon: LucideIcon;
//   label: string;
//   path: string;
//   badge?: number;
//   badgeText?: string;
//   permission: Permission;
// }

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) => {
  const navigate = useNavigate();
  const { config } = useBusinessStore();
  const { cashRegister } = useCashRegisterStore();
  const { currentUser, logout } = useSecurity();
  const { canAccessRoute } = usePermissions();
  const context = getBusinessContext(config.businessTypes, config);
  const currentPlan = PLANS[config.plan];
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);

  // Definir itens de navegação com permissões
  const navGroups = [
    {
      title: 'Operação',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', permission: 'dashboard:view' as Permission },
        { icon: ShoppingCart, label: 'Pedidos', path: '/dashboard/orders', badge: 3, permission: 'orders:view' as Permission },
        { icon: Store, label: 'Frente de Caixa', path: '/dashboard/pos', permission: 'pos:view' as Permission },
        { icon: MessageCircle, label: 'Mensagens', path: '/dashboard/chat', badgeText: 'Pro', permission: 'chat:view' as Permission },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { icon: List, label: `Catálogo de Itens`, path: '/dashboard/menu', permission: 'catalog:view' as Permission },
        { icon: Users, label: 'Clientes', path: '/dashboard/customers', permission: 'customers:view' as Permission },
        { icon: BarChart3, label: 'Relatórios', path: '/dashboard/reports', permission: 'reports:view' as Permission },
        { icon: Wand2, label: 'Estúdio Criativo', path: '/dashboard/creative-studio', badgeText: 'IA', permission: 'creative:view' as Permission },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { icon: Settings, label: 'Configurações', path: '/dashboard/settings', permission: 'settings:view' as Permission },
      ]
    }
  ];

  // Filtrar itens por permissão
  const filteredNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => canAccessRoute(item.path))
  })).filter(group => group.items.length > 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Ícone e cor do role atual
  const getRoleIcon = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'admin': return <Shield className="w-3 h-3 text-red-400" />;
      case 'manager': return <UserCog className="w-3 h-3 text-purple-400" />;
      case 'cashier': return <User className="w-3 h-3 text-blue-400" />;
      default: return null;
    }
  };

  const getRoleName = () => {
    if (!currentUser) return '';
    switch (currentUser.role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'cashier': return 'Caixa';
      default: return '';
    }
  };

  return (
    <TooltipProvider>
      <>
        <CashRegisterModal isOpen={isCashModalOpen} onClose={() => setIsCashModalOpen(false)} />

        {/* Mobile Overlay */}
        <div
          className={cn(
            "fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 md:hidden",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onClose}
        />

        {/* Sidebar Desktop + Mobile */}
        <aside
          className={cn(
            'fixed left-0 top-0 h-screen flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-300 ease-in-out z-50',
            'w-72',
            isCollapsed ? 'lg:w-20' : 'lg:w-72',
            isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className={cn("flex items-center gap-2", isCollapsed && "lg:hidden")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Store className="text-white w-5 h-5" />
              </div>
              <div className={cn(isCollapsed && "lg:hidden")}>
                <h1 className="font-bold text-sm text-zinc-900 dark:text-white">{context.label}</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Gestor</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:flex hidden"
              onClick={onToggleCollapse}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>

            {/* Close Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info Badge */}
          {currentUser && !isCollapsed && (
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  {getRoleIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {getRoleName()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
            {filteredNavGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-4">
                {!isCollapsed && (
                  <h3 className="px-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 mt-2">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 group',
                            isActive
                              ? 'bg-primary/10 dark:bg-zinc-900 text-primary dark:text-primary'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                          )
                        }
                        onClick={() => onClose()}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className={cn("flex-1 text-sm font-medium truncate", isCollapsed && "lg:hidden")}>
                          {item.label}
                        </span>
                        {item.badge && item.badge > 0 && (
                          <Badge className={cn("h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-white", isCollapsed && "lg:hidden")}>
                            {item.badge}
                          </Badge>
                        )}
                        {item.badgeText && (
                          <Badge className={cn("px-2 py-0.5 text-[10px] bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold", isCollapsed && "lg:hidden")}>
                            {item.badgeText}
                          </Badge>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 p-2 space-y-2">
            {/* Caixa Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsCashModalOpen(true)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                    cashRegister.isOpen
                      ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900"
                      : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
                  )}
                >
                  <div className="relative">
                    <DollarSign className="w-5 h-5" />
                    <div className={cn(
                      "absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse",
                      cashRegister.isOpen ? "bg-green-500" : "bg-red-500"
                    )} />
                  </div>
                  <span className={cn("text-sm font-medium", isCollapsed && "lg:hidden")}>
                    {cashRegister.isOpen ? 'Caixa Aberto' : 'Caixa Fechado'}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className={isCollapsed ? "" : "lg:hidden"}>
                {cashRegister.isOpen ? 'Caixa Aberto - Clique para gerenciar' : 'Caixa Fechado - Clique para abrir'}
              </TooltipContent>
            </Tooltip>

            {/* Plan Info */}
            <div className={cn("px-3 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 mb-2", isCollapsed && "lg:hidden")}>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Plano</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white capitalize">{currentPlan.name}</p>
                {config.plan === 'starter' && <Crown className="w-4 h-4 text-amber-500" />}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className={cn("ml-2 text-sm", isCollapsed && "lg:hidden")}>Sair</span>
            </Button>
          </div>
        </aside>
      </>
    </TooltipProvider>
  );
};

export default Sidebar;
