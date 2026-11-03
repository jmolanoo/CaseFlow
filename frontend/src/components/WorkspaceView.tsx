import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Clock, 
  Bot, Check, BookOpen, 
  RefreshCw, AlertCircle, ChevronRight, User, CheckCircle2,
  ShieldCheck, Eye, Edit3, Sliders, CheckSquare, Square
} from 'lucide-react';
import { 
  api, HelpDeskDetails, TicketItem, 
  HelpDeskContextData, AIStatus, AIFeatureToggle, User as UserModel
} from '../api';
import { TicketCreateModal } from './TicketCreateModal';
import { TicketDetailModal } from './TicketDetailModal';
import { RetrospectiveIngestionModal } from './RetrospectiveIngestionModal';

interface WorkspaceViewProps {
  slug: string;
  aiStatus?: AIStatus | null;
  currentUser?: UserModel | null;
  onBackToDashboard: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  slug,
  aiStatus: _aiStatus,
  currentUser,
  onBackToDashboard,
}) => {
  const [desk, setDesk] = useState<HelpDeskDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tickets' | 'context' | 'governance'>('tickets');

  // Tickets state & filters (Sprint 3: Advanced Agent Filters)
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [catFilter, setCatFilter] = useState<number | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<number | undefined>(undefined);
  const [slaFilter, setSlaFilter] = useState<string>('all');
  const [selectedTicketCode, setSelectedTicketCode] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Context state
  const [contextData, setContextData] = useState<HelpDeskContextData | null>(null);
  const [contextContent, setContextContent] = useState('');
  const [savingContext, setSavingContext] = useState(false);
  const [contextSaved, setContextSaved] = useState(false);
  const [memoryViewMode, setMemoryViewMode] = useState<'editor' | 'preview'>('editor');
  const [showIngestModal, setShowIngestModal] = useState(false);

  // Sprint 3: Governance & AI Feature Toggles state
  const [toggles, setToggles] = useState<AIFeatureToggle[]>([]);
  const [loadingToggles, setLoadingToggles] = useState(false);
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

  const fetchContext = async () => {
    try {
      const data = await api.getDeskContext(slug);
      setContextData(data);
      setContextContent(data.content);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchToggles = async () => {
    setLoadingToggles(true);
    try {
      const data = await api.getAIToggles(slug);
      setToggles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingToggles(false);
    }
  };

  useEffect(() => {
    fetchDeskAndTickets();
  }, [slug, statusFilter, catFilter, priorityFilter, slaFilter]);

  useEffect(() => {
    if (activeTab === 'context') {
      fetchContext();
    } else if (activeTab === 'governance') {
      fetchToggles();
    }
  }, [activeTab, slug]);

  const handleSaveContext = async () => {
    setSavingContext(true);
    try {
      const updated = await api.updateDeskContext(slug, contextContent);
      setContextData(updated);
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

  // Metrics calculation
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
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
            <span className="text-xs text-secondary">/{desk.slug}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface border border-hairline text-secondary uppercase tracking-wider">
            {desk.user_role}
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
      <div className="flex items-center gap-2 border-b border-hairline pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all duration-150 ${
            activeTab === 'tickets'
              ? 'bg-rose-500 text-white shadow-xs scale-[1.02]'
              : 'text-secondary hover:text-primary hover:bg-surface'
          }`}
        >
          Tickets e Incidencias ({tickets.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('context')}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all duration-150 flex items-center gap-1.5 ${
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
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'governance'
              ? 'bg-rose-500 text-white shadow-xs scale-[1.02]'
              : 'text-secondary hover:text-primary hover:bg-surface'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Gobernanza & SLAs
        </button>
      </div>

      {/* Tab 1: Agent Tickets Console with Multi-Faceted Filters & Metrics */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Workload Metrics Banner for Support Team */}
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
            {/* Status filters */}
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

            {/* SLA and Category dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-hairline">
              {/* Category Filter */}
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

              {/* Priority Filter */}
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

              {/* SLA Filter */}
              <select
                value={slaFilter}
                onChange={(e) => setSlaFilter(e.target.value)}
                className="craft-input text-xs py-1.5 cursor-pointer max-w-xs"
              >
                <option value="all">Cualquier Estado de SLA</option>
                <option value="on_time">A Tiempo (Dentro de SLA)</option>
                <option value="at_risk">En Riesgo (&lt; 4 horas)</option>
                <option value="expired">Vencidos (SLA Superado)</option>
              </select>
            </div>
          </div>

          {/* Tickets Cards Grid */}
          {tickets.length === 0 ? (
            <div className="rounded-2xl border border-hairline bg-surface p-12 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-canvas border border-hairline flex items-center justify-center mx-auto text-rose-500 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-primary">No hay casos registrados con estos filtros</h3>
              <p className="text-xs text-secondary max-w-sm mx-auto">
                Los casos nuevos que se radiquen aparecerán organizados aquí con su respectivo temporizador de SLA.
              </p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="craft-btn-primary text-xs mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Radicar Primer Caso
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketCode(t.ticket_code)}
                  className="rounded-2xl border border-hairline bg-surface p-5 space-y-3 hover:border-rose-500/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200 group flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-rose-500 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20">
                        {t.ticket_code}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-canvas border border-hairline text-secondary uppercase tracking-wider">
                        {t.category_name}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-canvas border border-hairline text-secondary uppercase tracking-wider">
                        {t.priority_name}
                      </span>
                      {t.assignee_name && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
                          {t.assignee_name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-primary group-hover:text-rose-500 transition-colors">
                      {t.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-secondary">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-secondary" />
                        {t.requester_name}
                      </span>
                      <span>•</span>
                      <span>Creado el {new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-hairline">
                    <div className="text-left md:text-right text-xs">
                      <span className="text-[10px] uppercase font-bold text-secondary block">
                        Límite de Solución
                      </span>
                      <span className="font-extrabold text-primary flex items-center md:justify-end gap-1 text-xs">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        {t.sla_resolution_hours} horas
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          t.status === 'open'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                            : t.status === 'in_progress'
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/25'
                            : t.status === 'waiting'
                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/25'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                        }`}
                      >
                        {t.status === 'open' && 'Abierto'}
                        {t.status === 'in_progress' && 'En Progreso'}
                        {t.status === 'waiting' && 'En Espera'}
                        {t.status === 'resolved' && 'Resuelto'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Living Support Memory (Editor & Live Preview) */}
      {activeTab === 'context' && (
        <div className="craft-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-rose-500 shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-primary">
                  Memoria de Soporte Viva (Help Desk Context)
                </h3>
                {contextData && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-canvas border border-hairline text-secondary font-semibold">
                    Versión {contextData.version}
                  </span>
                )}
              </div>
              <p className="text-xs text-secondary mt-1">
                Base viva de conocimiento y resoluciones. La IA aprende continuamente de cada caso cerrado para mejorar respuestas futuras.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-canvas p-1 rounded-xl border border-hairline">
                <button
                  type="button"
                  onClick={() => setMemoryViewMode('editor')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    memoryViewMode === 'editor'
                      ? 'bg-surface text-primary shadow-xs'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setMemoryViewMode('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    memoryViewMode === 'preview'
                      ? 'bg-surface text-primary shadow-xs'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Vista Previa
                </button>
              </div>

              {desk.user_role === 'admin' && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowIngestModal(true)}
                    className="craft-btn-secondary text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
                    Re-indexar Casos
                  </button>
                  <button
                    type="button"
                    disabled={savingContext}
                    onClick={handleSaveContext}
                    className="craft-btn-primary text-xs font-semibold"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {savingContext ? 'Guardando...' : contextSaved ? '¡Guardado!' : 'Guardar Memoria'}
                  </button>
                </>
              )}
            </div>
          </div>

          {memoryViewMode === 'editor' ? (
            <div className="rounded-2xl border border-hairline bg-canvas p-4 shadow-xs">
              <textarea
                rows={16}
                value={contextContent}
                readOnly={desk.user_role !== 'admin'}
                onChange={(e) => setContextContent(e.target.value)}
                className="craft-input w-full text-xs font-mono leading-relaxed"
                placeholder="Directrices, políticas y síntesis de casos..."
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-hairline bg-canvas p-6 shadow-xs prose prose-sm max-w-none text-xs text-primary leading-relaxed whitespace-pre-wrap">
              {contextContent}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Governance & AI Feature Toggles (RBAC Matrix) & SLAs */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          {/* Bento Card: Matriz de Gobernanza de IA y Control RBAC */}
          <div className="craft-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-rose-500 shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary">
                    Matriz de Gobernanza de IA y Control por Rol (RBAC)
                  </h3>
                  <p className="text-xs text-secondary">
                    Define qué capacidades de IA están habilitadas y accesibles para cada perfil de usuario en este Help Desk.
                  </p>
                </div>
              </div>

              {togglesSavedFeedback && (
                <span className="text-xs text-emerald-500 font-bold flex items-center gap-1 self-start sm:self-auto animate-in fade-in duration-150">
                  <Check className="w-3.5 h-3.5" />
                  ¡Configuración RBAC guardada!
                </span>
              )}
            </div>

            {loadingToggles ? (
              <div className="text-center py-8 text-xs text-secondary">
                Cargando matriz de gobierno...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-hairline text-secondary text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Funcionalidad de IA</th>
                      <th className="py-2.5 px-3 text-center">Estado Global</th>
                      <th className="py-2.5 px-3 text-center">Solicitante</th>
                      <th className="py-2.5 px-3 text-center">Agente</th>
                      <th className="py-2.5 px-3 text-center">Administrador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {toggles.map((t) => (
                      <tr key={t.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-primary block">{t.feature_label}</span>
                          <span className="text-[11px] text-secondary">{t.description}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            disabled={desk.user_role !== 'admin' || savingToggles}
                            onClick={() => handleToggleChange(t.feature_name, 'is_enabled')}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                              t.is_enabled
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                                : 'bg-surface text-secondary border border-hairline'
                            }`}
                          >
                            {t.is_enabled ? 'Activo' : 'Pausado'}
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
            )}
          </div>

          {/* Catalog & SLA Policies Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Categories Card */}
            <div className="craft-card space-y-4">
              <h3 className="text-sm font-bold text-primary">Catálogo de Categorías</h3>
              <div className="space-y-2.5">
                {desk.categories.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-canvas border border-hairline text-xs flex justify-between shadow-xs">
                    <span className="font-bold text-primary">{c.name}</span>
                    <span className="text-secondary">{c.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA Policies Card */}
            <div className="craft-card space-y-4">
              <h3 className="text-sm font-bold text-primary">Matriz de Prioridades y SLAs</h3>
              <div className="space-y-2.5">
                {desk.priorities.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-canvas border border-hairline text-xs flex justify-between shadow-xs">
                    <span className="font-bold text-primary">{p.name} (Nivel {p.level})</span>
                    <span className="text-secondary font-medium">
                      Respuesta: <strong className="text-primary">{p.sla_response_hours}h</strong> | Solución: <strong className="text-primary">{p.sla_resolution_hours}h</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
    </div>
  );
};
