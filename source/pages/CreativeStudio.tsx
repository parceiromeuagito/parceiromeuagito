import { useState, useEffect } from 'react';
import { Wand2, Send, MapPin, Users, Image } from 'lucide-react';
import { CreativeAIService, CampaignDraft, InsightType } from '../services/creativeAI';
import { useBusinessStore } from '../store/useBusinessStore';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'framer-motion';

const CreativeStudio = () => {
    const { config } = useBusinessStore();
    const { addToast } = useToast();

    const [campaign, setCampaign] = useState<CampaignDraft | null>(null);
    const [activeTab, setActiveTab] = useState<'create' | 'boost'>('create');
    const [radius, setRadius] = useState(2); // km
    const [budgetType, setBudgetType] = useState<'fixed' | 'cpm'>('fixed');
    const [budget] = useState(50); // Valor em R$

    // Simulação de Estimativa
    const potentialReach = Math.floor(radius * 1250 * (Math.random() * 0.5 + 0.8));
    const estimatedCost = budgetType === 'fixed'
        ? (radius <= 2 ? 9.90 : radius <= 5 ? 29.90 : 49.90)
        : budget;

    useEffect(() => {
        // Gerar campanha inicial
        const draft = CreativeAIService.generateCampaign('rainy_day', config.businessTypes[0] || 'delivery', 'Combo Especial');
        setCampaign(draft);
    }, [config.businessTypes]);

    const handleGenerateNew = (type: InsightType) => {
        const draft = CreativeAIService.generateCampaign(type, config.businessTypes[0] || 'delivery', 'Combo Especial');
        setCampaign(draft);
        addToast('Nova campanha gerada!', 'success');
    };

    const handleLaunch = () => {
        addToast(`Campanha "${campaign?.title}" criada com sucesso!`, 'success');
        addToast(`Investimento estimado: R$ ${estimatedCost.toFixed(2)}`, 'info');
    };

    if (!campaign) return null;

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-900 dark:to-blue-900 p-8 rounded-2xl text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Wand2 className="w-8 h-8" />
                    <h1 className="text-3xl font-bold">Estúdio Criativo</h1>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">IA Powered</span>
                </div>
                <p className="text-white/90">Crie campanhas de marketing profissionais em minutos com inteligência artificial</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { type: 'rainy_day' as InsightType, label: 'Dia Chuvoso', icon: '☔', color: 'bg-blue-500' },
                    { type: 'slow_sales' as InsightType, label: 'Vendas Baixas', icon: '🔥', color: 'bg-orange-500' },
                    { type: 'holiday' as InsightType, label: 'Feriado', icon: '🎉', color: 'bg-purple-500' },
                    { type: 'low_ticket' as InsightType, label: 'Ticket Baixo', icon: '💰', color: 'bg-green-500' },
                ].map((item) => (
                    <button
                        key={item.type}
                        onClick={() => handleGenerateNew(item.type)}
                        className={`${item.color} hover:opacity-90 text-white p-4 rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105`}
                    >
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <div className="text-sm font-bold">{item.label}</div>
                    </button>
                ))}
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`flex-1 px-6 py-4 font-bold transition-colors ${activeTab === 'create' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        1. Criação
                    </button>
                    <button
                        onClick={() => setActiveTab('boost')}
                        className={`flex-1 px-6 py-4 font-bold transition-colors ${activeTab === 'boost' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        2. Impulsionamento
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'create' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Editor */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Título Chamativo
                                    </label>
                                    <input
                                        type="text"
                                        value={campaign.title}
                                        onChange={e => setCampaign({ ...campaign, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Texto do Anúncio (Copy)
                                    </label>
                                    <textarea
                                        value={campaign.copy}
                                        onChange={e => setCampaign({ ...campaign, copy: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <Image className="w-4 h-4 inline mr-2" />
                                        Sugestão de Imagem
                                    </label>
                                    <input
                                        type="text"
                                        value={campaign.imagePrompt}
                                        onChange={e => setCampaign({ ...campaign, imagePrompt: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Ex: comida deliciosa, ambiente acolhedor"
                                    />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {campaign.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-full">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                {campaign.suggestedDiscount > 0 && (
                                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                                        <p className="text-sm text-orange-800 dark:text-orange-200">
                                            💡 <strong>Sugestão IA:</strong> Desconto de {campaign.suggestedDiscount}% para máximo impacto
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Preview */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Preview da Campanha
                                </label>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-xl p-6 shadow-2xl border border-gray-200 transform rotate-1"
                                >
                                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            MA
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm leading-none text-gray-900">Meu Agito</p>
                                            <p className="text-xs text-gray-500">Patrocinado</p>
                                        </div>
                                    </div>
                                    <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 rounded-lg mb-4 flex items-center justify-center text-gray-400 text-sm">
                                        📸 {campaign.imagePrompt}
                                    </div>
                                    <p className="font-bold text-base mb-2 text-gray-900">{campaign.title}</p>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{campaign.copy}</p>
                                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-3 rounded-lg font-bold text-sm shadow-lg">
                                        Peça Agora 🚀
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'boost' && (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            {/* Raio */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                        <MapPin className="w-5 h-5 text-blue-500" />
                                        Raio de Alcance
                                    </label>
                                    <span className="text-2xl font-bold text-blue-500">{radius} km</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={radius}
                                    onChange={e => setRadius(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-3">
                                    <Users className="w-4 h-4" />
                                    Público estimado: <span className="font-bold text-gray-900 dark:text-white">{potentialReach.toLocaleString()}</span> pessoas
                                </div>
                            </div>

                            {/* Orçamento */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setBudgetType('fixed')}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all ${budgetType === 'fixed'
                                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-lg'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}
                                >
                                    <div className="font-bold mb-1 text-gray-900 dark:text-white">Pacote Blitz ⚡</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">Alcance máximo na área</div>
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        R$ {radius <= 2 ? '9,90' : radius <= 5 ? '29,90' : '49,90'}
                                    </div>
                                </button>

                                <button
                                    onClick={() => setBudgetType('cpm')}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all ${budgetType === 'cpm'
                                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-lg'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}
                                >
                                    <div className="font-bold mb-1 text-gray-900 dark:text-white">Orçamento Livre 💸</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">Pague por visualização</div>
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        R$ {budget.toFixed(2)}
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Estimado</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {estimatedCost.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-3">
                        {activeTab === 'create' ? (
                            <button
                                onClick={() => setActiveTab('boost')}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg"
                            >
                                Definir Público <Users className="w-5 h-5" />
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setActiveTab('create')}
                                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={handleLaunch}
                                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg"
                                >
                                    Criar Campanha <Send className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreativeStudio;
