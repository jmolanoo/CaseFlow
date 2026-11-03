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
    if (!confirm('¿Deseas desacoplar tus credenciales de IA de esta cuenta?')) return;
    try {
      await api.disconnectAI();
      onRefreshAIStatus();
      setVaultMsg({ type: 'success', text: 'Credenciales de IA desacopladas exitosamente.' });
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-hairline">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
            Panel de Control
          </h1>
          <p className="text-xs text-secondary mt-0.5">
            Organización: {user.full_name} • Gestión de mesas de ayuda y gobernanza BYOK
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowWizard(true)}
          className="craft-btn-primary"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva Mesa de Ayuda
        </button>
      </div>

      {/* BYOK Vault Section (Craft style Bento Card) */}
      <div className="rounded-xl border border-hairline bg-surface p-5 transition-all">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-hairline gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-canvas border border-hairline text-rose-500 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-primary font-mono">
                  Bóveda BYOK (Bring Your Own Key)
                </h2>
                {aiStatus?.is_connected ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Conectada
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-canvas border border-hairline text-secondary">
                    Modo Manual Activo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-secondary mt-0.5">
                Costo $0 de plataforma. Las llamadas a los modelos corren por cuenta del usuario. Cifrado AES-256 en reposo.
              </p>
            </div>
          </div>

          {aiStatus?.is_connected && (
            <button
              type="button"
              onClick={handleDisconnectAI}
              className="text-[11px] text-rose-500 hover:underline font-mono"
            >
              Desacoplar Clave
            </button>
          )}
        </div>

        {/* Vault Status or Form */}
        <div className="mt-4">
          {aiStatus?.is_connected ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-lg bg-canvas border border-hairline">
              <div>
                <span className="text-[10px] text-secondary font-mono uppercase block">Proveedor Activo</span>
                <span className="text-xs font-bold text-primary uppercase font-mono mt-0.5 block">
                  {aiStatus.provider}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-secondary font-mono uppercase block">Modelo Predeterminado</span>
                <span className="text-xs font-bold text-primary font-mono mt-0.5 block">
                  {aiStatus.model_name}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-secondary font-mono uppercase block">Última Latencia Medida</span>
                <span className="text-xs font-bold text-rose-500 font-mono mt-0.5 block">
                  {aiStatus.latency_ms} ms
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConnectAI} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['gemini', 'openai', 'claude'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setProvider(p);
                      setSelectedModel(
                        p === 'gemini' ? 'gemini-2.0-flash' : p === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet'
                      );
                    }}
                    className={`py-1.5 px-3 rounded-md text-xs font-mono font-medium border text-center transition-all ${
                      provider === p
                        ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                        : 'border-hairline bg-canvas text-secondary hover:text-primary'
                    }`}
                  >
                    {p === 'gemini' ? 'Google Gemini (Free)' : p === 'openai' ? 'OpenAI GPT-4o' : 'Anthropic Claude'}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Ingresa tu API Key de ${provider.toUpperCase()} (o 'test-gemini-demo-key')...`}
                    className="craft-input w-full pr-8 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-2.5 text-secondary hover:text-primary"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={testingVault || !apiKey}
                  className="craft-btn-primary text-xs shrink-0"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {testingVault ? 'Validando...' : 'Probar & Conectar Clave'}
                </button>
              </div>

              {vaultMsg && (
                <div
                  className={`p-2.5 rounded-md text-xs flex items-center gap-2 ${
                    vaultMsg.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
                  }`}
                >
                  {vaultMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span className="font-mono text-[11px]">{vaultMsg.text}</span>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Mesas de Ayuda (Help Desks Bento Section) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-500" />
            <h2 className="text-base font-bold text-primary tracking-tight">
              Mesas de Ayuda Disponibles
            </h2>
            <span className="px-1.5 py-0.5 rounded bg-surface border border-hairline text-secondary text-[10px] font-mono">
              {helpDesks.length}
            </span>
          </div>
        </div>

        {loadingDesks ? (
          <div className="py-12 text-center text-xs font-mono text-secondary">
            Cargando espacios de soporte...
          </div>
        ) : helpDesks.length === 0 ? (
          <div className="rounded-xl border border-hairline bg-surface p-10 text-center space-y-3">
            <Layers className="w-8 h-8 mx-auto text-secondary" />
            <div>
              <h3 className="text-sm font-bold text-primary">No hay mesas de ayuda creadas</h3>
              <p className="text-xs text-secondary max-w-sm mx-auto mt-0.5">
                Utiliza el Onboarding Wizard para crear tu primera mesa de soporte en segundos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWizard(true)}
              className="craft-btn-primary"
            >
              <Plus className="w-3.5 h-3.5" />
              Lanzar Onboarding Wizard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {helpDesks.map((desk) => (
              <div
                key={desk.id}
                onClick={() => onSelectDesk(desk)}
                className="rounded-xl border border-hairline bg-surface p-5 space-y-4 hover:border-zinc-400 dark:hover:border-zinc-700 cursor-pointer transition-colors group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-canvas border border-hairline text-secondary uppercase">
                        {desk.role}
                      </span>
                      <h3 className="text-sm font-bold text-primary mt-1.5 group-hover:text-rose-500 transition-colors">
                        {desk.name}
                      </h3>
                      <span className="text-[11px] font-mono text-secondary">
                        /{desk.slug}
                      </span>
                    </div>

                    {/* AI Toggle for Admins */}
                    {desk.role === 'admin' && (
                      <button
                        type="button"
                        onClick={(e) => handleToggleDeskAI(e, desk.slug)}
                        title={desk.is_ai_enabled ? 'IA Habilitada en esta mesa' : 'IA Desactivada en esta mesa'}
                        className={`p-1.5 rounded-md border transition-all ${
                          desk.is_ai_enabled
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                            : 'bg-canvas border-hairline text-secondary hover:text-primary'
                        }`}
                      >
                        <Bot className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-secondary mt-2 line-clamp-2 leading-relaxed">
                    {desk.description || 'Sin descripción adicional.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-hairline space-y-3">
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-mono">
                    <div className="p-1.5 rounded bg-canvas border border-hairline">
                      <span className="text-[9px] text-secondary uppercase block">Tickets</span>
                      <span className="font-bold text-primary text-xs">{desk.tickets_count}</span>
                    </div>
                    <div className="p-1.5 rounded bg-canvas border border-hairline">
                      <span className="text-[9px] text-secondary uppercase block">Miembros</span>
                      <span className="font-bold text-primary text-xs">{desk.members_count}</span>
                    </div>
                    <div className="p-1.5 rounded bg-canvas border border-hairline">
                      <span className="text-[9px] text-secondary uppercase block">SLA Rate</span>
                      <span className="font-bold text-emerald-500 text-xs">{desk.sla_compliance_rate}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-secondary font-mono pt-1">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          desk.is_ai_enabled ? 'bg-emerald-500' : 'bg-zinc-400'
                        }`}
                      />
                      {desk.is_ai_enabled ? 'IA Activa' : 'Manual'}
                    </span>
                    <span className="text-primary font-medium flex items-center gap-1 group-hover:text-rose-500 transition-colors">
                      Entrar al Workspace <ArrowUpRight className="w-3.5 h-3.5" />
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
