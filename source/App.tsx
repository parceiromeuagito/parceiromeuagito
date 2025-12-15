import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { OrderProvider } from './contexts/OrderContext';
import { PartnerProvider } from './contexts/PartnerContext';
import { SecurityProvider } from './contexts/SecurityContext';
import DashboardLayout from './layouts/DashboardLayout.tsx';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Menu from './pages/Menu';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Customers from './pages/Customers';
import CreativeStudio from './pages/CreativeStudio';
import Chat from './pages/Chat';
import POS from './pages/POS';
import ProfileSelect from './pages/ProfileSelect';

// Componente para gerenciar o tema globalmente
function ThemeController() {
  // const { isAuthenticated } = useBusinessStore(); // Removed unused variable

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
  }, []);

  return null;
}

// Componente que redireciona para o dashboard se já está logado, ou para login
function HomeRedirector() {
  const { currentUser, isLoading } = useApp();
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLocalLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || isLocalLoading) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Se está logado e é parceiro, vai para o dashboard
  if (currentUser && currentUser.accountType === 'partner') {
    return <Navigate to="/dashboard" replace />;
  }

  // Se não está logado ou não é parceiro, vai para login
  return <Navigate to="/login" replace />;
}

// Componente de proteção de rota
function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const { currentUser, isLoading } = useApp();
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLocalLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || isLocalLoading) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Verificar se o usuário está logado e é um parceiro
  if (!currentUser || currentUser.accountType !== 'partner') {
    return <Navigate to="/login" replace />;
  }

  return <>{element}</>;
}

function AppContent() {
  return (
    <BrowserRouter>
      <ThemeController />
      <Routes>
        {/* Rota Raiz */}
        <Route path="/" element={<HomeRedirector />} />

        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/select-profile" element={<ProtectedRoute element={<ProfileSelect />} />} />

        {/* Rotas Protegidas (Dashboard) */}
        <Route path="/dashboard" element={<ProtectedRoute element={<DashboardLayout />} />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="pos" element={<POS />} />
          <Route path="menu" element={<Menu />} />
          <Route path="customers" element={<Customers />} />
          <Route path="chat" element={<Chat />} />
          <Route path="reports" element={<Reports />} />
          <Route path="creative-studio" element={<CreativeStudio />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <AppProvider>
          <SecurityProvider>
            <OrderProvider>
              <PartnerProvider>
                <AppContent />
              </PartnerProvider>
            </OrderProvider>
          </SecurityProvider>
        </AppProvider>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;
