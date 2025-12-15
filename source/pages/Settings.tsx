import { useState, useEffect, useCallback } from "react";
import { useBusinessStore } from "../store/useBusinessStore";
import { BusinessType, PlanTier, IntegrationConfig } from "../types";
import { PLANS } from "../data/plans";
import {
  UtensilsCrossed,
  BedDouble,
  Ticket,
  Calendar,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Building2,
  Globe,
  AlertTriangle,
  Link as LinkIcon,
  Printer,
  FileText,
  Type,
  Copy,
  Layers,
  LucideIcon,
} from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { formatCurrency } from "../lib/utils";
import PremiumFeature from "../components/PremiumFeature";
import { printOrderReceipt } from "../lib/printer";
import { getMockOrders } from "../data/mock";
import SettingsTeam from "./settings/SettingsTeam";
import { useSecurity } from "../contexts/SecurityContext";

// ... (Componentes BusinessTypeCard, IntegrationCard, PlanCard mantidos iguais) ...

const BusinessTypeCard = ({
  type,
  isSelected,
  icon: Icon,
  onClick,
}: {
  type: BusinessType;
  isSelected: boolean;
  icon: LucideIcon;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 group ${
        isSelected
          ? "border-primary bg-primary/20 shadow-inner"
          : "border-zinc-800 bg-zinc-900 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
      }`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="w-5 h-5 text-primary" />
        </div>
      )}
      <div
        className={`p-4 rounded-full mb-3 transition-colors ${isSelected ? "bg-primary/20 text-primary" : "bg-zinc-800 text-zinc-500 group-hover:bg-primary/10 group-hover:text-primary"}`}
      >
        <Icon className="w-8 h-8" />
      </div>
      <span
        className={`font-bold text-sm text-center ${isSelected ? "text-white" : "text-zinc-400"}`}
      >
        {type === "hotel"
          ? "Hotelaria"
          : type === "tickets"
            ? "Eventos"
            : type === "reservation"
              ? "Restaurante"
              : type === "scheduling"
                ? "Serviço"
                : type === "delivery"
                  ? "Delivery"
                  : "E-commerce"}
      </span>
    </button>
  );
};

const IntegrationCard = ({
  integration,
  onToggle,
}: {
  integration: IntegrationConfig;
  onToggle: () => void;
}) => {
  const [apiKey, setApiKey] = useState(integration.apiKey || "");
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${integration.connected ? "bg-green-900/30 text-green-500" : "bg-zinc-800 text-zinc-500"}`}
        >
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-white">{integration.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${integration.connected ? "bg-green-500" : "bg-zinc-600"}`}
            ></span>
            <span className="text-xs text-zinc-500">
              {integration.connected ? "Conectado" : "Desconectado"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isEditing ? (
          <div className="flex gap-2 animate-in fade-in">
            <input
              type="text"
              placeholder="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm w-40 text-white placeholder-zinc-500 focus:ring-primary focus:border-primary"
            />
            <button
              onClick={() => {
                onToggle();
                setIsEditing(false);
              }}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90"
            >
              Salvar
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              integration.connected ? onToggle() : setIsEditing(true)
            }
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              integration.connected
                ? "bg-red-900/20 text-red-400 hover:bg-red-900/30"
                : "bg-white text-black hover:bg-zinc-200"
            }`}
          >
            {integration.connected ? "Desconectar" : "Conectar"}
          </button>
        )}
      </div>
    </div>
  );
};

const PlanCard = ({
  planId,
  currentPlanId,
  onSelect,
}: {
  planId: PlanTier;
  currentPlanId: PlanTier;
  onSelect: (id: PlanTier) => void;
}) => {
  const plan = PLANS[planId];
  const isCurrent = planId === currentPlanId;

  return (
    <div
      className={`relative p-6 rounded-2xl border-2 transition-all ${isCurrent ? `border-${plan.color.split("-")[1]}-500 bg-zinc-900 shadow-xl scale-105 z-10` : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700"}`}
    >
      {isCurrent && (
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-3 py-1 rounded-full ${plan.color}`}
        >
          Plano Atual
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-bold text-white">
            {plan.price === 0 ? "Grátis" : formatCurrency(plan.price)}
          </span>
          <span className="text-sm text-zinc-500">/mês</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feat, idx) => (
          <li
            key={idx}
            className="flex items-center gap-2 text-sm text-zinc-400"
          >
            <div
              className={`p-0.5 rounded-full ${isCurrent ? "bg-green-900/30 text-green-500" : "bg-zinc-800 text-zinc-600"}`}
            >
              <CheckCircle2 className="w-3 h-3" />
            </div>
            {feat}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(planId)}
        disabled={isCurrent}
        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
          isCurrent
            ? "bg-zinc-800 text-zinc-500 cursor-default"
            : `text-white hover:shadow-lg hover:scale-[1.02] ${plan.color}`
        }`}
      >
        {isCurrent ? "Selecionado" : "Escolher Plano"}
      </button>
    </div>
  );
};

const Settings = () => {
  const {
    config,
    toggleBusinessType,
    updatePlan,
    toggleIntegration,
    updateConfig,
    setPrimaryType,
    resetSystem,
  } = useBusinessStore();
  const { addToast } = useToast();
  const { authorize } = useSecurity();
  const [activeTab, setActiveTab] = useState<
    "general" | "plans" | "integrations" | "printer" | "team"
  >("general");

  useEffect(() => {
    // Protect the entire Settings page
    authorize("system:configure", () => {
      // Access granted
    });
  }, [authorize]);

  const handleSave = useCallback(() => {
    addToast("Configurações salvas com sucesso!", "success");
  }, [addToast]);

  const handleToggle = useCallback(
    (type: BusinessType) => {
      toggleBusinessType(type);
    },
    [toggleBusinessType],
  );

  const handlePlanChange = useCallback(
    (planId: PlanTier) => {
      updatePlan(planId);
      addToast(`Plano alterado para ${PLANS[planId].name}!`, "success");
    },
    [updatePlan, addToast],
  );

  const handleIntegrationToggle = useCallback(
    (id: string) => {
      toggleIntegration(id, "sk_test_123456");
      addToast("Status da integração atualizado", "info");
    },
    [toggleIntegration, addToast],
  );

  const handleTestPrint = useCallback(() => {
    const mockOrder = getMockOrders(config.businessTypes)[0];
    printOrderReceipt(mockOrder, config.printer);
    addToast("Enviado para impressão de teste", "success");
  }, [config.businessTypes, config.printer, addToast]);

  // Tab handlers
  const handleTabGeneral = useCallback(() => setActiveTab("general"), []);
  const handleTabPrinter = useCallback(() => setActiveTab("printer"), []);
  const handleTabIntegrations = useCallback(
    () => setActiveTab("integrations"),
    [],
  );
  const handleTabPlans = useCallback(() => setActiveTab("plans"), []);
  const handleTabTeam = useCallback(() => setActiveTab("team"), []);

  // Paper width handlers
  const handlePaperWidth58 = useCallback(() => {
    updateConfig({ printer: { ...config.printer, paperWidth: "58mm" } });
  }, [updateConfig, config.printer]);

  const handlePaperWidth80 = useCallback(() => {
    updateConfig({ printer: { ...config.printer, paperWidth: "80mm" } });
  }, [updateConfig, config.printer]);

  // Primary type handlers
  const handleSetDelivery = useCallback(
    () => setPrimaryType("delivery"),
    [setPrimaryType],
  );
  const handleSetReservation = useCallback(
    () => setPrimaryType("reservation"),
    [setPrimaryType],
  );
  const handleSetHotel = useCallback(
    () => setPrimaryType("hotel"),
    [setPrimaryType],
  );
  const handleSetTickets = useCallback(
    () => setPrimaryType("tickets"),
    [setPrimaryType],
  );
  const handleSetScheduling = useCallback(
    () => setPrimaryType("scheduling"),
    [setPrimaryType],
  );
  const handleSetEcommerce = useCallback(
    () => setPrimaryType("ecommerce"),
    [setPrimaryType],
  );

  // Toggle handlers
  const handleToggleDelivery = useCallback(
    () => handleToggle("delivery"),
    [handleToggle],
  );
  const handleToggleReservation = useCallback(
    () => handleToggle("reservation"),
    [handleToggle],
  );
  const handleToggleHotel = useCallback(
    () => handleToggle("hotel"),
    [handleToggle],
  );
  const handleToggleTickets = useCallback(
    () => handleToggle("tickets"),
    [handleToggle],
  );
  const handleToggleScheduling = useCallback(
    () => handleToggle("scheduling"),
    [handleToggle],
  );
  const handleToggleEcommerce = useCallback(
    () => handleToggle("ecommerce"),
    [handleToggle],
  );

  // Reset handler
  const handleReset = useCallback(() => {
    authorize("system:reset", () => {
      if (window.confirm("Tem certeza? Todos os dados serão apagados.")) {
        resetSystem();
      }
    });
  }, [authorize, resetSystem]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header Profile */}
      <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
          <Building2 className="w-10 h-10" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">
            Configurações da Loja
          </h2>
          <p className="text-zinc-400">
            Gerencie o perfil do seu negócio e preferências do sistema.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar pb-2 md:pb-0">
          <button
            onClick={handleTabGeneral}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === "general" ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
          >
            Geral
          </button>
          <button
            onClick={handleTabPrinter}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === "printer" ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
          >
            Impressão
          </button>
          <button
            onClick={handleTabIntegrations}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === "integrations" ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
          >
            Integrações
          </button>
          <button
            onClick={handleTabPlans}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === "plans" ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
          >
            Planos
          </button>
          <button
            onClick={handleTabTeam}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === "team" ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
          >
            Equipe
          </button>
        </div>
      </div>

      {/* TAB: PRINTER */}
      {activeTab === "printer" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Printer className="w-5 h-5 text-primary" />
                Configuração de Impressora Térmica
              </h3>

              <div className="space-y-6">
                {/* Paper Width */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Largura do Papel
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handlePaperWidth58}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${config.printer.paperWidth === "58mm" ? "border-primary bg-primary/10 text-primary" : "border-zinc-800 text-zinc-400 hover:border-primary/50"}`}
                    >
                      <FileText className="w-6 h-6" />
                      <span className="font-bold">58mm</span>
                      <span className="text-xs opacity-70">Padrão Mini</span>
                    </button>
                    <button
                      onClick={handlePaperWidth80}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${config.printer.paperWidth === "80mm" ? "border-primary bg-primary/10 text-primary" : "border-zinc-800 text-zinc-400 hover:border-primary/50"}`}
                    >
                      <FileText className="w-8 h-8" />
                      <span className="font-bold">80mm</span>
                      <span className="text-xs opacity-70">Padrão NFC-e</span>
                    </button>
                  </div>
                </div>

                {/* Header & Footer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Cabeçalho do Cupom
                    </label>
                    <input
                      type="text"
                      value={config.printer.customHeader}
                      onChange={(e) =>
                        updateConfig({
                          printer: {
                            ...config.printer,
                            customHeader: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Rodapé do Cupom
                    </label>
                    <input
                      type="text"
                      value={config.printer.customFooter}
                      onChange={(e) =>
                        updateConfig({
                          printer: {
                            ...config.printer,
                            customFooter: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-white"
                    />
                  </div>
                </div>

                {/* Copies & Font Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                      <Copy className="w-4 h-4" /> Número de Vias
                    </label>
                    <select
                      value={config.printer.copies}
                      onChange={(e) =>
                        updateConfig({
                          printer: {
                            ...config.printer,
                            copies: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-white"
                    >
                      <option value={1}>1 Via</option>
                      <option value={2}>2 Vias</option>
                      <option value={3}>3 Vias</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                      <Type className="w-4 h-4" /> Tamanho da Fonte
                    </label>
                    <select
                      value={config.printer.fontSize}
                      onChange={(e) =>
                        updateConfig({
                          printer: {
                            ...config.printer,
                            fontSize: e.target.value as any,
                          },
                        })
                      }
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-white"
                    >
                      <option value="small">Pequeno (Econômico)</option>
                      <option value="normal">Normal</option>
                      <option value="large">Grande (Acessível)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Automation Card */}
            <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20">
              <h3 className="text-lg font-bold text-white mb-4">Automação</h3>

              <label className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-primary/20 cursor-pointer hover:bg-zinc-800 transition-all">
                <div
                  className={`w-10 h-6 rounded-full relative transition-colors ${config.printer.autoPrintOnAccept ? "bg-primary" : "bg-zinc-700"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.printer.autoPrintOnAccept ? "left-5" : "left-1"}`}
                  ></div>
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={config.printer.autoPrintOnAccept}
                  onChange={(e) =>
                    updateConfig({
                      printer: {
                        ...config.printer,
                        autoPrintOnAccept: e.target.checked,
                      },
                    })
                  }
                />
                <div>
                  <span className="block text-sm font-bold text-white">
                    Imprimir ao Aceitar
                  </span>
                  <span className="block text-xs text-zinc-500">
                    Abre a janela de impressão automaticamente
                  </span>
                </div>
              </label>
            </div>

            {/* Test Print */}
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <h3 className="text-lg font-bold text-white mb-2">
                Teste de Impressão
              </h3>
              <p className="text-sm text-zinc-500 mb-4">
                Verifique se as margens e o tamanho do papel estão corretos.
              </p>
              <button
                onClick={handleTestPrint}
                className="w-full py-3 bg-zinc-800 border border-zinc-700 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir Teste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PLANS */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold text-white mb-2">
              Escolha o plano ideal para o seu negócio
            </h3>
            <p className="text-zinc-500">
              Faça upgrade para desbloquear mais segmentos de atuação e
              funcionalidades exclusivas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <PlanCard
              planId="starter"
              currentPlanId={config.plan}
              onSelect={handlePlanChange}
            />
            <PlanCard
              planId="pro"
              currentPlanId={config.plan}
              onSelect={handlePlanChange}
            />
            <PlanCard
              planId="enterprise"
              currentPlanId={config.plan}
              onSelect={handlePlanChange}
            />
          </div>
        </div>
      )}

      {/* TAB: INTEGRATIONS */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              Canais de Venda Externos
            </h3>
            <p className="text-sm text-zinc-500 mb-6">
              Conecte suas contas de marketplaces para receber todos os pedidos
              diretamente no UniManager.
            </p>

            <PremiumFeature
              minPlan="pro"
              fallback={
                <div className="p-8 text-center bg-zinc-900/50 rounded-xl border border-dashed border-zinc-700">
                  <Globe className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <h4 className="font-bold text-white">
                    Integrações Bloqueadas
                  </h4>
                  <p className="text-sm text-zinc-500 mb-4">
                    Faça upgrade para o plano PRO para conectar iFood, Booking e
                    outros.
                  </p>
                  <button
                    onClick={handleTabPlans}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm"
                  >
                    Ver Planos
                  </button>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.integrations.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onToggle={() => handleIntegrationToggle(integration.id)}
                  />
                ))}
              </div>
            </PremiumFeature>
          </div>

          <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20">
            <h4 className="font-bold text-white mb-2">
              API para Desenvolvedores
            </h4>
            <p className="text-sm text-primary mb-4">
              Deseja criar uma integração customizada? Utilize nossa API aberta.
            </p>
            <div className="flex gap-2">
              <code className="bg-zinc-900 px-3 py-1.5 rounded border border-primary/30 text-xs font-mono text-zinc-400 flex-1">
                https://api.unimanager.com/v1/orders/webhook
              </code>
              <button className="text-xs font-bold text-primary hover:underline">
                Copiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: TEAM */}
      {activeTab === "team" && <SettingsTeam />}

      {/* TAB: GENERAL */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Business Type */}
          <div className="lg:col-span-3 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Tipo Principal de Negócio
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Define a estrutura base do seu painel e funcionalidades
                    principais.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <BusinessTypeCard
                  type="delivery"
                  isSelected={config.primaryType === "delivery"}
                  icon={Truck}
                  onClick={handleSetDelivery}
                />
                <BusinessTypeCard
                  type="reservation"
                  isSelected={config.primaryType === "reservation"}
                  icon={UtensilsCrossed}
                  onClick={handleSetReservation}
                />
                <BusinessTypeCard
                  type="hotel"
                  isSelected={config.primaryType === "hotel"}
                  icon={BedDouble}
                  onClick={handleSetHotel}
                />
                <BusinessTypeCard
                  type="tickets"
                  isSelected={config.primaryType === "tickets"}
                  icon={Ticket}
                  onClick={handleSetTickets}
                />
                <BusinessTypeCard
                  type="scheduling"
                  isSelected={config.primaryType === "scheduling"}
                  icon={Calendar}
                  onClick={handleSetScheduling}
                />
                <BusinessTypeCard
                  type="ecommerce"
                  isSelected={config.primaryType === "ecommerce"}
                  icon={ShoppingBag}
                  onClick={handleSetEcommerce}
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-zinc-500" />
                    Extensões de Negócio (Secundários)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Adicione funcionalidades extras ao seu negócio. Seu plano{" "}
                    <strong>{PLANS[config.plan].name}</strong> permite até{" "}
                    <strong>{PLANS[config.plan].maxBusinessTypes}</strong>{" "}
                    extensões.
                  </p>
                </div>
                <button
                  onClick={handleTabPlans}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Aumentar Limite
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <BusinessTypeCard
                  type="delivery"
                  isSelected={config.businessTypes.includes("delivery")}
                  icon={Truck}
                  onClick={handleToggleDelivery}
                />
                <BusinessTypeCard
                  type="reservation"
                  isSelected={config.businessTypes.includes("reservation")}
                  icon={UtensilsCrossed}
                  onClick={handleToggleReservation}
                />
                <BusinessTypeCard
                  type="hotel"
                  isSelected={config.businessTypes.includes("hotel")}
                  icon={BedDouble}
                  onClick={handleToggleHotel}
                />
                <BusinessTypeCard
                  type="tickets"
                  isSelected={config.businessTypes.includes("tickets")}
                  icon={Ticket}
                  onClick={handleToggleTickets}
                />
                <BusinessTypeCard
                  type="scheduling"
                  isSelected={config.businessTypes.includes("scheduling")}
                  icon={Calendar}
                  onClick={handleToggleScheduling}
                />
                <BusinessTypeCard
                  type="ecommerce"
                  isSelected={config.businessTypes.includes("ecommerce")}
                  icon={ShoppingBag}
                  onClick={handleToggleEcommerce}
                />
              </div>
            </section>

            <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
              <h3 className="text-lg font-bold text-white mb-6">
                Detalhes do Estabelecimento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                    placeholder="Ex: Hotel Grand Plaza"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                >
                  Salvar Detalhes
                </button>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-red-900/10 p-6 rounded-2xl border border-red-900/20">
              <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Zona de Perigo
              </h3>
              <p className="text-sm text-red-300 mb-4">
                Se você deseja reiniciar todos os dados de demonstração
                (pedidos, catálogo e configurações), clique abaixo. Esta ação é
                irreversível.
              </p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-900/20 border border-red-900/30 text-red-400 font-bold rounded-lg hover:bg-red-900/40 transition-colors text-sm"
              >
                Resetar Sistema
              </button>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
