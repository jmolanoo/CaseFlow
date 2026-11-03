import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, 
  Bot, Check, BookOpen, 
  RefreshCw, AlertCircle, ChevronRight, CheckCircle2,
  ShieldCheck, Eye, EyeOff, Sliders, CheckSquare, Square,
  Users, Link2, Copy, Trash2, AlertTriangle, Key, Sparkles, Loader2,
  UserCheck, UserX
} from 'lucide-react';
import { 
  api, HelpDeskDetails, TicketItem, 
  AIFeatureToggle, User as UserModel,
  HelpDeskMemberItem, HelpDeskInvitationItem,
  AIStatus
} from '../api';
import { TicketCreateModal } from './TicketCreateModal';
import { TicketDetailModal } from './TicketDetailModal';
import { RetrospectiveIngestionModal } from './RetrospectiveIngestionModal';

interface WorkspaceViewProps {
  slug: string;
  currentUser?: UserModel | null;
  onBackToDashboard: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  slug,
  currentUser,
  onBackToDashboard,
}) => {
  const [desk, setDesk] = useState<HelpDeskDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tickets' | 'members' | 'ai' | 'context' | 'governance'>('tickets');

  // Tickets state & filters
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [catFilter, setCatFilter] = useState<number | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<number | undefined>(undefined);
  const [slaFilter, setSlaFilter] = useState<string>('all');
  const [selectedTicketCode, setSelectedTicketCode] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Members & Invitations state (Sprint 4)
  const [members, setMembers] = useState<HelpDeskMemberItem[]>([]);
  const [invitations, setInvitations] = useState<HelpDeskInvitationItem[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showCreateInviteModal, setShowCreateInviteModal] = useState(false);
  const [inviteRole, setInviteRole] = useState<'requester' | 'agent' | 'admin'>('requester');
  const [inviteLabel, setInviteLabel] = useState('');
  const [inviteMaxUses, setInviteMaxUses] = useState<number | undefined>(undefined);
  const [inviteExpiresDays, setInviteExpiresDays] = useState<number | undefined>(7);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Desk-Specific AI Vault state (Sprint 4)
  const [deskAIStatus, setDeskAIStatus] = useState<AIStatus | null>(null);
  const [aiProvider, setAIProvider] = useState<'gemini' | 'openai' | 'claude'>('gemini');
  const [aiApiKey, setAIApiKey] = useState('');
  const [showAIKey, setShowAIKey] = useState(false);
  const [selectedAIModel, setSelectedAIModel] = useState('gemini-2.0-flash');
  const [testingDeskAI, setTestingDeskAI] = useState(false);
  const [deskAIMsg, setDeskAIMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Context state
  const [contextContent, setContextContent] = useState('');
  const [savingContext, setSavingContext] = useState(false);
  const [contextSaved, setContextSaved] = useState(false);
  const [showIngestModal, setShowIngestModal] = useState(false);

  // Governance & AI Feature Toggles state
  const [toggles, setToggles] = useState<AIFeatureToggle[]>([]);
  const [savingToggles, setSavingToggles] = useState(false);
  const [togglesSavedFeedback, setTogglesSavedFeedback] = useState(false);

  const fetchDeskAndTickets = async () => {
    try {
      const deskData = await api.getDeskDetails(slug);
      setDesk(deskData);
      const ticketsData = await api.getTickets(slug, statusFilter, catFilter, priorityFilter, slaFilter);
      setTickets(ticketsData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembersAndInvitations = async () => {
    setLoadingMembers(true);
    try {
      const membersData = await api.getDeskMembers(slug);
      setMembers(membersData);
      if (desk?.user_role === 'admin') {
        const invData = await api.getDeskInvitations(slug);
        setInvitations(invData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchDeskAI = async () => {
    try {
      const statusData = await api.getDeskAIStatus(slug);
      setDeskAIStatus(statusData);
      if (statusData.is_connected && statusData.provider) {
        setAIProvider(statusData.provider);
        if (statusData.model_name) {
          setSelectedAIModel(statusData.model_name);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContext = async () => {
    try {
      const data = await api.getDeskContext(slug);
      setContextContent(data.content);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchToggles = async () => {
    try {
      const data = await api.getAIToggles(slug);
      setToggles(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDeskAndTickets();
  }, [slug, statusFilter, catFilter, priorityFilter, slaFilter]);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembersAndInvitations();
    } else if (activeTab === 'ai') {
      fetchDeskAI();
    } else if (activeTab === 'context') {
      fetchContext();
    } else if (activeTab === 'governance') {
      fetchToggles();
    }
  }, [activeTab, slug]);

  const handleSaveContext = async () => {
    setSavingContext(true);
    try {
      await api.updateDeskContext(slug, contextContent);
      setContextSaved(true);
      setTimeout(() => setContextSaved(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingContext(false);
    }
  };

  const handleToggleChange = async (
    featureName: string, 
    field: 'is_enabled' | 'role_requester' | 'role_agent' | 'role_admin'
  ) => {
    const updatedList = toggles.map((t) => {
      if (t.feature_name === featureName) {
        return { ...t, [field]: !t[field] };
      }
      return t;
    });
    setToggles(updatedList);

    setSavingToggles(true);
    try {
      const saved = await api.updateAIToggles(slug, updatedList);
      setToggles(saved);
      setTogglesSavedFeedback(true);
      setTimeout(() => setTogglesSavedFeedback(false), 2500);
    } catch (err: any) {
      alert(err.message);
      fetchToggles();
    } finally {
      setSavingToggles(false);
    }
  };

  // Member Management handlers
  const handleUpdateMemberRole = async (userId: number, newRole: string) => {
    try {
      await api.updateDeskMember(slug, userId, { role: newRole });
      fetchMembersAndInvitations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleMemberActive = async (userId: number, currentActive: boolean) => {
    const action = currentActive ? 'desactivar' : 'reactivar';
    if (!confirm(`¿Estás seguro de que deseas ${action} a este usuario en la mesa de ayuda?`)) return;
    try {
      await api.updateDeskMember(slug, userId, { is_active: !currentActive });
      fetchMembersAndInvitations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveMember = async (userId: number, name: string) => {
    if (!confirm(`¿Deseas eliminar a ${name} de esta mesa de ayuda? Tendrá que volver a unirse mediante un enlace.`)) return;
    try {
      await api.removeDeskMember(slug, userId);
      fetchMembersAndInvitations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Invitation handlers
  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingInvite(true);
    try {
      await api.createDeskInvitation(slug, {
        role: inviteRole,
        label: inviteLabel.trim() || undefined,
        max_uses: inviteMaxUses,
        expires_days: inviteExpiresDays,
      });
      setShowCreateInviteModal(false);
      setInviteLabel('');
      setInviteMaxUses(undefined);
      fetchMembersAndInvitations();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleCopyInviteLink = (code: string) => {
    const fullUrl = `${window.location.origin}/?join=${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleToggleInvitation = async (invId: number) => {
    try {
      await api.toggleDeskInvitation(slug, invId);
      fetchMembersAndInvitations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteInvitation = async (invId: number) => {
    if (!confirm('¿Deseas eliminar permanentemente este enlace de invitación?')) return;
    try {
      await api.deleteDeskInvitation(slug, invId);
      fetchMembersAndInvitations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Desk AI Vault Handlers
  const handleConnectDeskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiApiKey.trim()) return;
    setTestingDeskAI(true);
    setDeskAIMsg(null);

    try {
      const res = await api.connectDeskAIKey(slug, aiProvider, aiApiKey, selectedAIModel);
      setDeskAIMsg({
        type: 'success',
        text: `Conexión verificada: ${res.latency_ms} ms (${aiProvider.toUpperCase()}) para ${desk?.name}`,
      });
      setAIApiKey('');
      fetchDeskAI();
      fetchDeskAndTickets();
    } catch (err: any) {
      setDeskAIMsg({
        type: 'error',
        text: err.message || 'No se pudo validar la clave contra el proveedor.',
      });
    } finally {
      setTestingDeskAI(false);
    }
  };

  const handleDisconnectDeskAI = async () => {
    if (!confirm(`¿Deseas desvincular las credenciales de IA exclusivamente para ${desk?.name}?`)) return;
    try {
      await api.disconnectDeskAI(slug);
      fetchDeskAI();
      fetchDeskAndTickets();
      setDeskAIMsg({ type: 'success', text: 'Credenciales desvinculadas de esta mesa de ayuda.' });
    } catch (err: any) {
      setDeskAIMsg({ type: 'error', text: err.message });
    }
  };

  // Metrics calculation
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-xs text-secondary">
        Cargando espacio de trabajo...
      </div>
    );
  }

  if (!desk) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-rose-500" />
        <h2 className="text-base font-bold text-primary">No se encontró la mesa de ayuda</h2>
        <button onClick={onBackToDashboard} className="craft-btn-secondary text-xs">
          Volver al Panel
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fade-in">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-hairline">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="craft-btn-secondary text-xs py-1.5 px-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Panel Principal
          </button>
          <span className="text-secondary text-xs">/</span>
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-primary">{desk.name}</h1>
            <span className="text-xs text-secondary font-mono">/{desk.slug}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface border border-hairline text-secondary uppercase tracking-wider">
            {desk.user_role === 'admin' ? 'Administrador' : (desk.user_role === 'agent' ? 'Soporte / Agente' : 'Usuario / Solicitante')}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
              desk.is_ai_enabled
                ? 'bg-rose-500/10 border-rose-500/25 text-rose-500'
                : 'bg-surface border-hairline text-secondary'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            {desk.is_ai_enabled ? 'Asistencia IA Activa' : 'Operación Manual'}
          </span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-hairline pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all duration-150 whitespace-nowrap ${
            activeTab === 'tickets'
              ? 'bg-rose-500 text-white shadow-xs scale-[1.02]'
              : 'text-secondary hover:text-primary hover:bg-surface'
          }`}
        >
          Tickets e Incidencias ({tickets.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'members'
              ? 'bg-rose-500 text-white shadow-xs scale-[1.02]'
              : 'text-secondary hover:text-primary hover:bg-surface'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Usuarios e Invitaciones
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ai'
              ? 'bg-rose-500 text-white shadow-xs scale-[1.02]'
              : 'text-secondary hover:text-primary hover:bg-surface'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-300" />
          Conexión de IA (BYOK)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('context')}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'context'
              ? 'bg-rose-500 text-white shadow-xs scale-[1.02]'
              : 'text-secondary hover:text-primary hover:bg-surface'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Memoria de Soporte
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('governance')}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'governance'
              ? 'bg-rose-500 text-white shadow-xs scale-[1.02]'
              : 'text-secondary hover:text-primary hover:bg-surface'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Gobernanza & SLAs
        </button>
      </div>

      {/* Tab 1: Tickets Console */}
      {activeTab === 'tickets' && (
        <div className="space-y-6 animate-fade-in">
          {/* Workload Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-xl border border-hairline bg-surface p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                Total de Casos
              </span>
              <span className="text-xl font-extrabold text-primary block">
                {totalCount}
              </span>
            </div>

            <div className="rounded-xl border border-hairline bg-surface p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                En Atención
              </span>
              <span className="text-xl font-extrabold text-rose-500 block">
                {openCount}
              </span>
            </div>

            <div className="rounded-xl border border-hairline bg-surface p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                Casos Resueltos
              </span>
              <span className="text-xl font-extrabold text-emerald-500 block">
                {resolvedCount}
              </span>
            </div>

            <div className="rounded-xl border border-hairline bg-surface p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                Cumplimiento SLA
              </span>
              <span className="text-xl font-extrabold text-primary block">
                {totalCount > 0 ? `${Math.round((resolvedCount / totalCount) * 100)}%` : '100%'}
              </span>
            </div>
          </div>

          {/* Controls Bar: Multi-layered Filters */}
          <div className="p-4 rounded-2xl border border-hairline bg-surface space-y-3.5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'Todos los Estados' },
                  { id: 'open', label: 'Abiertos' },
                  { id: 'in_progress', label: 'En Progreso' },
                  { id: 'waiting', label: 'En Espera' },
                  { id: 'resolved', label: 'Resueltos' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setStatusFilter(filter.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150 whitespace-nowrap ${
                      statusFilter === filter.id
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 amoled:bg-rose-500 amoled:text-white shadow-xs scale-[1.02]'
                        : 'bg-canvas border border-hairline text-secondary hover:text-primary'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="craft-btn-primary text-xs shadow-sm whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Radicar Caso
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-hairline">
              <select
                value={catFilter ?? ''}
                onChange={(e) => setCatFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                className="craft-input text-xs py-1.5 cursor-pointer max-w-xs"
              >
                <option value="">Todas las Categorías</option>
                {desk.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter ?? ''}
                onChange={(e) => setPriorityFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                className="craft-input text-xs py-1.5 cursor-pointer max-w-xs"
              >
                <option value="">Todas las Prioridades</option>
                {desk.priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sla_resolution_hours}h)
                  </option>
                ))}
              </select>

              <select
                value={slaFilter}
                onChange={(e) => setSlaFilter(e.target.value)}
                className="craft-input text-xs py-1.5 cursor-pointer max-w-xs"
              >
                <option value="all">Todos los SLAs</option>
                <option value="within">Dentro de Plazo</option>
                <option value="breached">SLA Excedido</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          {tickets.length === 0 ? (
            <div className="rounded-2xl border border-hairline bg-surface p-12 text-center space-y-3">
              <TicketItemIcon className="w-8 h-8 mx-auto text-secondary" />
              <div className="text-sm font-bold text-primary">No se encontraron tickets con los filtros actuales</div>
              <p className="text-xs text-secondary">Ajusta los criterios de búsqueda o radica un nuevo caso.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketCode(t.ticket_code)}
                  className="rounded-2xl border border-hairline bg-surface p-4 hover:border-rose-500/40 hover:shadow-md cursor-pointer transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-rose-500">{t.ticket_code}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                        t.status === 'open' ? 'text-blue-500 border-blue-500/30 bg-blue-500/5' :
                        t.status === 'in_progress' ? 'text-amber-500 border-amber-500/30 bg-amber-500/5' :
                        t.status === 'resolved' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5' :
                        'text-secondary border-hairline bg-canvas'
                      }`}>
                        {t.status}
                      </span>
                      <span className="text-xs text-secondary font-medium">• {t.category_name}</span>
                    </div>
                    <h4 className="text-sm font-bold text-primary group-hover:text-rose-500 transition-colors">
                      {t.title}
                    </h4>
                    <p className="text-xs text-secondary line-clamp-1">{t.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-secondary shrink-0">
                    <div className="text-right">
                      <span className="block font-semibold text-primary">{t.requester_name}</span>
                      <span className="block text-[11px]">{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Members & Custom Invitations (Sprint 4) */}
      {activeTab === 'members' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
            <div>
              <h2 className="text-lg font-bold text-primary tracking-tight">
                Gestión de Usuarios y Enlaces de Invitación
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                Los usuarios se unen mediante enlaces de invitación configurados con roles preestablecidos
              </p>
            </div>

            {desk.user_role === 'admin' && (
              <button
                type="button"
                onClick={() => setShowCreateInviteModal(true)}
                className="craft-btn-primary text-xs shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Crear Enlace de Invitación
              </button>
            )}
          </div>

          {/* Section A: Active Invitation Links (Custom Roles) */}
          {desk.user_role === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-primary">Enlaces de Invitación Personalizados</h3>
                </div>
                <span className="text-xs text-secondary">
                  {invitations.length} {invitations.length === 1 ? 'enlace activo' : 'enlaces activos'}
                </span>
              </div>

              {invitations.length === 0 ? (
                <div className="rounded-2xl border border-hairline bg-surface p-8 text-center space-y-2">
                  <p className="text-xs text-secondary">No hay enlaces de invitación generados.</p>
                  <button
                    type="button"
                    onClick={() => setShowCreateInviteModal(true)}
                    className="craft-btn-secondary text-xs mx-auto"
                  >
                    Crear el primer enlace
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {invitations.map((inv) => {
                    const roleLabel = 
                      inv.role === 'agent' ? 'Soporte / Agente' :
                      inv.role === 'admin' ? 'Administrador' : 'Usuario / Solicitante';
                    const roleColor = 
                      inv.role === 'agent' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' :
                      inv.role === 'admin' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' :
                      'text-zinc-500 bg-canvas border-hairline';

                    return (
                      <div
                        key={inv.id}
                        className={`rounded-2xl border p-4 space-y-3 transition-all ${
                          inv.is_active ? 'border-hairline bg-surface shadow-xs' : 'border-zinc-500/20 bg-canvas opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${roleColor}`}>
                              Ingreso como {roleLabel}
                            </span>
                            <h4 className="text-sm font-bold text-primary mt-1.5">
                              {inv.label || 'Enlace de acceso a la mesa'}
                            </h4>
                          </div>

                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            inv.is_active ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-zinc-400 border-hairline bg-canvas'
                          }`}>
                            {inv.is_active ? 'Activo' : 'Pausado'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-secondary pt-1 border-t border-hairline">
                          <span>Usos: <strong>{inv.uses_count}</strong> {inv.max_uses ? `/ ${inv.max_uses}` : '(ilimitado)'}</span>
                          <span className="font-mono text-[11px]">{inv.code}</span>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
                          <button
                            type="button"
                            onClick={() => handleCopyInviteLink(inv.code)}
                            className="craft-btn-secondary text-xs py-1.5 px-3"
                          >
                            {copiedCode === inv.code ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-500">¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copiar Enlace
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleInvitation(inv.id)}
                            className="craft-btn-secondary text-xs py-1.5 px-3 text-secondary hover:text-primary"
                            title={inv.is_active ? 'Pausar enlace' : 'Reactivar enlace'}
                          >
                            {inv.is_active ? 'Pausar' : 'Reanudar'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteInvitation(inv.id)}
                            className="p-1.5 rounded-xl border border-hairline text-secondary hover:text-rose-500 hover:border-rose-500/30 transition-colors"
                            title="Eliminar enlace"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section B: Desk Members Directory */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-primary">Miembros de la Mesa de Ayuda</h3>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Buscar por nombre o correo..."
                  className="craft-input text-xs py-1.5 w-full"
                />
              </div>
            </div>

            {loadingMembers ? (
              <div className="p-8 text-center text-xs text-secondary">Cargando directorio de miembros...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-8 rounded-2xl border border-hairline bg-surface text-center text-xs text-secondary">
                No se encontraron miembros con el criterio de búsqueda.
              </div>
            ) : (
              <div className="rounded-2xl border border-hairline bg-surface overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-canvas border-b border-hairline text-secondary font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Usuario</th>
                      <th className="py-3 px-4">Rol Asignado</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Fecha de Ingreso</th>
                      {desk.user_role === 'admin' && (
                        <th className="py-3 px-4 text-right">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {filteredMembers.map((m) => {
                      return (
                        <tr key={m.id} className="hover:bg-canvas/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-canvas border border-hairline flex items-center justify-center font-bold text-primary shadow-xs">
                                {m.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-primary block">{m.full_name}</span>
                                <span className="text-[11px] text-secondary block">{m.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {desk.user_role === 'admin' ? (
                              <select
                                value={m.role}
                                onChange={(e) => handleUpdateMemberRole(m.user_id, e.target.value)}
                                className="craft-input text-xs py-1 px-2.5 font-medium cursor-pointer"
                              >
                                <option value="requester">Usuario / Solicitante</option>
                                <option value="agent">Soporte / Agente</option>
                                <option value="admin">Administrador</option>
                              </select>
                            ) : (
                              <span className="font-bold text-primary uppercase text-[11px]">
                                {m.role}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              m.is_active
                                ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                                : 'text-zinc-400 border-hairline bg-canvas'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${m.is_active ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                              {m.is_active ? 'Activo' : 'Desactivado'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-secondary">
                            {new Date(m.created_at).toLocaleDateString()}
                          </td>

                          {desk.user_role === 'admin' && (
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleMemberActive(m.user_id, m.is_active)}
                                  className={`p-1.5 rounded-xl border border-hairline transition-colors ${
                                    m.is_active
                                      ? 'text-secondary hover:text-amber-500 hover:border-amber-500/30'
                                      : 'text-emerald-500 hover:text-emerald-600 hover:border-emerald-500/30'
                                  }`}
                                  title={m.is_active ? 'Desactivar usuario' : 'Reactivar usuario'}
                                >
                                  {m.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(m.user_id, m.full_name)}
                                  className="p-1.5 rounded-xl border border-hairline text-secondary hover:text-rose-500 hover:border-rose-500/30 transition-colors"
                                  title="Eliminar de la mesa"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Desk-Specific AI Vault (BYOK) (Sprint 4) */}
      {activeTab === 'ai' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="pb-4 border-b border-hairline">
            <h2 className="text-lg font-bold text-primary tracking-tight">
              Bóveda BYOK — Conexión de IA para {desk.name}
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Configura claves de API de Google Gemini, Anthropic Claude u OpenAI exclusivas para este espacio de trabajo.
            </p>
          </div>

          {/* Current Status Bento Card */}
          <div className="rounded-2xl border border-hairline bg-surface p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-hairline gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-canvas border border-hairline text-rose-500 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-primary">Estado de Conexión en esta Mesa</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                      deskAIStatus?.is_connected
                        ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                        : 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                    }`}>
                      {deskAIStatus?.is_connected ? 'Conectado' : 'Sin Configurar'}
                    </span>
                  </div>
                  <p className="text-xs text-secondary mt-0.5">
                    {deskAIStatus?.is_connected
                      ? `Proveedor activo: ${deskAIStatus.provider?.toUpperCase()} • Modelo: ${deskAIStatus.model_name}`
                      : 'Esta mesa de ayuda opera actualmente en modo manual sin asistencia de IA.'}
                  </p>
                </div>
              </div>

              {deskAIStatus?.is_connected && (
                <button
                  type="button"
                  onClick={handleDisconnectDeskAI}
                  className="craft-btn-secondary text-xs text-rose-500 hover:border-rose-500/30"
                >
                  Desconectar Clave
                </button>
              )}
            </div>

            {/* Form to connect or change key */}
            <form onSubmit={handleConnectDeskAI} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                  1. Selecciona el Proveedor de Inteligencia Artificial
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'gemini', name: 'Google Gemini', desc: 'Recomendado • Latencia ultrarrápida' },
                    { id: 'openai', name: 'OpenAI GPT-4o', desc: 'Alta precisión y razonamiento estructurado' },
                    { id: 'claude', name: 'Anthropic Claude', desc: 'Líder en síntesis y empatía técnica' },
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setAIProvider(p.id as any);
                        if (p.id === 'gemini') setSelectedAIModel('gemini-2.0-flash');
                        if (p.id === 'openai') setSelectedAIModel('gpt-4o-mini');
                        if (p.id === 'claude') setSelectedAIModel('claude-3-5-haiku-20241022');
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-150 ${
                        aiProvider === p.id
                          ? 'border-rose-500 bg-rose-500/5 shadow-xs'
                          : 'border-hairline bg-canvas hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-primary">{p.name}</span>
                        {aiProvider === p.id && <Check className="w-4 h-4 text-rose-500" />}
                      </div>
                      <span className="text-[11px] text-secondary mt-1 block">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                  2. Clave de API Privada ({aiProvider.toUpperCase()})
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showAIKey ? 'text' : 'password'}
                    value={aiApiKey}
                    onChange={(e) => setAIApiKey(e.target.value)}
                    placeholder={`Ingresa tu API Key de ${aiProvider.toUpperCase()}`}
                    className="craft-input-with-icon pr-11 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAIKey(!showAIKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors p-1"
                  >
                    {showAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-secondary mt-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Cifrado AES-256 en reposo. Tu clave solo se utiliza para atender los casos de esta mesa.
                </p>
              </div>

              {/* Feedback messages */}
              {deskAIMsg && (
                <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-2.5 ${
                  deskAIMsg.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500'
                    : 'border-rose-500/30 bg-rose-500/5 text-rose-500'
                }`}>
                  {deskAIMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  {deskAIMsg.text}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={testingDeskAI || !aiApiKey.trim()}
                  className="craft-btn-primary text-xs shadow-sm"
                >
                  {testingDeskAI ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Validando y Vinculando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Vincular a esta Mesa de Ayuda
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Organizational Memory & Context */}
      {activeTab === 'context' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
            <div>
              <h2 className="text-base font-bold text-primary">Memoria Viva y Contexto Organizacional</h2>
              <p className="text-xs text-secondary mt-0.5">
                Base de conocimiento que orienta las respuestas y diagnósticos del copiloto de soporte.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowIngestModal(true)}
                className="craft-btn-secondary text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Ingesta Retrospectiva
              </button>
              {desk.user_role === 'admin' && (
                <button
                  type="button"
                  onClick={handleSaveContext}
                  disabled={savingContext}
                  className="craft-btn-primary text-xs shadow-sm"
                >
                  {savingContext ? 'Guardando...' : (contextSaved ? '¡Guardado!' : 'Guardar Memoria')}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-xs">
            <textarea
              rows={16}
              value={contextContent}
              onChange={(e) => setContextContent(e.target.value)}
              disabled={desk.user_role !== 'admin'}
              className="w-full bg-canvas border border-hairline rounded-xl p-4 text-xs font-mono text-primary leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              placeholder="Escribe aquí las directrices y contexto organizacional de la mesa..."
            />
          </div>
        </div>
      )}

      {/* Tab 5: Governance & AI Feature Toggles */}
      {activeTab === 'governance' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div>
              <h2 className="text-base font-bold text-primary">Gobierno y Matriz de Control de IA (RBAC)</h2>
              <p className="text-xs text-secondary mt-0.5">
                Habilita o restringe las capacidades de asistencia inteligente según el rol institucional.
              </p>
            </div>
            {togglesSavedFeedback && (
              <span className="text-xs text-emerald-500 font-bold animate-fade-in flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Cambios sincronizados
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-hairline bg-surface overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-hairline text-secondary font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Función Inteligente</th>
                  <th className="py-3 px-3 text-center">Global</th>
                  <th className="py-3 px-3 text-center">Solicitantes</th>
                  <th className="py-3 px-3 text-center">Agentes</th>
                  <th className="py-3 px-3 text-center">Administradores</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {toggles.map((t) => (
                  <tr key={t.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-primary block">{t.feature_label}</span>
                      <span className="text-[11px] text-secondary block">{t.description}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        disabled={desk.user_role !== 'admin' || savingToggles}
                        onClick={() => handleToggleChange(t.feature_name, 'is_enabled')}
                        className="cursor-pointer text-secondary hover:text-primary"
                      >
                        {t.is_enabled ? (
                          <CheckSquare className="w-4 h-4 mx-auto text-rose-500" />
                        ) : (
                          <Square className="w-4 h-4 mx-auto text-secondary/40" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        disabled={desk.user_role !== 'admin' || savingToggles}
                        onClick={() => handleToggleChange(t.feature_name, 'role_requester')}
                        className="cursor-pointer text-secondary hover:text-primary"
                      >
                        {t.role_requester ? (
                          <CheckSquare className="w-4 h-4 mx-auto text-rose-500" />
                        ) : (
                          <Square className="w-4 h-4 mx-auto text-secondary/40" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        disabled={desk.user_role !== 'admin' || savingToggles}
                        onClick={() => handleToggleChange(t.feature_name, 'role_agent')}
                        className="cursor-pointer text-secondary hover:text-primary"
                      >
                        {t.role_agent ? (
                          <CheckSquare className="w-4 h-4 mx-auto text-rose-500" />
                        ) : (
                          <Square className="w-4 h-4 mx-auto text-secondary/40" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        disabled={desk.user_role !== 'admin' || savingToggles}
                        onClick={() => handleToggleChange(t.feature_name, 'role_admin')}
                        className="cursor-pointer text-secondary hover:text-primary"
                      >
                        {t.role_admin ? (
                          <CheckSquare className="w-4 h-4 mx-auto text-rose-500" />
                        ) : (
                          <Square className="w-4 h-4 mx-auto text-secondary/40" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Create Modal */}
      {showCreateModal && (
        <TicketCreateModal
          slug={slug}
          isAIEnabled={desk.is_ai_enabled}
          categories={desk.categories}
          priorities={desk.priorities}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchDeskAndTickets();
          }}
        />
      )}

      {/* Ticket Detail Modal */}
      {selectedTicketCode && (
        <TicketDetailModal
          slug={slug}
          ticketCode={selectedTicketCode}
          currentUser={currentUser ? { id: currentUser.id, full_name: currentUser.full_name } : undefined}
          onClose={() => setSelectedTicketCode(null)}
          onTicketUpdated={() => fetchDeskAndTickets()}
        />
      )}

      {/* Retrospective Ingestion Modal */}
      {showIngestModal && (
        <RetrospectiveIngestionModal
          slug={slug}
          deskName={desk.name}
          totalTickets={tickets.length}
          onClose={() => setShowIngestModal(false)}
          onSuccess={() => {
            fetchContext();
            fetchDeskAndTickets();
          }}
        />
      )}

      {/* Create Custom Invitation Modal (Sprint 4) */}
      {showCreateInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-hairline bg-surface p-6 sm:p-7 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-hairline">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-canvas border border-hairline text-rose-500 flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">Generar Enlace de Invitación</h3>
                  <p className="text-[11px] text-secondary">Configura el rol y condiciones del link</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateInvitation} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Rol de Acceso Otorgado
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteRole('requester')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      inviteRole === 'requester'
                        ? 'border-rose-500 bg-rose-500/5 text-rose-500 shadow-xs'
                        : 'border-hairline bg-canvas text-secondary hover:text-primary'
                    }`}
                  >
                    Usuario / Empleado
                    <span className="block font-normal text-[10px] text-secondary mt-0.5">Radica incidencias</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInviteRole('agent')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      inviteRole === 'agent'
                        ? 'border-blue-500 bg-blue-500/5 text-blue-500 shadow-xs'
                        : 'border-hairline bg-canvas text-secondary hover:text-primary'
                    }`}
                  >
                    Soporte / Agente
                    <span className="block font-normal text-[10px] text-secondary mt-0.5">Atiende tickets</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Etiqueta Descriptiva
                </label>
                <input
                  type="text"
                  value={inviteLabel}
                  onChange={(e) => setInviteLabel(e.target.value)}
                  placeholder="ej. Enlace para equipo de Ventas"
                  className="craft-input text-xs w-full py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Límite de Usos
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={inviteMaxUses ?? ''}
                    onChange={(e) => setInviteMaxUses(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Sin límite"
                    className="craft-input text-xs w-full py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Días de Expiración
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={inviteExpiresDays ?? ''}
                    onChange={(e) => setInviteExpiresDays(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="7 días"
                    className="craft-input text-xs w-full py-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowCreateInviteModal(false)}
                  className="craft-btn-secondary text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingInvite}
                  className="craft-btn-primary text-xs shadow-sm"
                >
                  {creatingInvite ? 'Creando...' : 'Crear Enlace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper icon
const TicketItemIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);
