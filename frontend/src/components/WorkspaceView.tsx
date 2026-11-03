import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Clock, 
  Bot, Check, BookOpen, 
  Settings, RefreshCw, AlertCircle, ChevronRight, User, CheckCircle2
} from 'lucide-react';
import { 
  api, HelpDeskDetails, TicketItem, 
  HelpDeskContextData, AIStatus 
} from '../api';
import { TicketCreateModal } from './TicketCreateModal';
import { TicketDetailModal } from './TicketDetailModal';
import { RetrospectiveIngestionModal } from './RetrospectiveIngestionModal';

interface WorkspaceViewProps {
  slug: string;
  aiStatus?: AIStatus | null;
  onBackToDashboard: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  slug,
  aiStatus: _aiStatus,
  onBackToDashboard,
}) => {
  const [desk, setDesk] = useState<HelpDeskDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tickets' | 'context' | 'settings'>('tickets');

  // Tickets state
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [catFilter, setCatFilter] = useState<number | undefined>(undefined);
  const [selectedTicketCode, setSelectedTicketCode] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Context state
  const [contextData, setContextData] = useState<HelpDeskContextData | null>(null);
  const [contextContent, setContextContent] = useState('');
  const [savingContext, setSavingContext] = useState(false);
  const [contextSaved, setContextSaved] = useState(false);
  const [showIngestModal, setShowIngestModal] = useState(false);

  const fetchDeskAndTickets = async () => {
    try {
      const deskData = await api.getDeskDetails(slug);
      setDesk(deskData);
      const ticketsData = await api.getTickets(slug, statusFilter, catFilter);
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

  useEffect(() => {
    fetchDeskAndTickets();
  }, [slug, statusFilter, catFilter]);

  useEffect(() => {
    if (activeTab === 'context') {
      fetchContext();
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
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-rose-500 text-white shadow-xs scale-[1.02]'
              : 'text-secondary hover:text-primary hover:bg-surface'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Configuración & SLAs
        </button>
      </div>

      {/* Tab 1: Tickets List */}
      {activeTab === 'tickets' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Status filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: 'Todos' },
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
                      : 'bg-surface border border-hairline text-secondary hover:text-primary'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Category Filter & New Ticket button */}
            <div className="flex items-center gap-2.5">
              <select
                value={catFilter ?? ''}
                onChange={(e) => setCatFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                className="craft-input text-xs py-1.5 cursor-pointer"
              >
                <option value="">Todas las Categorías</option>
                {desk.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="craft-btn-primary text-xs shadow-sm whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Nuevo Caso
              </button>
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
                Los casos nuevos que se radiquen aparecerán organizados aquí con su respectivo SLA.
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-500 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20">
                        {t.ticket_code}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-canvas border border-hairline text-secondary uppercase tracking-wider">
                        {t.category_name}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-canvas border border-hairline text-secondary uppercase tracking-wider">
                        {t.priority_name}
                      </span>
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

      {/* Tab 2: Living Support Memory */}
      {activeTab === 'context' && (
        <div className="craft-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-rose-500 shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-primary">
                  Memoria de Soporte del Equipo
                </h3>
                {contextData && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-canvas border border-hairline text-secondary font-semibold">
                    Versión {contextData.version}
                  </span>
                )}
              </div>
              <p className="text-xs text-secondary mt-1">
                Conocimiento acumulado de soluciones y políticas de atención. La IA utiliza esta base para formular respuestas y diagnósticos precisos.
              </p>
            </div>

            {desk.user_role === 'admin' && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowIngestModal(true)}
                  className="craft-btn-secondary text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
                  Sintetizar Casos
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
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-hairline bg-canvas p-5 shadow-xs">
            <textarea
              rows={16}
              value={contextContent}
              readOnly={desk.user_role !== 'admin'}
              onChange={(e) => setContextContent(e.target.value)}
              className="craft-input w-full text-xs leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Settings & SLAs */}
      {activeTab === 'settings' && (
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
