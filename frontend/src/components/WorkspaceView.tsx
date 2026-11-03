import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Clock, Filter, 
  Layers, Bot, Check, BookOpen, 
  Settings, RefreshCw, AlertCircle
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
  aiStatus: AIStatus | null;
  onBackToDashboard: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  slug,
  aiStatus,
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
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs font-mono text-secondary">
        Cargando espacio de trabajo...
      </div>
    );
  }

  if (!desk) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
        <h2 className="text-base font-bold text-primary">No se encontró la mesa de ayuda</h2>
        <button onClick={onBackToDashboard} className="craft-btn-secondary text-xs">
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-hairline">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="craft-btn-secondary text-xs py-1.5 px-2.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <span className="text-secondary text-xs font-mono">/</span>
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-bold text-primary">{desk.name}</h1>
            <span className="text-xs font-mono text-secondary">/{desk.slug}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-surface border border-hairline text-secondary">
            Rol: {desk.user_role}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1.5 border ${
              desk.is_ai_enabled
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                : 'bg-canvas border-hairline text-secondary'
            }`}
          >
            <Bot className="w-3 h-3" />
            {desk.is_ai_enabled ? (aiStatus?.is_connected ? `${aiStatus.provider?.toUpperCase()} • ${aiStatus.latency_ms}ms` : 'IA Habilitada') : 'Modo Manual'}
          </span>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="craft-btn-primary text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Radicar Caso
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-hairline gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'tickets'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Casos & Tickets ({tickets.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('context')}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'context'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Memoria & Contexto IA
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Configuración & SLAs
        </button>
      </div>

      {/* Tab 1: Tickets View */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-surface border border-hairline">
            <div className="flex flex-wrap items-center gap-1 text-xs">
              {(['all', 'open', 'in_progress', 'waiting', 'resolved', 'closed'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                    statusFilter === st
                      ? 'bg-canvas text-rose-500 border border-hairline font-bold'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  {st === 'all' && 'Todos'}
                  {st === 'open' && 'Abiertos'}
                  {st === 'in_progress' && 'En Progreso'}
                  {st === 'waiting' && 'En Espera'}
                  {st === 'resolved' && 'Resueltos'}
                  {st === 'closed' && 'Cerrados'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-secondary" />
              <select
                value={catFilter ?? ''}
                onChange={(e) => setCatFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                className="craft-input py-1 text-xs"
              >
                <option value="">Todas las Categorías</option>
                {desk.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tickets List */}
          {tickets.length === 0 ? (
            <div className="rounded-xl border border-hairline bg-surface p-12 text-center space-y-2">
              <Layers className="w-7 h-7 mx-auto text-secondary" />
              <p className="text-xs font-semibold text-primary">No se encontraron tickets con este filtro</p>
              <p className="text-[11px] text-secondary">Radica un nuevo caso de soporte para comenzar el flujo.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketCode(t.ticket_code)}
                  className="p-4 rounded-xl border border-hairline bg-surface hover:border-zinc-400 dark:hover:border-zinc-700 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-500 group-hover:underline">
                        {t.ticket_code}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-canvas border border-hairline text-secondary uppercase">
                        {t.category_name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border ${
                          t.status === 'open'
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                            : t.status === 'in_progress'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            : t.status === 'resolved'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            : 'bg-canvas border-hairline text-secondary'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-primary group-hover:text-rose-500 transition-colors">
                      {t.title}
                    </h4>

                    <p className="text-xs text-secondary line-clamp-1">
                      {t.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between text-[11px] font-mono text-secondary gap-1 shrink-0">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-500" />
                      SLA: {t.sla_resolution_hours}h
                    </span>
                    <span>Por: {t.requester_name}</span>
                    <span>{t.comments_count} respuestas</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Context & Memory View */}
      {activeTab === 'context' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-hairline bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-primary">
                  Help Desk Context: Memoria Organizacional
                </h3>
                {contextData && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-canvas border border-hairline text-secondary">
                    v{contextData.version}
                  </span>
                )}
              </div>
              <p className="text-xs text-secondary mt-0.5">
                Documento vivo en Markdown utilizado por el Copiloto IA para contextualizar respuestas y categorizaciones.
              </p>
            </div>

            {desk.user_role === 'admin' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowIngestModal(true)}
                  className="craft-btn-secondary text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
                  Ingesta Retrospectiva
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

          <div className="rounded-xl border border-hairline bg-canvas p-4">
            <textarea
              rows={16}
              value={contextContent}
              readOnly={desk.user_role !== 'admin'}
              onChange={(e) => setContextContent(e.target.value)}
              className="craft-input w-full font-mono text-xs leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Settings & SLAs */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Categories Card */}
          <div className="p-5 rounded-xl border border-hairline bg-surface space-y-3">
            <h3 className="text-sm font-bold text-primary">Catálogo de Categorías</h3>
            <div className="space-y-2">
              {desk.categories.map((c) => (
                <div key={c.id} className="p-2.5 rounded-lg bg-canvas border border-hairline text-xs flex justify-between">
                  <span className="font-semibold text-primary">{c.name}</span>
                  <span className="text-secondary">{c.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SLA Policies Card */}
          <div className="p-5 rounded-xl border border-hairline bg-surface space-y-3">
            <h3 className="text-sm font-bold text-primary">Matriz de Prioridades y SLAs</h3>
            <div className="space-y-2">
              {desk.priorities.map((p) => (
                <div key={p.id} className="p-2.5 rounded-lg bg-canvas border border-hairline text-xs flex justify-between font-mono">
                  <span className="font-bold text-primary">{p.name} (Nivel {p.level})</span>
                  <span className="text-secondary">
                    Resp: {p.sla_response_hours}h | Resol: {p.sla_resolution_hours}h
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
          userRole={desk.user_role}
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
