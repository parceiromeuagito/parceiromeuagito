import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserCog, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeamStore, TeamMember, UserRole } from '../store/useTeamStore';
import { useSecurity } from '../contexts/SecurityContext';
import { useToast } from '../contexts/ToastContext';

const ProfileSelect = () => {
    const navigate = useNavigate();
    const { members } = useTeamStore();
    const { loginWithMember } = useSecurity();
    const { addToast } = useToast();

    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const getRoleInfo = (role: UserRole) => {
        switch (role) {
            case 'admin':
                return {
                    icon: Shield,
                    title: 'Administrador',
                    description: 'Acesso total ao sistema',
                    color: 'from-red-500 to-orange-500',
                    bgColor: 'bg-red-500/10',
                    borderColor: 'border-red-500/30',
                    textColor: 'text-red-400'
                };
            case 'manager':
                return {
                    icon: UserCog,
                    title: 'Gerente',
                    description: 'Gerencia equipe e relatórios',
                    color: 'from-purple-500 to-pink-500',
                    bgColor: 'bg-purple-500/10',
                    borderColor: 'border-purple-500/30',
                    textColor: 'text-purple-400'
                };
            case 'cashier':
                return {
                    icon: User,
                    title: 'Caixa',
                    description: 'Operações de venda e pedidos',
                    color: 'from-blue-500 to-cyan-500',
                    bgColor: 'bg-blue-500/10',
                    borderColor: 'border-blue-500/30',
                    textColor: 'text-blue-400'
                };
        }
    };

    const availableRoles = Array.from(new Set(members.filter(m => m.active).map(m => m.role)));

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRole || pin.length !== 4) return;

        setIsLoading(true);
        setError(false);

        // Simular delay
        setTimeout(() => {
            // Verificar se o PIN corresponde a algum membro com o role selecionado
            const member = members.find(m => m.role === selectedRole && m.pin === pin && m.active);

            if (member) {
                loginWithMember(member);
                addToast(`Bem-vindo, ${member.name}! Você entrou como ${getRoleInfo(member.role).title}.`, 'success');
                // Usar replace para evitar voltar para select-profile com botão voltar
                navigate('/dashboard', { replace: true });
            } else {
                setError(true);
                setPin('');
                addToast('PIN incorreto. Tente novamente.', 'error');
            }
            setIsLoading(false);
        }, 800);
    };

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
            setError(false);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                        <img src="/logo-meuagito-branca.png" alt="Logo" className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Selecione seu Perfil</h1>
                    <p className="text-zinc-400 text-sm">Escolha como deseja entrar no sistema</p>
                </div>

                {/* Role Selection */}
                <AnimatePresence mode="wait">
                    {!selectedRole ? (
                        <motion.div
                            key="roles"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-3"
                        >
                            {availableRoles.map((role) => {
                                const info = getRoleInfo(role);
                                const Icon = info.icon;
                                const membersWithRole = members.filter(m => m.role === role && m.active);

                                return (
                                    <motion.button
                                        key={role}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedRole(role)}
                                        className={`w-full p-4 rounded-2xl border ${info.borderColor} ${info.bgColor} flex items-center gap-4 hover:border-opacity-60 transition-all group`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center shadow-lg`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-bold text-white">{info.title}</h3>
                                            <p className="text-xs text-zinc-400">{info.description}</p>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                {membersWithRole.length} usuário(s) cadastrado(s)
                                            </p>
                                        </div>
                                        <ArrowRight className={`w-5 h-5 ${info.textColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="pin"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 p-6"
                        >
                            {/* Selected Role Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <button
                                    onClick={() => {
                                        setSelectedRole(null);
                                        setPin('');
                                        setError(false);
                                    }}
                                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    <ArrowRight className="w-4 h-4 text-zinc-400 rotate-180" />
                                </button>
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRoleInfo(selectedRole).color} flex items-center justify-center`}>
                                    {React.createElement(getRoleInfo(selectedRole).icon, { className: 'w-5 h-5 text-white' })}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{getRoleInfo(selectedRole).title}</h3>
                                    <p className="text-xs text-zinc-400">Digite seu PIN para entrar</p>
                                </div>
                            </div>

                            <form onSubmit={handlePinSubmit}>
                                {/* PIN Display */}
                                <div className={`flex justify-center gap-3 mb-6 ${error ? 'animate-shake' : ''}`}>
                                    {[0, 1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${error
                                                ? 'border-red-500 bg-red-500/10'
                                                : pin.length > i
                                                    ? `${getRoleInfo(selectedRole).borderColor} ${getRoleInfo(selectedRole).bgColor}`
                                                    : 'border-zinc-700 bg-zinc-800/50'
                                                }`}
                                        >
                                            {pin.length > i && (
                                                <span className={getRoleInfo(selectedRole).textColor}>●</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Numpad */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => handleNumberClick(num)}
                                            className="h-14 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xl font-bold text-white transition-colors"
                                        >
                                            {num}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={handleBackspace}
                                        className="h-14 rounded-xl bg-zinc-800/50 hover:bg-zinc-700 text-sm font-medium text-zinc-400 transition-colors"
                                    >
                                        ⌫
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleNumberClick('0')}
                                        className="h-14 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xl font-bold text-white transition-colors"
                                    >
                                        0
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={pin.length !== 4 || isLoading}
                                        className={`h-14 rounded-xl flex items-center justify-center text-white font-bold transition-all ${pin.length === 4 && !isLoading
                                            ? `bg-gradient-to-r ${getRoleInfo(selectedRole).color} hover:opacity-90`
                                            : 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <ArrowRight className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                {error && (
                                    <p className="text-center text-sm text-red-400">
                                        PIN incorreto. Tente novamente.
                                    </p>
                                )}
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <p className="text-center text-xs text-zinc-500 mt-6">
                    Configure usuários em <span className="text-zinc-400">Configurações → Equipe</span>
                </p>
            </motion.div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default ProfileSelect;
