import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatSidebar from "../components/ChatSidebar";
import Header from "../components/Header";
import {
  useBusinessStore,
  getBusinessContext,
} from "../store/useBusinessStore";
import { Order } from "../types";

const DashboardLayout = () => {
  const location = useLocation();
  const { config } = useBusinessStore();
  const context = getBusinessContext(config.businessTypes, config);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatSidebarCollapsed, setIsChatSidebarCollapsed] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const canUseChat = config.plan !== "starter";

  // NOTA: A proteção de rota já é feita pelo ProtectedRoute no App.tsx usando AppContext

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Visão Geral";
      case "/dashboard":
        return "Visão Geral";
      case "/dashboard/orders":
        return `Gestão de ${context.actionLabel}s`;
      case "/dashboard/menu":
        return "Catálogo de Itens";
      case "/dashboard/customers":
        return "Clientes";
      case "/dashboard/chat":
        return "Mensagens";
      case "/dashboard/reports":
        return "Relatórios e Métricas";
      case "/dashboard/creative-studio":
        return "Estúdio Criativo";
      case "/dashboard/settings":
        return "Configurações";
      case "/dashboard/pos":
        return "Frente de Caixa";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Chat Sidebar Global */}
      {canUseChat && (
        <ChatSidebar
          isCollapsed={isChatSidebarCollapsed}
          onToggleCollapse={() =>
            setIsChatSidebarCollapsed(!isChatSidebarCollapsed)
          }
          externalSelectedOrder={selectedOrder}
        />
      )}

      <div className="flex-1 flex flex-col">
        <Header
          title={getPageTitle()}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 overflow-y-auto scroll-smooth">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet
              context={{
                setSelectedChatOrder: setSelectedOrder,
                isChatSidebarCollapsed,
                setIsChatSidebarCollapsed,
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
