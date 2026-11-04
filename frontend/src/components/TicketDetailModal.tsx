import React, { useState, useEffect } from 'react';
import { 
  X, Clock, Send, User, 
  MessageSquare, AlertCircle, Sparkles, Activity, FileText, 
  Check, CornerDownLeft, UserCheck, RefreshCw, CheckCircle2, Lock
} from 'lucide-react';
import { 
  api, TicketDetail, CopilotSuggestion, 
  CopilotDiagnosis, CopilotSummary 
} from '../api';

interface TicketDetailModalProps {
  slug: string;
  ticketCode: string;
  currentUser?: { id: number; full_name: string } | null;
  userRole?: string;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  slug,
  ticketCode,
  currentUser,
  userRole = 'requester',
  onClose,
  onTicketUpdated,
}) => {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [statusVal, setStatusVal] = useState<string>('open');
  const [diagnostic, setDiagnostic] = useState('');
  const [showDiagnosticField, setShowDiagnosticField] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Copilot state
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotMode, setCopilotMode] = useState<'suggestion' | 'diagnosis' | 'summary' | null>(null);
  const [suggestion, setSuggestion] = useState<CopilotSuggestion | null>(null);
  const [diagnosis, setDiagnosis] = useState<CopilotDiagnosis | null>(null);
  const [summary, setSummary] = useState<CopilotSummary | null>(null);
  const [copilotFeedback, setCopilotFeedback] = useState<string | null>(null);

  const isStaff = userRole === 'admin' || userRole === 'agent';

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTicketDetail(slug, ticketCode);
      setTicket(data);
      setStatusVal(data.status);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el caso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [ticketCode]);

  const handleStatusChange = async (newStatus: string) => {
    if (isStaff && newStatus === 'resolved' && !diagnostic) {
      setShowDiagnosticField(true);
      setStatusVal(newStatus);
      return;
    }

    setUpdatingStatus(true);
    try {
      await api.updateTicketStatus(slug, ticketCode, newStatus, diagnostic);
      setDiagnostic('');
      setShowDiagnosticField(false);
      onTicketUpdated();
      fetchDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignToMe = async () => {
    if (!currentUser || !isStaff) return;
    setAssigning(true);
    try {
      await api.assignTicket(slug, ticketCode, currentUser.id);
      fetchDetail();
      onTicketUpdated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);

    try {
      const sendInternal = isStaff ? isInternalComment : false;
      await api.addTicketComment(slug, ticketCode, commentText.trim(), sendInternal);
      setCommentText('');
      setIsInternalComment(false);
      fetchDetail();
      onTicketUpdated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Copilot triggers (Staff only)
  const handleFetchSuggestion = async () => {
    if (!isStaff) return;
    setCopilotLoading(true);
    setCopilotMode('suggestion');
    try {
      const res = await api.getCopilotSuggestedReply(slug, ticketCode);
      setSuggestion(res);
    } catch (err: any) {
      alert(err.message || 'Error al generar sugerencia');
      setCopilotMode(null);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleFetchDiagnosis = async () => {
    if (!isStaff) return;
    setCopilotLoading(true);
    setCopilotMode('diagnosis');
    try {
      const res = await api.getCopilotDiagnosis(slug, ticketCode);
      setDiagnosis(res);
    } catch (err: any) {
      alert(err.message || 'Error al generar diagnóstico');
      setCopilotMode(null);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleFetchSummary = async () => {
    setCopilotLoading(true);
    setCopilotMode('summary');
    try {
      const res = await api.getCopilotSummary(slug, ticketCode);
      setSummary(res);
    } catch (err: any) {
      alert(err.message || 'Error al generar resumen');
      setCopilotMode(null);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleInsertSuggestion = (text: string) => {
    setCommentText(text);
    setCopilotFeedback('¡Propuesta insertada en la respuesta!');
    setTimeout(() => setCopilotFeedback(null), 3000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="w-full max-w-2xl rounded-2xl border border-hairline bg-surface p-8 text-center text-xs text-secondary shadow-2xl">
          Cargando caso de soporte {ticketCode}...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="w-full max-w-md rounded-2xl border border-hairline bg-surface p-7 text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
          <p className="text-xs text-rose-500 font-medium">{error}</p>
          <button onClick={onClose} className="craft-btn-secondary text-xs">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const statusLabels: Record<string, string> = {
    open: 'Abierto (En cola)',
    in_progress: 'En Progreso',
    waiting: 'En Espera de Información',
    resolved: 'Resuelto y Cerrado',
    closed: 'Cerrado',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-hairline bg-surface shadow-2xl overflow-hidden transition-all">
        {/* Top Header */}
        <div className="p-5 border-b border-hairline flex items-start justify-between gap-4 bg-canvas">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-rose-500 px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20">
                {ticket.ticket_code}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-surface border border-hairline text-secondary uppercase font-semibold">
                {ticket.category_name}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-surface border border-hairline text-secondary uppercase font-semibold">
                {ticket.priority_name}
              </span>

              {ticket.assignee_name ? (
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 font-semibold flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  {ticket.assignee_name}
                </span>
              ) : (
                isStaff && (
                  <button
                    type="button"
                    disabled={assigning}
                    onClick={handleAssignToMe}
                    className="text-xs px-2.5 py-0.5 rounded-md bg-surface hover:bg-canvas border border-hairline text-secondary hover:text-primary font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3 h-3 text-rose-500" />
                    {assigning ? 'Asignando...' : 'Tomar Caso (Asignarme)'}
                  </button>
                )
              )}
            </div>
            <h2 className="text-base font-bold text-primary leading-snug">
              {ticket.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status and SLA bar */}
          <div className="p-3.5 rounded-xl bg-canvas border border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-secondary">Estado Actual:</span>
              
              {isStaff ? (
                <select
                  value={statusVal}
                  disabled={updatingStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="craft-input text-xs py-1 px-2.5 font-semibold cursor-pointer"
                >
                  <option value="open">Abierto (En cola)</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="waiting">En Espera de Información</option>
                  <option value="resolved">Resuelto y Cerrado</option>
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                    ticket.status === 'resolved' || ticket.status === 'closed'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : ticket.status === 'in_progress'
                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      : 'bg-zinc-500/10 text-secondary border-hairline'
                  }`}>
                    {statusLabels[ticket.status] || ticket.status}
                  </span>

                  {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                    <button
                      type="button"
                      disabled={updatingStatus}
                      onClick={() => handleStatusChange('closed')}
                      className="craft-btn-secondary text-xs py-1 px-2.5 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/30"
                      title="Confirmar conformidad y cerrar mi caso"
                    >
                      <Check className="w-3 h-3 text-emerald-500 inline mr-1" />
                      Dar por Resuelto
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-secondary font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" />
                Límite: <strong className="text-primary">{ticket.sla_resolution_hours}h</strong>
              </span>
              <span>
                Creado: {new Date(ticket.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Diagnostic Note Prompt if resolving (Staff only) */}
          {isStaff && showDiagnosticField && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2.5 shadow-xs">
              <span className="text-xs font-bold text-rose-500 block">
                Diagnóstico de Cierre y Aprendizaje Activo:
              </span>
              <p className="text-xs text-secondary">
                Documenta la causa y la solución aplicada. Esta información se inyectará de forma automática e inmediata en la memoria de soporte del equipo para que la IA la utilice en incidentes similares.
              </p>
              <textarea
                rows={2}
                value={diagnostic}
                onChange={(e) => setDiagnostic(e.target.value)}
                placeholder="Describe la solución aplicada de manera concisa..."
                className="craft-input w-full text-xs"
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDiagnosticField(false)}
                  className="craft-btn-secondary text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!diagnostic.trim()}
                  onClick={() => handleStatusChange('resolved')}
                  className="craft-btn-primary text-xs"
                >
                  Confirmar Cierre y Enriquecer Memoria
                </button>
              </div>
            </div>
          )}

          {/* Ticket Description */}
          <div className="p-4 rounded-xl bg-surface border border-hairline space-y-2 shadow-xs">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
              Descripción del Caso
            </span>
            <p className="text-xs text-primary leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
            <div className="pt-2 text-xs text-secondary flex items-center justify-between border-t border-hairline">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-secondary" />
                Solicitado por: <strong className="text-primary">{ticket.requester_name}</strong>
              </span>
              {ticket.assignee_name && (
                <span className="text-[11px] text-secondary">
                  Especialista a cargo: <strong className="text-primary">{ticket.assignee_name}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Staff-only: Copilot Action Bar */}
          {isStaff && (
            <div className="rounded-xl border border-hairline bg-canvas p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-primary">
                    Copiloto de Soporte Asistido
                  </span>
                </div>
                <span className="text-[11px] text-secondary">
                  Alimentado por la memoria viva del equipo
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={copilotLoading}
                  onClick={handleFetchSuggestion}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-150 border ${
                    copilotMode === 'suggestion'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-surface border-hairline text-secondary hover:text-primary hover:border-rose-500/30'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  Sugerir Respuesta
                </button>

                <button
                  type="button"
                  disabled={copilotLoading}
                  onClick={handleFetchDiagnosis}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-150 border ${
                    copilotMode === 'diagnosis'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-surface border-hairline text-secondary hover:text-primary hover:border-rose-500/30'
                  }`}
                >
                  <Activity className="w-3 h-3 text-rose-500" />
                  Diagnóstico y Casos Similares
                </button>

                <button
                  type="button"
                  disabled={copilotLoading}
                  onClick={handleFetchSummary}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-150 border ${
                    copilotMode === 'summary'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-surface border-hairline text-secondary hover:text-primary hover:border-rose-500/30'
                  }`}
                >
                  <FileText className="w-3 h-3 text-rose-500" />
                  Resumen Ejecutivo
                </button>
              </div>

              {/* Copilot Loading */}
              {copilotLoading && (
                <div className="p-4 rounded-xl bg-surface border border-hairline text-center text-xs text-secondary flex items-center justify-center gap-2 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
                  Consultando la memoria del equipo y formulando asistencia técnica...
                </div>
              )}

              {/* Copilot Suggestion Card */}
              {copilotMode === 'suggestion' && suggestion && !copilotLoading && (
                <div className="p-4 rounded-xl bg-surface border border-rose-500/25 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs text-secondary border-b border-hairline pb-2">
                    <span className="font-bold text-rose-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Propuesta del Copiloto
                    </span>
                    <span className="text-[11px] text-secondary">
                      {suggestion.source}
                    </span>
                  </div>
                  <p className="text-xs text-primary leading-relaxed whitespace-pre-wrap font-sans">
                    {suggestion.suggested_reply}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-hairline text-xs">
                    <span className="text-secondary text-[11px] italic">
                      {suggestion.explanation}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInsertSuggestion(suggestion.suggested_reply)}
                      className="craft-btn-primary text-xs py-1 px-3 flex items-center gap-1.5 whitespace-nowrap self-end sm:self-auto"
                    >
                      <CornerDownLeft className="w-3.5 h-3.5" />
                      Insertar en Respuesta
                    </button>
                  </div>
                </div>
              )}

              {/* Copilot Diagnosis Card */}
              {copilotMode === 'diagnosis' && diagnosis && !copilotLoading && (
                <div className="p-4 rounded-xl bg-surface border border-rose-500/25 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs text-secondary border-b border-hairline pb-2">
                    <span className="font-bold text-rose-500 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      Diagnóstico Técnico y Acciones Recomendadas
                    </span>
                  </div>
                  <p className="text-xs text-primary leading-relaxed">
                    {diagnosis.diagnosis}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                      Pasos Sugeridos:
                    </span>
                    {diagnosis.recommended_steps.map((st, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-primary">
                        <span className="w-4 h-4 rounded-full bg-rose-500/10 text-rose-500 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-hairline">
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block mb-1">
                      Casos Históricos Similares Identificados:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {diagnosis.similar_cases.map((sc, idx) => (
                        <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-canvas border border-hairline text-secondary">
                          {sc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Copilot Summary Card */}
              {copilotMode === 'summary' && summary && !copilotLoading && (
                <div className="p-4 rounded-xl bg-surface border border-rose-500/25 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs text-secondary border-b border-hairline pb-2">
                    <span className="font-bold text-rose-500 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Resumen Ejecutivo del Caso
                    </span>
                  </div>
                  <p className="text-xs text-primary leading-relaxed">
                    {summary.summary}
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {summary.key_points.map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-primary">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {copilotFeedback && (
                <div className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5 pt-1">
                  <Check className="w-3.5 h-3.5" />
                  {copilotFeedback}
                </div>
              )}
            </div>
          )}

          {/* Activity / Comments Timeline */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <MessageSquare className="w-4 h-4 text-rose-500" />
              <span>Respuestas y Seguimiento ({ticket.comments.length})</span>
            </div>

            {ticket.comments.length === 0 ? (
              <p className="text-xs text-secondary italic py-3 text-center bg-canvas rounded-xl border border-hairline">
                No hay respuestas registradas aún en este caso.
              </p>
            ) : (
              <div className="space-y-2.5">
                {ticket.comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 shadow-xs ${
                      c.is_internal
                        ? 'bg-amber-500/5 border-amber-500/30 dark:bg-amber-500/10'
                        : 'bg-canvas border-hairline'
                    }`}
                  >
                    <div className="flex items-center justify-between text-secondary">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">{c.user_name}</span>
                        {c.is_internal && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Nota Interna
                          </span>
                        )}
                      </div>
                      <span className="text-[11px]">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-secondary leading-relaxed whitespace-pre-wrap text-xs">
                      {c.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reply Form Footer */}
        <form onSubmit={handleAddComment} className="p-4 border-t border-hairline bg-canvas space-y-2">
          {isStaff && (
            <div className="flex items-center gap-2 px-1">
              <label className="flex items-center gap-1.5 text-[11px] text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isInternalComment}
                  onChange={(e) => setIsInternalComment(e.target.checked)}
                  className="rounded border-hairline text-rose-500 focus:ring-rose-500"
                />
                <Lock className="w-3 h-3 text-amber-500" />
                <span>Nota Interna (visible solo para agentes y administradores)</span>
              </label>
            </div>
          )}

          <div className="flex gap-2.5">
            <input
              type="text"
              required
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                isInternalComment
                  ? 'Escribe una nota interna para el equipo técnico...'
                  : 'Escribe una respuesta o actualización del caso...'
              }
              className={`craft-input flex-1 text-xs ${
                isInternalComment ? 'border-amber-500/40 focus:border-amber-500' : ''
              }`}
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className={`craft-btn-primary text-xs shrink-0 ${
                isInternalComment ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              {submittingComment ? 'Enviando...' : (isInternalComment ? 'Guardar Nota' : 'Responder')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
