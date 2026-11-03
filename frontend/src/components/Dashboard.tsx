import React, { useState, useEffect } from 'react';
import { 
  Plus, Key, Zap, CheckCircle2, 
  Layers, ArrowUpRight, AlertTriangle,
  Bot, Eye, EyeOff
} from 'lucide-react';
import { api, User, AIStatus, HelpDeskListItem } from '../api';
import { OnboardingWizardModal } from './OnboardingWizardModal';

interface DashboardProps {
  user: User;
  aiStatus: AIStatus | null;
  onRefreshAIStatus: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  aiStatus,
  onRefreshAIStatus,
}) => {
  const [helpDesks, setHelpDesks] = useState<HelpDeskListItem[]>([]);
  const [loadingDesks, setLoadingDesks] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  // BYOK Form state
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'claude'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [testingVault, setTestingVault] = useState(false);
  const [vaultMsg, setVaultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDesks = async () => {
    setLoadingDesks(true);
    try {
      const data = await api.getMyHelpDesks();
      setHelpDesks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDesks(false);
    }
  };

  useEffect(() => {
    fetchDesks();
  }, []);

  const handleConnectAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setTestingVault(true);
    setVaultMsg(null);

    try {
      const res = await api.connectAIKey(provider, apiKey, selectedModel);
      setVaultMsg({
        type: 'success',
        text: `¡Conexión validada! Latencia calculada: ${res.latency_ms} ms (${provider.toUpperCase()})`,
      });
      setApiKey('');
      onRefreshAIStatus();
    } catch (err: any) {
      setVaultMsg({
        type: 'error',
        text: err.message || 'No se pudo validar la clave contra el proveedor.',
      });
    } finally {
      setTestingVault(false);
    }
  };

  const handleDisconnectAI = async () => {
    if (!confirm('¿Deseas desacoplar tus credenciales de IA de esta cuenta?')) return;
    try {
      await api.disconnectAI();
      onRefreshAIStatus();
      setVaultMsg({ type: 'success', text: 'Credenciales de IA desacopladas exitosamente.' });
    } catch (err: any) {
      setVaultMsg({ type: 'error', text: err.message });
    }
  };

  const handleToggleDeskAI = async (slug: string) => {
    try {
      await api.toggleDeskAI(slug);
      fetchDesks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            Hola, {user.full_name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Panel de control central • Espacios de trabajo y gobernanza de tickets
          </p>
        </div>

        <button
          onClick={() => setShowWizard(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-rose-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva Mesa de Ayuda
        </button>
      </div>

      {/* BYOK Vault Section (Bento Card) */}
      <div className="rounded-2xl border border-hairline bg-surface p-6 shadow-sm relative overflow-hidden transition-all">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-hairline gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-primary">Bóveda de Conexión IA (BYOK Vault)</h2>
                {aiStatus?.is_connected ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    CONECTADO ({aiStatus.provider?.toUpperCase()})
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-zinc-500/10 text-secondary border border-hairline">
                    MODO MANUAL (COSTO $0)
                  </span>
                )}
              </div>
              <p className="text-xs text-secondary mt-0.5">
                Arquitectura Bring Your Own Key • Cifrado AES-256 en reposo • Sin costos de plataforma
              </p>
            </div>
          </div>

          {aiStatus?.is_connected && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-mono text-secondary block">Latencia Medida</span>
                <span className="text-xs font-mono font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                  {aiStatus.latency_ms} ms
                </span>
              </div>
              <button
                onClick={handleDisconnectAI}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-hairline bg-canvas text-secondary hover:text-rose-500 hover:border-rose-500/30 transition-all"
              >
                Desconectar
              </button>
            </div>
          )}
        </div>

        {vaultMsg && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
              vaultMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
            }`}
          >
            {vaultMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{vaultMsg.text}</span>
          </div>
        )}

        {/* If not connected, show connection form */}
        {!aiStatus?.is_connected && (
          <form onSubmit={handleConnectAI} className="mt-5 space-y-4">
            {/* Provider Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setProvider('gemini');
                  setSelectedModel('gemini-2.0-flash');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === 'gemini'
                    ? 'border-rose-500 bg-rose-500/5 shadow-sm'
                    : 'border-hairline bg-canvas/60 hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Google Gemini</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold">
                    Gratis / Free Tier
                  </span>
                </div>
                <p className="text-[11px] text-secondary mt-1">
                  Recomendado para la plataforma. Compatible con AI Studio sin tarjeta de crédito.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('openai');
                  setSelectedModel('gpt-4o-mini');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === 'openai'
                    ? 'border-rose-500 bg-rose-500/5 shadow-sm'
                    : 'border-hairline bg-canvas/60 hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">OpenAI</span>
                  <span className="text-[10px] font-mono text-secondary">Pay-as-you-go</span>
                </div>
                <p className="text-[11px] text-secondary mt-1">
                  Modelos GPT-4o y GPT-4o Mini con alta precisión en estructuración.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('claude');
                  setSelectedModel('claude-3-5-sonnet-20241022');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === 'claude'
                    ? 'border-rose-500 bg-rose-500/5 shadow-sm'
                    : 'border-hairline bg-canvas/60 hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Anthropic Claude</span>
                  <span className="text-[10px] font-mono text-secondary">Pay-as-you-go</span>
                </div>
                <p className="text-[11px] text-secondary mt-1">
                  Claude 3.5 Sonnet / Haiku líderes en redacción de soporte técnico.
                </p>
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 relative">
                <label className="block text-xs font-medium text-secondary mb-1">
                  API Key del Proveedor ({provider.toUpperCase()})
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      provider === 'gemini'
                        ? 'AIzaSy...'
                        : provider === 'openai'
                        ? 'sk-proj-...'
                        : 'sk-ant-...'
                    }
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-lg bg-canvas border border-hairline text-primary focus:outline-none focus:border-rose-500 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-2 text-secondary hover:text-primary"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary mb-1">Modelo de Inferencia</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-canvas border border-hairline text-primary focus:outline-none focus:border-rose-500"
                >
                  {provider === 'gemini' && (
                    <>
                      <option value="gemini-2.0-flash">gemini-2.0-flash (Recomendado)</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    </>
                  )}
                  {provider === 'openai' && (
                    <>
                      <option value="gpt-4o-mini">gpt-4o-mini (Económico)</option>
                      <option value="gpt-4o">gpt-4o (Avanzado)</option>
                    </>
                  )}
                  {provider === 'claude' && (
                    <>
                      <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet</option>
                      <option value="claude-3-5-haiku-20241022">claude-3-5-haiku</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-secondary">
                * Las claves se prueban en vivo con un ping real y se cifran con AES antes de guardarse.
              </span>
              <button
                type="submit"
                disabled={testingVault || !apiKey.trim()}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white transition-all flex items-center gap-2 shadow-sm shadow-rose-500/20"
              >
                {testingVault ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                {testingVault ? 'Comprobando Latencia...' : 'Probar & Conectar Clave'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Help Desks Bento Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-500" />
            Mis Help Desks Activos
          </h2>
          <span className="text-xs font-mono text-secondary">
            {helpDesks.length} {helpDesks.length === 1 ? 'espacio' : 'espacios'}
          </span>
        </div>

        {loadingDesks ? (
          <div className="p-12 text-center text-xs text-secondary font-mono">
            Cargando espacios de soporte...
          </div>
        ) : helpDesks.length === 0 ? (
          <div className="rounded-2xl border border-hairline border-dashed bg-surface p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary">No tienes ninguna mesa de ayuda creada</h3>
              <p className="text-xs text-secondary max-w-md mx-auto mt-1">
                Utiliza el Onboarding Wizard para crear tu primer Help Desk en menos de un minuto.
              </p>
            </div>
            <button
              onClick={() => setShowWizard(true)}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm shadow-rose-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Lanzar Onboarding Wizard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpDesks.map((desk) => (
              <div
                key={desk.id}
                className="rounded-2xl border border-hairline bg-surface p-6 space-y-4 hover:border-rose-500/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-canvas border border-hairline text-secondary uppercase">
                        {desk.role}
                      </span>
                      <h3 className="text-base font-bold text-primary mt-1.5 group-hover:text-rose-500 transition-colors">
                        {desk.name}
                      </h3>
                      <span className="text-[11px] font-mono text-secondary">
                        /{desk.slug}
                      </span>
                    </div>

                    {/* AI Toggle for Admins */}
                    {desk.role === 'admin' && (
                      <button
                        onClick={() => handleToggleDeskAI(desk.slug)}
                        title={desk.is_ai_enabled ? 'IA Habilitada en esta mesa' : 'IA Desactivada en esta mesa'}
                        className={`p-1.5 rounded-lg border transition-all ${
                          desk.is_ai_enabled
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                            : 'bg-canvas border-hairline text-zinc-400'
                        }`}
                      >
                        <Bot className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-secondary mt-2 line-clamp-2">
                    {desk.description || 'Sin descripción adicional.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-hairline space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2 rounded bg-canvas border border-hairline">
                      <span className="text-[10px] text-secondary block">Tickets</span>
                      <span className="font-bold text-primary">{desk.tickets_count}</span>
                    </div>
                    <div className="p-2 rounded bg-canvas border border-hairline">
                      <span className="text-[10px] text-secondary block">Miembros</span>
                      <span className="font-bold text-primary">{desk.members_count}</span>
                    </div>
                    <div className="p-2 rounded bg-canvas border border-hairline">
                      <span className="text-[10px] text-secondary block">SLA Rate</span>
                      <span className="font-bold text-emerald-500">{desk.sla_compliance_rate}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-secondary font-mono pt-1">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          desk.is_ai_enabled ? 'bg-emerald-500' : 'bg-zinc-400'
                        }`}
                      />
                      {desk.is_ai_enabled ? 'IA Activa' : 'Manual'}
                    </span>
                    <span className="text-primary font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Entrar al Workspace <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Onboarding Wizard Modal */}
      {showWizard && (
        <OnboardingWizardModal
          onClose={() => setShowWizard(false)}
          onSuccess={() => {
            fetchDesks();
          }}
        />
      )}
    </div>
  );
};
