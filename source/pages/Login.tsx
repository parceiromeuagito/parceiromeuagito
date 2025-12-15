import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('parceiro@meuagito.com');
  const [password, setPassword] = useState('123456');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Chama login do AppContext
    const success = await login(email, password);

    if (success) {
      navigate('/select-profile');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Lado Esquerdo - Visual */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/login-bg.png"
            alt="Background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 text-center px-12">
          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl inline-block mb-6 shadow-2xl border border-white/10">
            <img src="/assets/logo.png" alt="Meu Agito Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Meu Agito <span className="text-orange-500">Parceiros</span></h1>
          <p className="text-gray-300 text-xl max-w-md mx-auto leading-relaxed font-light">
            Seu negócio, no centro do agito.
          </p>
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-orange-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-orange-500/30"></div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-gray-900 p-10 rounded-3xl shadow-2xl border border-gray-800"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Bem-vindo de volta</h2>
            <p className="text-gray-400 mt-2">Acesse seu painel administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Corporativo</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:bg-gray-800 outline-none transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:bg-gray-800 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="rounded border-gray-600 bg-gray-800 text-orange-600 focus:ring-orange-500 h-4 w-4" />
                <span className="text-gray-400 ml-2">Lembrar-me</span>
              </label>
              <a href="https://meuagito.com/recuperar-senha" target="_blank" rel="noopener noreferrer" className="text-orange-500 font-medium hover:underline hover:text-orange-400">Esqueceu a senha?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Entrar no Painel
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Não tem uma conta? <a href="https://meuagito.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 font-bold hover:underline hover:text-orange-400">Inscreva-se em meuagito.com</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
