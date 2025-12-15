import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

// Tipo de usuário para autenticação
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    accountType: 'partner' | 'customer';
    role?: 'admin' | 'manager' | 'staff';
}

interface AppContextType {
    currentUser: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateUserProfile: (updates: Partial<User>) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Usuário padrão para desenvolvimento
const DEFAULT_PARTNER_USER: User = {
    id: 'partner-1',
    name: 'Parceiro Meu Agito',
    email: 'parceiro@meuagito.com',
    avatar: 'https://ui-avatars.com/api/?name=Parceiro+Meu+Agito&background=FF6B35&color=fff',
    accountType: 'partner',
    role: 'admin'
};

/**
 * Provider para contexto global de aplicação
 * @param props Props incluindo children
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const { addToast } = useToast();

    // Carregar usuário do localStorage ao iniciar
    useEffect(() => {
        const storedUserId = localStorage.getItem('lastLoggedInUserId');

        if (storedUserId) {
            try {
                const storedUserData = localStorage.getItem(`user_${storedUserId}`);
                if (storedUserData) {
                    const user = JSON.parse(storedUserData);
                    // Verificar se é parceiro
                    if (user.accountType === 'partner') {
                        setCurrentUser(user);
                        console.log(`✅ Parceiro ${user.name} carregado do localStorage.`);
                    } else {
                        // Se não for parceiro, limpar
                        localStorage.removeItem('lastLoggedInUserId');
                        localStorage.removeItem(`user_${storedUserId}`);
                        console.log('⚠️ Usuário não é parceiro. Limpando sessão.');
                    }
                } else {
                    localStorage.removeItem('lastLoggedInUserId');
                }
            } catch (error) {
                console.error('Erro ao carregar usuário:', error);
                localStorage.removeItem('lastLoggedInUserId');
            }
        }

        setIsLoading(false);
    }, []);

    /**
     * Autentica usuário (mock para desenvolvimento)
     * @param email Email do usuário
     * @param password Senha do usuário
     * @returns Promise com resultado da autenticação
     */
    const login = async (email: string): Promise<boolean> => {
        setIsLoading(true);

        // Simulação de autenticação
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock: aceitar qualquer email que contenha "parceiro"
                if (email.toLowerCase().includes('parceiro') || email.toLowerCase().includes('partner')) {
                    const user: User = {
                        ...DEFAULT_PARTNER_USER,
                        email,
                        id: `partner-${Date.now()}`
                    };

                    // Salvar no localStorage
                    localStorage.setItem(`user_${user.id}`, JSON.stringify(user));
                    localStorage.setItem('lastLoggedInUserId', user.id);

                    setCurrentUser(user);
                    addToast(`Bem-vindo(a), ${user.name}!`, 'success');
                    console.log(`✅ Login realizado: ${user.name}`);

                    setIsLoading(false);
                    resolve(true);
                } else {
                    addToast('Acesso negado. Apenas parceiros podem acessar.', 'error');
                    setIsLoading(false);
                    resolve(false);
                }
            }, 800);
        });
    };

    /**
     * Desautentica usuário
     */
    const logout = () => {
        setIsLoading(true);
        setTimeout(() => {
            if (currentUser) {
                localStorage.removeItem('lastLoggedInUserId');
                localStorage.removeItem(`user_${currentUser.id}`);
            }
            setCurrentUser(null);
            addToast('Você foi desconectado(a).', 'info');
            setIsLoading(false);
            console.log('✅ Logout realizado');
        }, 300);
    };

    /**
     * Atualiza perfil do usuário atual
     * @param updates Atualizações de perfil
     */
    const updateUserProfile = (updates: Partial<User>) => {
        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
        localStorage.setItem(`user_${updatedUser.id}`, JSON.stringify(updatedUser));
        console.log(`✅ Perfil de ${updatedUser.name} atualizado`);
        addToast('Perfil atualizado com sucesso!', 'success');
    };

    /**
     * Alterna entre temas claro e escuro
     */
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', newTheme);
    };

    // Carregar tema do localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            }
        }
    }, []);

    return (
        <AppContext.Provider
            value={{
                currentUser,
                isLoading,
                login,
                logout,
                updateUserProfile,
                theme,
                toggleTheme
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

/**
 * Hook para acessar contexto global de aplicação
 * @returns Contexto da aplicação
 */
export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
