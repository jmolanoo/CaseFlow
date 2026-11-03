import React, { useState, useEffect } from 'react';
import { 
  X, Clock, Send, User, 
  MessageSquare, AlertCircle
} from 'lucide-react';
import { api, TicketDetail } from '../api';

interface TicketDetailModalProps {
  slug: string;
  ticketCode: string;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  slug,
  ticketCode,
  onClose,
  onTicketUpdated,
}) => {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [statusVal, setStatusVal] = useState<string>('open');
  const [diagnostic, setDiagnostic] = useState('');
  const [showDiagnosticField, setShowDiagnosticField] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (newStatus === 'resolved' && !diagnostic) {
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);

    try {
      await api.addTicketComment(slug, ticketCode, commentText.trim());
      setCommentText('');
      fetchDetail();
      onTicketUpdated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingComment(false);
    }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-hairline bg-surface shadow-2xl overflow-hidden transition-all">
        {/* Top Header */}
        <div className="p-5 border-b border-hairline flex items-start justify-between gap-4 bg-canvas">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-rose-500 px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20">
                {ticket.ticket_code}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-surface border border-hairline text-secondary uppercase font-semibold">
                {ticket.category_name}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-surface border border-hairline text-secondary uppercase font-semibold">
                {ticket.priority_name}
              </span>
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
              <select
                value={statusVal}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="craft-input text-xs py-1 px-2.5 font-semibold cursor-pointer"
              >
                <option value="open">Abierto (En cola)</option>
                <option value="in_progress">En Progreso</option>
                <option value="waiting_client">En Espera de Información</option>
                <option value="resolved">Resuelto y Cerrado</option>
              </select>
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

          {/* Diagnostic Note Prompt if resolving */}
          {showDiagnosticField && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2.5 shadow-xs">
              <span className="text-xs font-bold text-rose-500 block">
                Diagnóstico de Cierre y Solución:
              </span>
              <p className="text-xs text-secondary">
                Documenta la causa y solución aplicada. Esta información se integrará automáticamente en la memoria de soporte del equipo.
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
                  Confirmar Cierre
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
            <div className="pt-2 text-xs text-secondary flex items-center gap-1.5 border-t border-hairline">
              <User className="w-3.5 h-3.5 text-secondary" />
              Solicitado por: <strong className="text-primary">{ticket.requester_name}</strong>
            </div>
          </div>

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
                    className="p-3.5 rounded-xl bg-canvas border border-hairline text-xs space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-secondary">
                      <span className="font-semibold text-primary">{c.user_name}</span>
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
        <form onSubmit={handleAddComment} className="p-4 border-t border-hairline bg-canvas flex gap-2.5">
          <input
            type="text"
            required
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escribe una respuesta o actualización del caso..."
            className="craft-input flex-1 text-xs"
          />
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="craft-btn-primary text-xs shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            {submittingComment ? 'Enviando...' : 'Responder'}
          </button>
        </form>
      </div>
    </div>
  );
};
