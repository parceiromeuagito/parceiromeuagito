import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useTeamStore, TeamMember, UserRole } from "../store/useTeamStore";
import SecurityGateModal from "../components/security/SecurityGateModal";

// ============================================
// MATRIZ DE PERMISSÕES POR ROLE
// ============================================

export type Permission =
  | "dashboard:view"
  | "orders:view"
  | "orders:create"
  | "orders:edit"
  | "orders:cancel"
  | "pos:view"
  | "pos:discount"
  | "pos:open"
  | "pos:close"
  | "catalog:view"
  | "catalog:edit"
  | "catalog:delete"
  | "customers:view"
  | "customers:edit"
  | "chat:view"
  | "chat:send"
  | "reports:view"
  | "creative:view"
  | "settings:view"
  | "settings:edit"
  | "team:view"
  | "team:edit"
  | "*"; // Super admin

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: ["*"], // Acesso total
  manager: [
    "dashboard:view",
    "orders:view",
    "orders:create",
    "orders:edit",
    "orders:cancel",
    "pos:view",
    "pos:discount",
    "pos:open",
    "pos:close",
    "catalog:view",
    "catalog:edit",
    "customers:view",
    "customers:edit",
    "chat:view",
    "chat:send",
    "reports:view",
    "team:view",
  ],
  cashier: [
    "orders:view",
    "orders:create",
    "orders:edit",
    "pos:view",
    "pos:open",
    "pos:close",
    "catalog:view",
    "chat:view",
    "chat:send",
  ],
};

// Rotas permitidas por role
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/dashboard": "dashboard:view",
  "/dashboard/orders": "orders:view",
  "/dashboard/pos": "pos:view",
  "/dashboard/menu": "catalog:view",
  "/dashboard/customers": "customers:view",
  "/dashboard/chat": "chat:view",
  "/dashboard/reports": "reports:view",
  "/dashboard/creative-studio": "creative:view",
  "/dashboard/settings": "settings:view",
};

// ============================================
// CONTEXTO DE SEGURANÇA
// ============================================

interface SecurityContextType {
  currentUser: TeamMember | null;
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  loginWithMember: (member: TeamMember) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  canAccessRoute: (path: string) => boolean;
  authorize: (permission: Permission, callback: () => void) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined,
);

const SECURITY_STORAGE_KEY = "security_current_user";

export const SecurityProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [gateState, setGateState] = useState<{
    isOpen: boolean;
    permission: Permission;
    callback: (() => void) | null;
  }>({ isOpen: false, permission: "dashboard:view", callback: null });

  const { verifyPin, members } = useTeamStore();

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const stored = localStorage.getItem(SECURITY_STORAGE_KEY);
    if (stored) {
      try {
        const storedUser = JSON.parse(stored);
        // Verificar se o usuário ainda existe e está ativo
        const validUser = members.find(
          (m) => m.id === storedUser.id && m.active,
        );
        if (validUser) {
          setCurrentUser(validUser);
          console.log(
            `🔐 Sessão restaurada: ${validUser.name} (${validUser.role})`,
          );
        } else {
          localStorage.removeItem(SECURITY_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(SECURITY_STORAGE_KEY);
      }
    }
  }, [members]);

  // Login por PIN
  const login = (pin: string) => {
    const user = verifyPin(pin);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(user));
      console.log(`🔐 Login: ${user.name} (${user.role})`);
      return true;
    }
    return false;
  };

  // Login direto com membro (usado pelo ProfileSelect)
  const loginWithMember = (member: TeamMember) => {
    setCurrentUser(member);
    localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(member));
    console.log(`🔐 Login: ${member.name} (${member.role})`);
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SECURITY_STORAGE_KEY);
    console.log("🔐 Logout realizado");
  };

  // Verificar permissão
  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;

    const userPermissions = DEFAULT_ROLE_PERMISSIONS[currentUser.role];

    // Admin tem acesso total
    if (userPermissions.includes("*")) return true;

    // Verificar permissão específica
    return userPermissions.includes(permission);
  };

  // Verificar acesso a rota
  const canAccessRoute = (path: string): boolean => {
    if (!currentUser) return false;

    // Admin acessa tudo
    if (currentUser.role === "admin") return true;

    const requiredPermission = ROUTE_PERMISSIONS[path];
    if (!requiredPermission) return true; // Rota não restrita

    return hasPermission(requiredPermission);
  };

  // Autorizar ação (só pede PIN se não estiver logado ou não tiver permissão)
  const authorize = (permission: Permission, callback: () => void) => {
    // Se já está logado E tem permissão, executa direto
    if (currentUser && hasPermission(permission)) {
      callback();
      return;
    }

    // Se não está logado ou não tem permissão, abre o gate
    setGateState({
      isOpen: true,
      permission,
      callback,
    });
  };

  const handleGateSuccess = (user: TeamMember) => {
    // Atualizar usuário atual
    loginWithMember(user);

    // Verificar se este usuário tem a permissão necessária
    const userPermissions = DEFAULT_ROLE_PERMISSIONS[user.role];
    const hasRequiredPermission =
      userPermissions.includes("*") ||
      userPermissions.includes(gateState.permission);

    if (hasRequiredPermission) {
      gateState.callback?.();
      setGateState({
        isOpen: false,
        permission: "dashboard:view",
        callback: null,
      });
    } else {
      alert(
        `Acesso Negado: O perfil "${user.role}" não tem permissão para esta ação.`,
      );
      setGateState({
        isOpen: false,
        permission: "dashboard:view",
        callback: null,
      });
    }
  };

  return (
    <SecurityContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        loginWithMember,
        logout,
        hasPermission,
        canAccessRoute,
        authorize,
      }}
    >
      {children}
      <SecurityGateModal
        isOpen={gateState.isOpen}
        onClose={() =>
          setGateState({
            isOpen: false,
            permission: "dashboard:view",
            callback: null,
          })
        }
        onSuccess={handleGateSuccess}
        requiredPermission={gateState.permission}
      />
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return context;
};

// ============================================
// HOOK DE PERMISSÕES (ATALHO)
// ============================================

export const usePermissions = () => {
  const { currentUser, hasPermission, canAccessRoute } = useSecurity();

  return {
    role: currentUser?.role || null,
    isAdmin: currentUser?.role === "admin",
    isManager: currentUser?.role === "manager",
    isCashier: currentUser?.role === "cashier",
    hasPermission,
    canAccessRoute,
    can: hasPermission, // Alias curto
  };
};
