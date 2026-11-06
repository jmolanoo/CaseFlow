import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ArrowLeft, Plus, 
  Bot, Check, BookOpen, 
  AlertCircle, ChevronRight,
  ShieldCheck, Eye, EyeOff,
  Users, Link2, Copy, Trash2, Key, Sparkles,
  Wrench, X
} from 'lucide-react';
import { 
  api, HelpDeskDetails, TicketItem, TicketDetail,
  AIFeatureToggle, User as UserModel,
  HelpDeskMemberItem, HelpDeskInvitationItem,
  AIStatus
} from '../api';
import { TicketCreateModal } from './TicketCreateModal';
import { TicketViewModal } from './TicketViewModal';
import { TicketAttendModal } from './TicketAttendModal';
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

  // Modal separation state
  const [viewTicketCode, setViewTicketCode] = useState<string | null>(null);
  const [attendTicket, setAttendTicket] = useState<TicketDetail | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Members & Invitations state (Sprint 4)
  const [members, setMembers] = useState<HelpDeskMemberItem[]>([]);
  const [invitations, setInvitations] = useState<HelpDeskInvitationItem[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [_loadingMembers, setLoadingMembers] = useState(false);
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
  const [aiModel, setAiModel] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testingVault, setTestingVault] = useState(false);
  const [vaultMsg, setVaultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Context & Dynamic Learning state (Sprint 2 & 3)
  const [contextContent, setContextContent] = useState('');
  const [contextVersion, setContextVersion] = useState(1);
  const [_contextUpdatedAt, setContextUpdatedAt] = useState<string>('');
  const [contextEditing, setContextEditing] = useState(false);
  const [contextSaving, setContextSaving] = useState(false);
  const [showIngestionModal, setShowIngestionModal] = useState(false);

  // AI Governance Toggles state (Sprint 3)
  const [toggles, setToggles] = useState<AIFeatureToggle[]>([]);
  const [updatingToggle, setUpdatingToggle] = useState<string | null>(null);

  // Fetch Desk Data
  const fetchDesk = async () => {
    try {
      const data = await api.getDeskDetails(slug);
      setDesk(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Fetch Tickets
  const fetchTickets = async () => {
    try {
      const data = await api.getTickets(
        slug,
        statusFilter === 'all' ? undefined : statusFilter,
        catFilter,
        priorityFilter,
        slaFilter === 'all' ? undefined : slaFilter
      );
      setTickets(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Fetch Members & Invitations
  const fetchMembersAndInvitations = async () => {
    setLoadingMembers(true);
    try {
      const [mems, invites] = await Promise.all([
        api.getDeskMembers(slug),
        api.getDeskInvitations(slug),
      ]);
      setMembers(mems);
      setInvitations(invites);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Fetch AI Vault Status
  const fetchAIStatus = async () => {
    try {
      const statusData = await api.getDeskAIStatus(slug);
      setDeskAIStatus(statusData);
      if (statusData.is_connected && statusData.provider) {
        setAIProvider(statusData.provider);
        setAiModel(statusData.model_name || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Context
  const fetchContext = async () => {
    try {
      const ctx = await api.getDeskContext(slug);
      setContextContent(ctx.content);
      setContextVersion(ctx.version);
      setContextUpdatedAt(ctx.updated_at);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Governance Toggles
  const fetchToggles = async () => {
    try {
      const togData = await api.getAIToggles(slug);
      setToggles(togData);
    } catch (err) {
      console.error(err);
    }
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDesk(),
      fetchTickets(),
      fetchAIStatus(),
      fetchContext(),
      fetchToggles(),
    ]).finally(() => setLoading(false));
  }, [slug]);

  // Tab switch effect
  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    } else if (activeTab === 'members') {
      fetchMembersAndInvitations();
    } else if (activeTab === 'ai') {
      fetchAIStatus();
    } else if (activeTab === 'context') {
      fetchContext();
    } else if (activeTab === 'governance') {
      fetchToggles();
    }
  }, [activeTab, statusFilter, catFilter, priorityFilter, slaFilter]);

  // Quick triage priority assignment directly from table
  const handleQuickAssignPriority = async (ticketCode: string, priorityId: number) => {
    try {
      await api.updateTicketPriority(slug, ticketCode, priorityId);
      fetchTickets();
      fetchDesk();
    } catch (err: any) {
      alert(err.message || 'Error al asignar prioridad');
    }
  };

  // Create Invitation
  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingInvite(true);
    try {
      await api.createDeskInvitation(slug, {
        role: inviteRole,
        label: inviteLabel.trim() || undefined,
        max_uses: inviteMaxUses || undefined,
        expires_days: inviteExpiresDays || undefined,
      });
      setShowCreateInviteModal(false);
      setInviteLabel('');
      setInviteMaxUses(undefined);
      fetchMembersAndInvitations();
    } catch (err: any) {
      alert(err.message || 'Error al crear invitación');
    } finally {
      setCreatingInvite(false);
    }
  };

  // Delete Invitation
  const handleDeleteInvitation = async (invId: number) => {
    if (!confirm('¿Seguro que deseas desactivar este enlace de invitación?')) return;
    try {
      await api.deleteDeskInvitation(slug, invId);
      fetchMembersAndInvitations();
    } catch (err: any) {
      alert(err.message || 'Error al desactivar invitación');
    }
  };

  // Update Member Role
  const handleUpdateRole = async (memberId: number, newRole: string) => {
    try {
      await api.updateDeskMember(slug, memberId, { role: newRole });
      fetchMembersAndInvitations();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar rol');
    }
  };

  // Toggle Member Active
  const handleToggleMemberActive = async (memberId: number, currentActive: boolean) => {
    try {
      await api.updateDeskMember(slug, memberId, { is_active: !currentActive });
      fetchMembersAndInvitations();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar estado del usuario');
    }
  };

  // Connect AI Vault
  const handleConnectVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiApiKey.trim()) return;
    setTestingVault(true);
    setVaultMsg(null);
    try {
      const res = await api.connectDeskAIKey(slug, aiProvider, aiApiKey.trim(), aiModel || undefined);
      setVaultMsg({ type: 'success', text: res.message });
      setAIApiKey('');
      fetchAIStatus();
      fetchDesk();
    } catch (err: any) {
      setVaultMsg({ type: 'error', text: err.message || 'Error al conectar clave de API' });
    } finally {
      setTestingVault(false);
    }
  };

  // Disconnect AI Vault
  const handleDisconnectVault = async () => {
    if (!confirm('¿Deseas desvincular las credenciales de IA de esta mesa de ayuda?')) return;
    try {
      await api.disconnectDeskAI(slug);
      setVaultMsg({ type: 'success', text: 'Credenciales de IA desacopladas exitosamente.' });
      fetchAIStatus();
      fetchDesk();
    } catch (err: any) {
      alert(err.message || 'Error al desacoplar IA');
    }
  };

  // Save Context Edit
  const handleSaveContext = async () => {
    setContextSaving(true);
    try {
      const res = await api.updateDeskContext(slug, contextContent);
      setContextVersion(res.version);
      setContextUpdatedAt(res.updated_at);
      setContextEditing(false);
    } catch (err: any) {
      alert(err.message || 'Error al guardar la memoria contextual');
    } finally {
      setContextSaving(false);
    }
  };

  // Toggle AI Feature
  const handleToggleFeature = async (featureName: string, currentVal: boolean) => {
    setUpdatingToggle(featureName);
    try {
      const updatedList = await api.updateAIToggles(slug, [{ feature_name: featureName, is_enabled: !currentVal }]);
      setToggles(updatedList);
    } catch (err: any) {
      alert(err.message || 'Error al alternar control de IA');
    } finally {
      setUpdatingToggle(null);
    }
  };

  // Copy invitation link to clipboard
  const handleCopyLink = (code: string) => {
    const fullUrl = `${window.location.origin}?join=${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const isStaff = desk?.user_role === 'admin' || desk?.user_role === 'agent';

  // Metrics Calculations
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
  const unassignedPriorityCount = tickets.filter((t) => !t.priority_id || t.priority_name === 'Sin prioridad asignada').length;

  const filteredMembers = members.filter((m) =>
    m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-xs text-secondary space-y-3">
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Cargando espacio de trabajo...</p>
      </div>
    );
  }

  if (!desk) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-rose-500" />
        <h2 className="text-base font-bold text-primary">No se encontró la mesa de ayuda</h2>
        <button onClick={onBackToDashboard} className="craft-btn-secondary text-xs rounded-full">
          Volver al Panel
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-in fade-in duration-200">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-hairline">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="craft-btn-secondary text-xs rounded-full py-1.5 px-3.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Panel Principal
          </button>
          <span className="text-secondary text-xs">/</span>
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-primary">{desk.name}</h1>
            <span className="text-xs text-rose-500 font-semibold">/{desk.slug}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface border border-hairline text-secondary uppercase tracking-wider">
            {desk.user_role === 'admin' ? 'Administrador' : (desk.user_role === 'agent' ? 'Soporte / Agente' : 'Usuario / Solicitante')}
          </span>

          {/* Truthful AI status */}
          {deskAIStatus?.is_connected ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border bg-rose-500/10 border-rose-500/25 text-rose-500">
              <Bot className="w-3.5 h-3.5" />
              Asistencia IA Activa
            </span>
          ) : desk.is_ai_enabled ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border bg-surface border-hairline text-secondary">
              <Bot className="w-3.5 h-3.5" />
              IA Sin Configurar (Manual)
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border bg-surface border-hairline text-secondary">
              <Bot className="w-3.5 h-3.5" />
              Operación Manual
            </span>
          )}
        </div>
      </div>

      {/* Tabs Menu - Strict Pills */}
      <div className="flex items-center gap-2 border-b border-hairline pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-1.5 text-xs font-bold rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap hover:scale-105 active:scale-95 ${
            activeTab === 'tickets'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-secondary hover:text-primary hover:bg-surface'
          }`}
        >
          {desk.user_role === 'requester' ? 'Mis Incidencias Radicadas' : 'Tickets e Incidencias'} ({tickets.length})
        </button>

        {desk.user_role === 'admin' && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full cursor-pointer transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95 ${
                activeTab === 'members'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-secondary hover:text-primary hover:bg-surface'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Usuarios e Invitaciones
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full cursor-pointer transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95 ${
                activeTab === 'ai'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-secondary hover:text-primary hover:bg-surface'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-300" />
              Conexión de IA (BYOK)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('context')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full cursor-pointer transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95 ${
                activeTab === 'context'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-secondary hover:text-primary hover:bg-surface'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Memoria y Aprendizaje
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('governance')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full cursor-pointer transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95 ${
                activeTab === 'governance'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-secondary hover:text-primary hover:bg-surface'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Gobernanza RBAC
            </button>
          </>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: TICKETS E INCIDENCIAS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'tickets' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Enhanced Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="craft-card p-4 space-y-1">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                Total de Casos
              </span>
              <span className="text-xl font-extrabold text-primary block">
                {totalCount}
              </span>
              <span className="text-[10px] text-secondary block">Volumen registrado</span>
            </div>

            <div className="craft-card p-4 space-y-1">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                En Atención Activa
              </span>
              <span className="text-xl font-extrabold text-rose-500 block">
                {openCount}
              </span>
              <span className="text-[10px] text-secondary block">Requieren gestión</span>
            </div>

            <div className="craft-card p-4 space-y-1">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                Casos Resueltos
              </span>
              <span className="text-xl font-extrabold text-primary block">
                {resolvedCount}
              </span>
              <span className="text-[10px] text-secondary block">Solución confirmada</span>
            </div>

            <div className="craft-card p-4 space-y-1">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                Cumplimiento SLA
              </span>
              <span className="text-xl font-extrabold text-rose-500 block">
                {totalCount > 0 ? `${Math.round((resolvedCount / totalCount) * 100)}%` : '100%'}
              </span>
              <span className="text-[10px] text-secondary block">Tasa de respuesta a tiempo</span>
            </div>
          </div>

          {/* Controls Bar: Multi-layered Filters & Action */}
          <div className="p-4 rounded-3xl border border-hairline bg-surface space-y-3.5 shadow-xs">
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
                    className={`px-3.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap hover:scale-105 active:scale-95 ${
                      statusFilter === filter.id
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 amoled:bg-rose-500 amoled:text-white shadow-xs'
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
                className="craft-btn-primary text-xs shadow-sm whitespace-nowrap rounded-full"
              >
                <Plus className="w-3.5 h-3.5" />
                Radicar Caso
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-hairline">
              <select
                value={catFilter ?? ''}
                onChange={(e) => setCatFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                className="craft-input text-xs py-1.5 px-3 rounded-full cursor-pointer max-w-xs"
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
                className="craft-input text-xs py-1.5 px-3 rounded-full cursor-pointer max-w-xs"
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
                className="craft-input text-xs py-1.5 px-3 rounded-full cursor-pointer max-w-xs"
              >
                <option value="all">Todos los SLAs</option>
                <option value="within">Dentro de Plazo</option>
                <option value="breached">SLA Excedido</option>
              </select>

              {unassignedPriorityCount > 0 && isStaff && (
                <span className="text-xs text-rose-500 font-semibold px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 ml-auto">
                  {unassignedPriorityCount} {unassignedPriorityCount === 1 ? 'caso pendiente' : 'casos pendientes'} de triaje
                </span>
              )}
            </div>
          </div>

          {/* Tickets List */}
          {tickets.length === 0 ? (
            <div className="rounded-3xl border border-hairline bg-surface p-12 text-center space-y-3">
              <TicketItemIcon className="w-8 h-8 mx-auto text-secondary" />
              <div className="text-sm font-bold text-primary">No se encontraron tickets con los filtros actuales</div>
              <p className="text-xs text-secondary">Ajusta los criterios de búsqueda o radica un nuevo caso.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => {
                const isUnassigned = !t.priority_id || t.priority_name === 'Sin prioridad asignada';

                return (
                  <div
                    key={t.id}
                    onClick={() => setViewTicketCode(t.ticket_code)}
                    className="rounded-3xl border border-hairline bg-surface p-5 hover:border-rose-500/40 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:scale-[1.01]"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-rose-500 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                          {t.ticket_code}
                        </span>

                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          t.status === 'open' ? 'text-primary border-hairline bg-canvas' :
                          t.status === 'in_progress' ? 'text-rose-500 border-rose-500/30 bg-rose-500/5' :
                          t.status === 'resolved' ? 'text-primary border-rose-500/40 bg-rose-500/10' :
                          'text-secondary border-hairline bg-canvas'
                        }`}>
                          {t.status === 'open' ? 'Abierto' : (t.status === 'in_progress' ? 'En Progreso' : (t.status === 'resolved' ? 'Resuelto' : t.status))}
                        </span>

                        <span className="text-xs text-secondary font-medium">
                          • {t.category_name}
                        </span>

                        {/* Priority Badge or Triage Selector */}
                        {isUnassigned ? (
                          isStaff ? (
                            <select
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (e.target.value) {
                                  handleQuickAssignPriority(t.ticket_code, parseInt(e.target.value));
                                }
                              }}
                              defaultValue=""
                              className="craft-input py-0.5 px-2.5 text-[10px] rounded-full border-rose-500/30 bg-canvas text-rose-500 font-semibold cursor-pointer"
                              title="Asignar prioridad inmediata"
                            >
                              <option value="" disabled>Triaje de prioridad...</option>
                              {desk.priorities.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.sla_resolution_hours}h)
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-[10px] text-secondary italic px-2.5 py-0.5 rounded-full bg-surface border border-hairline">
                              Sin prioridad asignada
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-semibold text-rose-500 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                            {t.priority_name}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-primary group-hover:text-rose-500 transition-colors">
                        {t.title}
                      </h4>

                      <p className="text-xs text-secondary line-clamp-1 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-secondary shrink-0">
                      <div className="text-right">
                        <span className="block font-semibold text-primary">{t.requester_name}</span>
                        <span className="block text-[11px]">
                          {new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Quick Attend button for staff */}
                      {isStaff && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const detail = await api.getTicketDetail(slug, t.ticket_code);
                              setAttendTicket(detail);
                            } catch (err: any) {
                              alert(err.message || 'Error al cargar caso');
                            }
                          }}
                          className="craft-btn-secondary text-xs rounded-full py-1.5 px-3.5 flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-xs"
                          title="Atender este caso"
                        >
                          <Wrench className="w-3.5 h-3.5 text-rose-500" />
                          <span className="hidden sm:inline">Atender</span>
                        </button>
                      )}

                      <ChevronRight className="w-4 h-4 text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: MIEMBROS E INVITACIONES (SPRINT 4)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'members' && desk.user_role === 'admin' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
            <div>
              <h2 className="text-lg font-bold text-primary tracking-tight">Gestión de Equipo & Invitaciones</h2>
              <p className="text-xs text-secondary mt-0.5">Control de acceso, roles institucionales y enlaces de invitación compartibles</p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateInviteModal(true)}
              className="craft-btn-primary text-xs rounded-full"
            >
              <Plus className="w-4 h-4" />
              Generar Enlace de Invitación
            </button>
          </div>

          {/* Invitations Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Link2 className="w-4 h-4 text-rose-500" />
                Enlaces de Invitación Activos ({invitations.length})
              </h3>
              <span className="text-[11px] text-secondary">Comparte estos enlaces para otorgar roles</span>
            </div>

            {invitations.length === 0 ? (
              <div className="p-8 rounded-3xl border border-hairline bg-surface text-center space-y-2">
                <p className="text-xs text-secondary">No hay enlaces de invitación creados en esta mesa.</p>
                <button
                  type="button"
                  onClick={() => setShowCreateInviteModal(true)}
                  className="craft-btn-secondary text-xs rounded-full"
                >
                  Generar Primer Enlace
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invitations.map((inv) => {
                  const roleLabel = 
                    inv.role === 'admin' ? 'Administrador' :
                    inv.role === 'agent' ? 'Soporte / Agente' : 'Usuario / Empleado';

                  return (
                    <div
                      key={inv.id}
                      className={`rounded-3xl border p-5 space-y-3 transition-all ${
                        inv.is_active ? 'border-hairline bg-surface shadow-xs' : 'border-zinc-500/20 bg-canvas opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-primary block">{inv.label || 'Invitación de Acceso'}</span>
                          <span className="text-[11px] text-rose-500 font-semibold block mt-0.5">{roleLabel}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          inv.is_active ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' : 'text-zinc-400 border-hairline bg-canvas'
                        }`}>
                          {inv.is_active ? 'Activa' : 'Expirada'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-canvas border border-hairline flex items-center justify-between gap-2 text-xs">
                        <span className="truncate text-secondary select-all font-sans text-[11px]">
                          {window.location.origin}?join={inv.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(inv.code)}
                          className="craft-btn-secondary text-xs py-1 px-3 shrink-0 rounded-full"
                          title="Copiar Enlace"
                        >
                          {copiedCode === inv.code ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-rose-500" />
                              <span className="text-rose-500">¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-rose-500" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-secondary pt-1 border-t border-hairline">
                        <span>Usos: <strong>{inv.uses_count}</strong>{inv.max_uses ? ` / ${inv.max_uses}` : ' (Ilimitados)'}</span>
                        {inv.is_active && (
                          <button
                            type="button"
                            onClick={() => handleDeleteInvitation(inv.id)}
                            className="text-secondary hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Desactivar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Members Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-500" />
                Miembros Vinculados ({members.length})
              </h3>
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Buscar por nombre o correo..."
                className="craft-input text-xs py-1.5 px-3 rounded-full max-w-xs"
              />
            </div>

            <div className="rounded-3xl border border-hairline bg-surface overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas border-b border-hairline text-secondary uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Rol Asignado</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-canvas border border-hairline flex items-center justify-center font-bold text-primary shadow-xs">
                            {m.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-primary block">{m.full_name}</span>
                            <span className="text-[11px] text-secondary">{m.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={m.role}
                          disabled={m.user_id === currentUser?.id}
                          onChange={(e) => handleUpdateRole(m.id, e.target.value)}
                          className="craft-input py-1 px-3 text-xs rounded-full cursor-pointer bg-canvas"
                        >
                          <option value="requester">Usuario / Empleado</option>
                          <option value="agent">Soporte / Agente</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                          m.is_active 
                            ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' 
                            : 'text-zinc-400 border-hairline bg-canvas'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${m.is_active ? 'bg-rose-500' : 'bg-zinc-400'}`} />
                          {m.is_active ? 'Activo' : 'Desactivado'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {m.user_id !== currentUser?.id && (
                          <button
                            type="button"
                            onClick={() => handleToggleMemberActive(m.id, m.is_active)}
                            className="craft-btn-secondary text-[11px] rounded-full py-1 px-3"
                          >
                            {m.is_active ? 'Desactivar' : 'Reactivar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: CONEXIÓN DE IA (BÓVEDA BYOK)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'ai' && desk.user_role === 'admin' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-hairline bg-surface p-7 space-y-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-hairline">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-rose-500" />
                  <h2 className="text-base font-bold text-primary">Bóveda Criptográfica BYOK de la Mesa</h2>
                </div>
                <p className="text-xs text-secondary">
                  Vincula claves privadas para habilitar la asistencia de IA en esta mesa sin compartir datos.
                </p>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                deskAIStatus?.is_connected 
                  ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' 
                  : 'text-secondary border-hairline bg-canvas'
              }`}>
                {deskAIStatus?.is_connected ? 'Bóveda Conectada' : 'Bóveda Sin Configurar'}
              </span>
            </div>

            {/* Provider Selector Cards */}
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Proveedor de IA a Conectar
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'gemini', name: 'Google Gemini', desc: 'gemini-1.5-pro / flash' },
                  { id: 'claude', name: 'Anthropic Claude', desc: 'claude-3-5-sonnet' },
                  { id: 'openai', name: 'OpenAI GPT-4', desc: 'gpt-4o / mini' },
                ].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setAIProvider(p.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      aiProvider === p.id
                        ? 'border-rose-500 bg-rose-500/10 text-rose-500 shadow-xs'
                        : 'border-hairline bg-canvas text-secondary hover:text-primary'
                    }`}
                  >
                    <span className="font-bold text-xs block text-primary">{p.name}</span>
                    <span className="text-[10px] text-secondary mt-0.5 block">{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConnectVault} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Clave de API Privada ({aiProvider.toUpperCase()})
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    required
                    value={aiApiKey}
                    onChange={(e) => setAIApiKey(e.target.value)}
                    placeholder="Pega aquí tu clave de API privada..."
                    className="craft-input w-full pr-10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {vaultMsg && (
                <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 border ${
                  vaultMsg.type === 'success' 
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-500' 
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-500'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{vaultMsg.text}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-hairline">
                {deskAIStatus?.is_connected ? (
                  <button
                    type="button"
                    onClick={handleDisconnectVault}
                    className="craft-btn-secondary text-xs rounded-full"
                  >
                    Desvincular Bóveda
                  </button>
                ) : <div />}

                <button
                  type="submit"
                  disabled={testingVault || !aiApiKey.trim()}
                  className="craft-btn-primary text-xs rounded-full shadow-md"
                >
                  {testingVault ? 'Validando y Cifrando...' : 'Cifrar y Vincular Bóveda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: MEMORIA Y APRENDIZAJE CONTEXTUAL
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'context' && desk.user_role === 'admin' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-hairline bg-surface p-7 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
              <div>
                <h2 className="text-base font-bold text-primary flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-rose-500" />
                  Memoria Técnica Colectiva del Help Desk
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  Versión actual: <strong>v{contextVersion}</strong> • Se enriquece con cada caso resuelto
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowIngestionModal(true)}
                  className="craft-btn-secondary text-xs rounded-full"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  Sintetizar Casos Resueltos
                </button>

                {!contextEditing ? (
                  <button
                    type="button"
                    onClick={() => setContextEditing(true)}
                    className="craft-btn-primary text-xs rounded-full"
                  >
                    Editar Memoria
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={contextSaving}
                    onClick={handleSaveContext}
                    className="craft-btn-primary text-xs rounded-full"
                  >
                    {contextSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                )}
              </div>
            </div>

            {contextEditing ? (
              <textarea
                rows={12}
                value={contextContent}
                onChange={(e) => setContextContent(e.target.value)}
                className="craft-input w-full text-xs font-sans leading-relaxed"
              />
            ) : (
              <div className="p-5 rounded-2xl bg-canvas border border-hairline text-xs whitespace-pre-wrap leading-relaxed select-text shadow-xs">
                {contextContent || 'No hay memoria contextual definida aún en esta mesa.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: GOBERNANZA RBAC (SPRINT 3)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'governance' && desk.user_role === 'admin' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-hairline bg-surface p-7 space-y-6 shadow-sm">
            <div className="pb-4 border-b border-hairline">
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-500" />
                Controles de Gobernanza y Asistencia de IA
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                Habilita o restringe las capacidades de asistencia inteligente según el rol institucional.
              </p>
            </div>

            <div className="space-y-4">
              {toggles.map((tog) => (
                <div
                  key={tog.feature_name}
                  className="flex items-center justify-between p-4 rounded-2xl bg-canvas border border-hairline shadow-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-primary block">{tog.feature_name}</span>
                    <span className="text-[11px] text-secondary">
                      {tog.feature_name === 'copilot_suggestions' && 'Sugerencias asistidas de respuesta para especialistas.'}
                      {tog.feature_name === 'copilot_diagnosis' && 'Diagnóstico automatizado de causa raíz y pasos de resolución.'}
                      {tog.feature_name === 'copilot_summary' && 'Generación de resumen ejecutivo del caso para soporte.'}
                      {tog.feature_name === 'dynamic_learning' && 'Ingesta automática de soluciones al cerrar casos resueltos.'}
                      {tog.feature_name === 'requester_refine' && 'Refinamiento de redacción de casos para solicitantes.'}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={updatingToggle === tog.feature_name}
                    onClick={() => handleToggleFeature(tog.feature_name, tog.is_enabled)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                      tog.is_enabled ? 'bg-rose-500' : 'bg-surface border border-hairline'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        tog.is_enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODALS SECTION (Wrapped with AnimatePresence)
          ───────────────────────────────────────────────────────────── */}

      {/* Modal 1: Ticket View & Inspection Modal */}
      <AnimatePresence>
        {viewTicketCode && (
          <TicketViewModal
            slug={slug}
            ticketCode={viewTicketCode}
            userRole={desk.user_role}
            priorities={desk.priorities}
            onClose={() => setViewTicketCode(null)}
            onOpenAttend={(t) => {
              setViewTicketCode(null);
              setAttendTicket(t);
            }}
            onTicketUpdated={() => {
              fetchTickets();
              fetchDesk();
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal 2: Dedicated Ticket Attendance & Handling Modal */}
      <AnimatePresence>
        {attendTicket && (
          <TicketAttendModal
            slug={slug}
            ticket={attendTicket}
            currentUser={currentUser}
            onClose={() => setAttendTicket(null)}
            onTicketUpdated={() => {
              fetchTickets();
              fetchDesk();
            }}
          />
        )}
      </AnimatePresence>

      {/* Ticket Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <TicketCreateModal
            slug={slug}
            isAIEnabled={desk.is_ai_enabled}
            categories={desk.categories}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              fetchTickets();
              fetchDesk();
            }}
          />
        )}
      </AnimatePresence>

      {/* Retrospective Ingestion Modal */}
      <AnimatePresence>
        {showIngestionModal && (
          <RetrospectiveIngestionModal
            slug={slug}
            deskName={desk.name}
            totalTickets={tickets.length}
            onClose={() => setShowIngestionModal(false)}
            onSuccess={() => {
              fetchContext();
              fetchDesk();
            }}
          />
        )}
      </AnimatePresence>

      {/* Create Custom Invitation Modal */}
      <AnimatePresence>
        {showCreateInviteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
              className="relative w-full max-w-md rounded-3xl border border-hairline bg-surface p-7 shadow-2xl"
            >
              <div className="flex items-start justify-between pb-4 border-b border-hairline">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-canvas border border-hairline text-rose-500 flex items-center justify-center shadow-xs">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-primary">Generar Enlace de Invitación</h3>
                    <p className="text-[11px] text-secondary">Configura el rol y condiciones del link</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateInviteModal(false)}
                  className="p-1.5 rounded-full text-secondary hover:text-primary hover:bg-canvas cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
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
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                        inviteRole === 'requester'
                          ? 'border-rose-500 bg-rose-500/10 text-rose-500 shadow-xs'
                          : 'border-hairline bg-canvas text-secondary hover:text-primary'
                      }`}
                    >
                      Usuario / Empleado
                      <span className="block font-normal text-[10px] text-secondary mt-0.5">Radica incidencias</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInviteRole('agent')}
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                        inviteRole === 'agent'
                          ? 'border-rose-500 bg-rose-500/10 text-rose-500 shadow-xs'
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
                    className="craft-btn-secondary text-xs rounded-full"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingInvite}
                    className="craft-btn-primary text-xs shadow-sm rounded-full"
                  >
                    {creatingInvite ? 'Creando...' : 'Crear Enlace'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper icon
const TicketItemIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);
