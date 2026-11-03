import React, { useState, useEffect } from 'react';
import { 
  Plus, Zap, CheckCircle2, 
  Layers, ArrowUpRight, AlertTriangle,
  Bot, Eye, EyeOff, Sparkles
} from 'lucide-react';
import { api, User, AIStatus, HelpDeskListItem } from '../api';
import { OnboardingWizardModal } from './OnboardingWizardModal';

interface DashboardProps {
  user: User;
  aiStatus: AIStatus | null;
  onRefreshAIStatus: () => void;
  onSelectDesk: (desk: HelpDeskListItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  aiStatus,
  onRefreshAIStatus,
  onSelectDesk,
}) => {
  const [helpDesks, setHelpDesks] = useState<HelpDeskListItem[]>([]);
  const [loadingDesks, setLoadingDesks] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  // AI Configuration state
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
        text: `Conexión verificada: ${res.latency_ms} ms (${provider.toUpperCase()})`,
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
    if (!confirm('¿Deseas desvincular tus credenciales de IA de esta cuenta?')) return;
    try {
      await api.disconnectAI();
      onRefreshAIStatus();
      setVaultMsg({ type: 'success', text: 'Credenciales desvinculadas exitosamente.' });
    } catch (err: any) {
      setVaultMsg({ type: 'error', text: err.message });
    }
  };

  const handleToggleDeskAI = async (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    try {
      await api.toggleDeskAI(slug);
      fetchDesks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
            Panel de Control
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Organización: <strong className="text-primary">{user.full_name}</strong> • Gestión de mesas de ayuda y asistencia inteligente
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowWizard(true)}
          className="craft-btn-primary shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Mesa de Ayuda
        </button>
      </div>

      {/* AI Configuration Section (Modern Bento Card) */}
      <div className="rounded-2xl border border-hairline bg-surface p-6 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b border-hairline gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-canvas border border-hairline text-rose-500 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-primary">
                  Conexión de Modelos de Inteligencia Artificial
                </h2>
                {aiStatus?.is_connected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Conectado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-500/10 text-secondary border border-hairline">
                    Sin vincular
                  </span>
                )}
              </div>
              <p className="text-xs text-secondary mt-0.5">
                Conecta tu propia cuenta para habilitar sugerencias automáticas y refinamiento de tickets con privacidad total.
              </p>
            </div>
          </div>

          {aiStatus?.is_connected && (
            <button
              type="button"
              onClick={handleDisconnectAI}
              className="craft-btn-secondary text-xs"
            >
              Desvincular Modelo
            </button>
          )}
        </div>

        {/* Feedback message */}
        {vaultMsg && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
              vaultMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
            }`}
          >
            {vaultMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{vaultMsg.text}</span>
          </div>
        )}

        {/* Form to connect AI Key */}
        <form onSubmit={handleConnectAI} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Provider Select */}
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">
                Proveedor de IA
              </label>
              <select
                value={provider}
                onChange={(e) => {
                  const p = e.target.value as any;
                  setProvider(p);
                  if (p === 'gemini') setSelectedModel('gemini-2.0-flash');
                  if (p === 'openai') setSelectedModel('gpt-4o-mini');
                  if (p === 'claude') setSelectedModel('claude-3-5-sonnet');
                }}
                className="craft-input w-full text-xs cursor-pointer"
              >
                <option value="gemini">Google Gemini (Recomendado)</option>
                <option value="openai">OpenAI</option>
                <option value="claude">Anthropic Claude</option>
              </select>
            </div>

            {/* Model Name */}
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">
                Modelo Seleccionado
              </label>
              <input
                type="text"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                placeholder="ej. gemini-2.0-flash"
                className="craft-input w-full text-xs"
              />
            </div>

            {/* API Key */}
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">
                Clave de API Privada
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Introduce tu clave privada..."
                  className="craft-input w-full text-xs pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-primary cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-secondary">
              Tus claves se cifran con AES-256 en tu propio entorno y nunca son compartidas.
            </span>
            <button
              type="submit"
              disabled={testingVault || !apiKey.trim()}
              className="craft-btn-primary text-xs disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              {testingVault ? 'Validando...' : 'Guardar y Vincular'}
            </button>
          </div>
        </form>
      </div>

      {/* Help Desks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-primary">
              Mesas de Ayuda Activas
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface border border-hairline text-secondary font-semibold">
              {helpDesks.length}
            </span>
          </div>
        </div>

        {loadingDesks ? (
          <div className="p-12 text-center text-xs text-secondary">
            Cargando espacios de trabajo...
          </div>
        ) : helpDesks.length === 0 ? (
          <div className="rounded-2xl border border-hairline bg-surface p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-canvas border border-hairline flex items-center justify-center mx-auto text-rose-500 shadow-xs">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary">No tienes mesas de ayuda activas</h3>
              <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
                Crea tu primera mesa de soporte para empezar a gestionar tickets con tu equipo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWizard(true)}
              className="craft-btn-primary shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Crear Primera Mesa
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {helpDesks.map((desk) => (
              <div
                key={desk.id}
                onClick={() => onSelectDesk(desk)}
                className="rounded-2xl border border-hairline bg-surface p-6 space-y-4 hover:border-rose-500/40 hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-canvas border border-hairline text-secondary uppercase tracking-wider">
                        {desk.role}
                      </span>
                      <h3 className="text-base font-bold text-primary mt-2 group-hover:text-rose-500 transition-colors">
                        {desk.name}
                      </h3>
                      <span className="text-xs text-secondary">
                        /{desk.slug}
                      </span>
                    </div>

                    {/* AI Toggle for Admins */}
                    {desk.role === 'admin' && (
                      <button
                        type="button"
                        onClick={(e) => handleToggleDeskAI(e, desk.slug)}
                        title={desk.is_ai_enabled ? 'Asistencia de IA Activa' : 'Operación Manual'}
                        className={`p-2 rounded-xl border cursor-pointer transition-all duration-150 ${
                          desk.is_ai_enabled
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-xs'
                            : 'bg-canvas border-hairline text-secondary hover:text-primary hover:border-zinc-400'
                        }`}
                      >
                        <Bot className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-secondary mt-3 line-clamp-2 leading-relaxed">
                    {desk.description || 'Mesa de ayuda para atención y gestión de incidencias.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-hairline space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-canvas border border-hairline shadow-xs">
                      <span className="text-[10px] text-secondary uppercase font-semibold block">Tickets</span>
                      <span className="font-extrabold text-primary text-sm mt-0.5 block">{desk.tickets_count}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-canvas border border-hairline shadow-xs">
                      <span className="text-[10px] text-secondary uppercase font-semibold block">Miembros</span>
                      <span className="font-extrabold text-primary text-sm mt-0.5 block">{desk.members_count}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-canvas border border-hairline shadow-xs">
                      <span className="text-[10px] text-secondary uppercase font-semibold block">Cumplimiento</span>
                      <span className="font-extrabold text-emerald-500 text-sm mt-0.5 block">{desk.sla_compliance_rate}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-secondary pt-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          desk.is_ai_enabled ? 'bg-emerald-500' : 'bg-zinc-400'
                        }`}
                      />
                      {desk.is_ai_enabled ? 'IA Activa' : 'Manual'}
                    </span>
                    <span className="text-primary font-semibold flex items-center gap-1 group-hover:text-rose-500 transition-colors">
                      Entrar a la Mesa <ArrowUpRight className="w-3.5 h-3.5" />
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
