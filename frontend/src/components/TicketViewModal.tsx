import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, MessageSquare, AlertCircle, FileText, 
  Send, Lock, ChevronDown, ChevronUp, Wrench
} from 'lucide-react';
import { api, TicketDetail, Priority } from '../api';

interface TicketViewModalProps {
  slug: string;
  ticketCode: string;
  userRole?: string;
  priorities?: Priority[];
  onClose: () => void;
  onOpenAttend: (ticket: TicketDetail) => void;
  onTicketUpdated: () => void;
}

export const TicketViewModal: React.FC<TicketViewModalProps> = ({
  slug,
  ticketCode,
  userRole = 'requester',
  priorities = [],
  onClose,
  onOpenAttend,
  onTicketUpdated,
}) => {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userComment, setUserComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});

  const isStaff = userRole === 'admin' || userRole === 'agent';

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTicketDetail(slug, ticketCode);
      setTicket(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el caso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [ticketCode]);

  const handleAddUserComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;
    setSubmittingComment(true);

    try {
      await api.addTicketComment(slug, ticketCode, userComment.trim(), false);
      setUserComment('');
      fetchDetail();
      onTicketUpdated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAssignPriority = async (newPriorityId: number) => {
    if (!isStaff) return;
    setUpdatingPriority(true);
    try {
      await api.updateTicketPriority(slug, ticketCode, newPriorityId);
      fetchDetail();
      onTicketUpdated();
    } catch (err: any) {
      alert(err.message || 'Error al asignar prioridad');
    } finally {
      setUpdatingPriority(false);
    }
  };

  const toggleCommentExpand = (id: number) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const statusLabels: Record<string, string> = {
    open: 'Abierto (En cola)',
    in_progress: 'En Atención Activa',
    waiting: 'En Espera de Información',
    resolved: 'Resuelto',
    closed: 'Cerrado',
  };

  return (
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
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-hairline bg-surface shadow-2xl overflow-hidden transition-all"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-hairline flex items-start justify-between gap-4 bg-canvas">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-rose-500 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                {ticket?.ticket_code || ticketCode}
              </span>

              {ticket && (
                <>
                  <span className="text-xs px-3 py-1 rounded-full bg-surface border border-hairline text-secondary uppercase font-semibold">
                    {ticket.category_name}
                  </span>

                  {ticket.priority_name && ticket.priority_name !== 'Sin prioridad asignada' ? (
                    <span className="text-xs px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-semibold">
                      Prioridad: {ticket.priority_name}
                    </span>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-full bg-surface border border-hairline text-secondary font-medium italic">
                      Sin prioridad asignada
                    </span>
                  )}

                  <span className="text-xs px-3 py-1 rounded-full bg-surface border border-hairline text-primary font-semibold">
                    {statusLabels[ticket.status] || ticket.status}
                  </span>
                </>
              )}
            </div>

            {ticket && (
              <h2 className="text-xl font-bold text-primary tracking-tight">
                {ticket.title}
              </h2>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-secondary hover:text-primary hover:bg-surface cursor-pointer transition-all hover:scale-110 active:scale-95 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-secondary space-y-3">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Cargando información completa del caso...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
            <p className="text-xs text-rose-500 font-medium">{error}</p>
            <button onClick={onClose} className="craft-btn-secondary text-xs rounded-full">
              Cerrar
            </button>
          </div>
        ) : ticket ? (
          <>
            {/* Action Bar for Support Staff (Atender button & quick priority assignment) */}
            {isStaff && (
              <div className="px-6 py-3.5 bg-rose-500/5 border-b border-rose-500/20 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-secondary font-medium">Triaje de Caso:</span>
                  {(!ticket.priority_id || ticket.priority_name === 'Sin prioridad asignada') ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-rose-500">Asignar Prioridad:</span>
                      <select
                        disabled={updatingPriority}
                        onChange={(e) => e.target.value && handleAssignPriority(parseInt(e.target.value))}
                        defaultValue=""
                        className="craft-input py-1 px-3 text-xs rounded-full cursor-pointer bg-surface"
                      >
                        <option value="" disabled>Seleccionar nivel...</option>
                        {priorities.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (SLA: {p.sla_resolution_hours}h)
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-secondary">SLA Resolución:</span>
                      <strong className="text-primary font-bold">{ticket.sla_resolution_hours || 24} horas</strong>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAttend(ticket)}
                  className="craft-btn-primary px-5 py-2 text-xs font-bold shadow-md rounded-full flex items-center gap-2"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Atender Caso Formalmente
                </button>
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Requester & Meta Information Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-canvas border border-hairline text-xs">
                <div>
                  <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block">Radicado Por</span>
                  <span className="font-semibold text-primary mt-0.5 block">{ticket.requester_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block">Fecha y Hora</span>
                  <span className="text-secondary mt-0.5 block">
                    {new Date(ticket.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block">Especialista Asignado</span>
                  <span className="font-semibold text-primary mt-0.5 block">
                    {ticket.assignee_name || 'Sin asignar'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block">Estado Actual</span>
                  <span className="text-rose-500 font-bold mt-0.5 block">
                    {statusLabels[ticket.status] || ticket.status}
                  </span>
                </div>
              </div>

              {/* Petition Full Description Box */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <FileText className="w-4 h-4 text-rose-500" />
                  <span>Detalle Completo de la Solicitud</span>
                </div>
                <div className="p-5 rounded-2xl bg-canvas border border-hairline text-sm text-primary leading-relaxed whitespace-pre-wrap select-text shadow-xs">
                  {ticket.description}
                </div>
              </div>

              {/* Complete Responses & Tracking Timeline */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-hairline">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <MessageSquare className="w-4 h-4 text-rose-500" />
                    <span>Seguimiento y Respuestas Registradas ({ticket.comments.length})</span>
                  </div>
                  <span className="text-[11px] text-secondary font-medium">Texto íntegro sin recortes</span>
                </div>

                {ticket.comments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-secondary italic bg-canvas rounded-2xl border border-hairline">
                    Aún no se han registrado respuestas o actualizaciones en este caso.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ticket.comments.map((c) => {
                      const isLong = c.message.length > 280;
                      const isExpanded = expandedComments[c.id];

                      return (
                        <div
                          key={c.id}
                          className={`p-4 rounded-2xl border text-xs space-y-2 shadow-xs transition-all ${
                            c.is_internal
                              ? 'bg-rose-500/5 border-rose-500/25'
                              : 'bg-canvas border-hairline'
                          }`}
                        >
                          <div className="flex items-center justify-between text-secondary">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary text-xs">{c.user_name}</span>
                              {c.is_internal && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/25 flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Nota Interna de Soporte
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-secondary">
                              {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="text-primary leading-relaxed whitespace-pre-wrap select-text text-xs">
                            {isLong && !isExpanded ? `${c.message.slice(0, 280)}...` : c.message}
                          </div>

                          {isLong && (
                            <button
                              type="button"
                              onClick={() => toggleCommentExpand(c.id)}
                              className="text-rose-500 hover:text-rose-600 font-semibold text-[11px] flex items-center gap-1 cursor-pointer pt-1"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3 h-3" /> Ver menos
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3" /> Leer texto completo
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Follow-up Form for Requester */}
            {!isStaff && ticket.status !== 'closed' && (
              <form onSubmit={handleAddUserComment} className="p-4 border-t border-hairline bg-canvas">
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    required
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Escribe una respuesta o actualización para el equipo de soporte..."
                    className="craft-input flex-1 text-xs rounded-full"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !userComment.trim()}
                    className="craft-btn-primary text-xs shrink-0 rounded-full"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingComment ? 'Enviando...' : 'Enviar Respuesta'}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : null}
      </motion.div>
    </motion.div>
  );
};
