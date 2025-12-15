import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Wand2, Send, MapPin, Users } from 'lucide-react';
import { CreativeAIService, CampaignDraft, InsightType } from '@/services/creativeAI';
import { useBusinessStore } from '@/store/useBusinessStore';
import { useToast } from '@/contexts/ToastContext';

interface CreativeStudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    insightType?: InsightType;
    defaultProduct?: string;
}

export function CreativeStudioModal({ isOpen, onClose, insightType = 'slow_sales', defaultProduct = 'Produto' }: CreativeStudioModalProps) {
    const { config } = useBusinessStore();
    const { addToast } = useToast();

    const [campaign, setCampaign] = useState<CampaignDraft | null>(null);
    const [activeTab, setActiveTab] = useState('create');

    const [radius, setRadius] = useState([2]); // km
    const [budgetType, setBudgetType] = useState<'fixed' | 'cpm'>('fixed');
    const [budget] = useState(50); // Valor em R$

    // Simulação de Estimativa
    const potentialReach = Math.floor(radius[0] * 1250 * (Math.random() * 0.5 + 0.8));
    const estimatedCost = budgetType === 'fixed'
        ? (radius[0] <= 2 ? 9.90 : radius[0] <= 5 ? 29.90 : 49.90)
        : budget;

    useEffect(() => {
        if (isOpen) {
            const draft = CreativeAIService.generateCampaign(insightType, config.businessTypes[0] || 'delivery', defaultProduct);
            setCampaign(draft);
            setActiveTab('create');
        }
    }, [isOpen, insightType, config.businessTypes, defaultProduct]);

    const handleLaunch = () => {
        // Simular pagamento
        // Em um app real, verificaria saldo
        // deductBalance(estimatedCost);
        addToast(`Campanha "${campaign?.title}" enviada para análise!`, 'success');
        addToast(`Valor de R$ ${estimatedCost.toFixed(2)} reservado.`, 'info');
        onClose();
    };

    if (!campaign) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Wand2 className="w-5 h-5 text-purple-500" />
                        Estúdio Criativo
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="bg-zinc-800 w-full grid grid-cols-2">
                        <TabsTrigger value="create">1. Criação</TabsTrigger>
                        <TabsTrigger value="boost">2. Impulsionamento</TabsTrigger>
                    </TabsList>

                    {/* ABA CRIAÇÃO */}
                    <TabsContent value="create" className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Título Chamativo</Label>
                                    <Input
                                        value={campaign.title}
                                        onChange={e => setCampaign({ ...campaign, title: e.target.value })}
                                        className="bg-zinc-950 border-zinc-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Texto do Anúncio (Copy)</Label>
                                    <Textarea
                                        value={campaign.copy}
                                        onChange={e => setCampaign({ ...campaign, copy: e.target.value })}
                                        className="bg-zinc-950 border-zinc-700 h-32"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {campaign.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="bg-zinc-800 text-zinc-400">#{tag}</Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-white text-black rounded-xl p-4 shadow-lg transform rotate-1">
                                <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">MA</div>
                                    <div>
                                        <p className="font-bold text-sm leading-none">Meu Agito</p>
                                        <p className="text-[10px] text-gray-500">Patrocinado</p>
                                    </div>
                                </div>
                                <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-xs">
                                    [Imagem: {campaign.imagePrompt}]
                                </div>
                                <p className="font-bold text-sm mb-1">{campaign.title}</p>
                                <p className="text-xs text-gray-600 leading-relaxed">{campaign.copy}</p>
                                <div className="mt-3 bg-blue-500 text-white text-center py-2 rounded font-bold text-xs">
                                    Peça Agora
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ABA IMPULSIONAMENTO */}
                    <TabsContent value="boost" className="space-y-6 py-4">
                        <div className="space-y-6">
                            {/* Raio */}
                            <div className="space-y-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
                                <div className="flex justify-between items-center">
                                    <Label className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        Raio de Alcance
                                    </Label>
                                    <span className="text-blue-400 font-bold">{radius[0]} km</span>
                                </div>
                                <Slider
                                    value={radius}
                                    onValueChange={setRadius}
                                    max={10}
                                    step={1}
                                    className="py-2"
                                />
                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                    <Users className="w-4 h-4" />
                                    Público estimado: <span className="text-white font-bold">{potentialReach.toLocaleString()} pessoas</span>
                                </div>
                            </div>

                            {/* Orçamento */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setBudgetType('fixed')}
                                    className={`p-4 rounded-xl border text-left transition-all ${budgetType === 'fixed'
                                        ? 'bg-purple-500/10 border-purple-500 ring-1 ring-purple-500'
                                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'}`}
                                >
                                    <div className="font-bold mb-1">Pacote Blitz</div>
                                    <div className="text-xs text-zinc-400 mb-2">Alcance máximo na área</div>
                                    <div className="text-xl font-bold text-purple-400">
                                        R$ {radius[0] <= 2 ? '9,90' : radius[0] <= 5 ? '29,90' : '49,90'}
                                    </div>
                                </button>

                                <button
                                    onClick={() => setBudgetType('cpm')}
                                    className={`p-4 rounded-xl border text-left transition-all ${budgetType === 'cpm'
                                        ? 'bg-purple-500/10 border-purple-500 ring-1 ring-purple-500'
                                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'}`}
                                >
                                    <div className="font-bold mb-1">Orçamento Livre</div>
                                    <div className="text-xs text-zinc-400 mb-2">Pague por visualização</div>
                                    <div className="text-xl font-bold text-purple-400">
                                        R$ {budget.toFixed(2)}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-6 flex justify-between items-center border-t border-zinc-800 pt-4">
                    <div className="text-left">
                        <p className="text-xs text-zinc-500">Total Estimado</p>
                        <p className="text-xl font-bold text-white">R$ {estimatedCost.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                        {activeTab === 'create' ? (
                            <Button onClick={() => setActiveTab('boost')}>
                                Definir Público <Users className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={handleLaunch} className="bg-green-600 hover:bg-green-700 text-white">
                                Pagar & Disparar <Send className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
