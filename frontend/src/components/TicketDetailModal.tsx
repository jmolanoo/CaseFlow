import React, { useState, useEffect } from 'react';
import { 
  X, Clock, Send, User, 
  MessageSquare, AlertCircle
} from 'lucide-react';
import { api, TicketDetail } from '../api';

interface TicketDetailModalProps {
  slug: string;
  ticketCode: string;
  userRole: string;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  slug,
  ticketCode,
  userRole,
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
      setError(err.message || 'Error al cargar ticket');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-2xl rounded-xl border border-hairline bg-surface p-8 text-center text-xs font-mono text-secondary">
          Cargando caso de soporte {ticketCode}...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-xl border border-hairline bg-surface p-6 text-center space-y-3">
          <AlertCircle className="w-6 h-6 mx-auto text-rose-500" />
          <p className="text-xs text-rose-500">{error}</p>
          <button onClick={onClose} className="craft-btn-secondary text-xs">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-hairline bg-surface overflow-hidden transition-all">
        {/* Top Header */}
        <div className="p-4 border-b border-hairline flex items-start justify-between gap-4 bg-canvas">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-rose-500 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                {ticket.ticket_code}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-hairline text-secondary uppercase">
                {ticket.category_name}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-hairline text-secondary uppercase">
                Prioridad: {ticket.priority_name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-canvas border border-hairline text-secondary">
                Tu Rol: {userRole}
              </span>
            </div>
            <h2 className="text-base font-bold text-primary">{ticket.title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-secondary hover:text-primary hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status & SLA Control Bar */}
          <div className="p-3 rounded-lg bg-canvas border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-secondary">Estado actual:</span>
              <select
                value={statusVal}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="craft-input py-1 text-xs font-mono font-semibold"
              >
                <option value="open">Abierto (Open)</option>
                <option value="in_progress">En Progreso</option>
                <option value="waiting">En Espera</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono text-secondary">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                SLA: {ticket.sla_resolution_hours}h límite
              </span>
              <span>
                Radicado: {new Date(ticket.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Diagnostic Note Prompt if resolving */}
          {showDiagnosticField && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-2">
              <span className="text-xs font-bold text-rose-500 block">
                Diagnóstico de Cierre y Resolución:
              </span>
              <p className="text-[11px] text-secondary">
                Documenta la causa raíz y solución aplicada. Esta información se sintetizará en el Help Desk Context.
              </p>
              <textarea
                rows={2}
                value={diagnostic}
                onChange={(e) => setDiagnostic(e.target.value)}
                placeholder="Describe la solución aplicada..."
                className="craft-input w-full text-xs"
              />
              <div className="flex justify-end gap-2">
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
                  Confirmar Resolución
                </button>
              </div>
            </div>
          )}

          {/* Ticket Description */}
          <div className="p-3.5 rounded-lg bg-surface border border-hairline space-y-1">
            <span className="text-[10px] font-mono text-secondary uppercase block">Descripción del Caso</span>
            <p className="text-xs text-primary leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
            <div className="pt-2 text-[10px] font-mono text-secondary flex items-center gap-1">
              <User className="w-3 h-3 text-secondary" />
              Solicitante: <strong className="text-primary">{ticket.requester_name}</strong>
            </div>
          </div>

          {/* Activity / Comments Timeline */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
              <span>Historial y Respuestas ({ticket.comments.length})</span>
            </div>

            {ticket.comments.length === 0 ? (
              <p className="text-xs text-secondary italic py-2">
                No hay respuestas registradas aún en este caso.
              </p>
            ) : (
              <div className="space-y-2">
                {ticket.comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg bg-canvas border border-hairline text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-secondary">
                      <span className="font-semibold text-primary">{c.user_name}</span>
                      <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-secondary leading-relaxed whitespace-pre-wrap">
                      {c.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reply Form Footer */}
        <form onSubmit={handleAddComment} className="p-3 border-t border-hairline bg-canvas flex gap-2">
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
