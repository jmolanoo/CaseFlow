import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Check, Send, Sparkles, AlertCircle, CornerDownLeft, 
  UserCheck, ShieldCheck, FileText, Lock, MessageSquare, Wrench
} from 'lucide-react';
import { 
  api, TicketDetail, CopilotSuggestion, 
  CopilotDiagnosis, CopilotSummary 
} from '../api';

interface TicketAttendModalProps {
  slug: string;
  ticket: TicketDetail;
  currentUser?: { id: number; full_name: string } | null;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export const TicketAttendModal: React.FC<TicketAttendModalProps> = ({
  slug,
  ticket,
  currentUser,
  onClose,
  onTicketUpdated,
}) => {
  // Manual comment / response state
  const [manualResponse, setManualResponse] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [responseSuccessMsg, setResponseSuccessMsg] = useState<string | null>(null);

  // Status & resolution diagnostic state
  const [currentStatus, setCurrentStatus] = useState<string>(ticket.status);
  const [diagnosticText, setDiagnosticText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Copilot AI state
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotMode, setCopilotMode] = useState<'suggestion' | 'diagnosis' | 'summary' | null>(null);
  const [suggestion, setSuggestion] = useState<CopilotSuggestion | null>(null);
  const [diagnosis, setDiagnosis] = useState<CopilotDiagnosis | null>(null);
  const [summary, setSummary] = useState<CopilotSummary | null>(null);
  const [copilotFeedback, setCopilotFeedback] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'resolved' && !diagnosticText.trim()) {
      setCurrentStatus('resolved');
      return;
    }

    setUpdatingStatus(true);
    setErrorMsg(null);
    try {
      await api.updateTicketStatus(slug, ticket.ticket_code, newStatus, diagnosticText.trim() || undefined);
      setCurrentStatus(newStatus);
      setDiagnosticText('');
      onTicketUpdated();
      setResponseSuccessMsg(`Estado actualizado a: ${newStatus.toUpperCase()}`);
      setTimeout(() => setResponseSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cambiar estado');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignToMe = async () => {
    if (!currentUser) return;
    setAssigning(true);
    try {
      await api.assignTicket(slug, ticket.ticket_code, currentUser.id);
      onTicketUpdated();
      setResponseSuccessMsg(`Caso asignado exitosamente a ${currentUser.full_name}`);
      setTimeout(() => setResponseSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al auto-asignar');
    } finally {
      setAssigning(false);
    }
  };

  const handleSendManualResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualResponse.trim()) return;
    setSubmittingResponse(true);
    setErrorMsg(null);

    try {
      await api.addTicketComment(slug, ticket.ticket_code, manualResponse.trim(), isInternal);
      setManualResponse('');
      setIsInternal(false);
      onTicketUpdated();
      setResponseSuccessMsg(
        isInternal 
          ? 'Nota interna guardada para el equipo técnico.' 
          : 'Respuesta manual enviada al solicitante.'
      );
      setTimeout(() => setResponseSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la respuesta');
    } finally {
      setSubmittingResponse(false);
    }
  };

  // AI Copilot handlers
  const handleFetchSuggestion = async () => {
    setCopilotLoading(true);
    setCopilotMode('suggestion');
    try {
      const res = await api.getCopilotSuggestedReply(slug, ticket.ticket_code);
      setSuggestion(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al generar sugerencia inteligente');
      setCopilotMode(null);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleFetchDiagnosis = async () => {
    setCopilotLoading(true);
    setCopilotMode('diagnosis');
    try {
      const res = await api.getCopilotDiagnosis(slug, ticket.ticket_code);
      setDiagnosis(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al generar diagnóstico de causa raíz');
      setCopilotMode(null);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleFetchSummary = async () => {
    setCopilotLoading(true);
    setCopilotMode('summary');
    try {
      const res = await api.getCopilotSummary(slug, ticket.ticket_code);
      setSummary(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al generar resumen');
      setCopilotMode(null);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleInsertSuggestionIntoManual = (text: string) => {
    setManualResponse((prev) => (prev ? `${prev}\n\n${text}` : text));
    setCopilotFeedback('¡Sugerencia insertada en tu editor de respuesta manual para personalizar!');
    setTimeout(() => setCopilotFeedback(null), 3000);
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
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-hairline bg-surface shadow-2xl overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="p-6 border-b border-hairline flex items-start justify-between gap-4 bg-canvas">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-primary tracking-tight">
                  Consola de Atención • Caso {ticket.ticket_code}
                </h2>
                <p className="text-xs text-secondary">
                  {ticket.title}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-secondary hover:text-primary hover:bg-surface cursor-pointer transition-all hover:scale-110 active:scale-95 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {responseSuccessMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{responseSuccessMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Scrollable Workspace Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-7">
          {/* Section 1: Quick Status Transitions & Assignment */}
          <div className="p-5 rounded-3xl bg-canvas border border-hairline space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Estado y Transición del Caso
                </h3>
                <span className="text-[11px] text-secondary">
                  Actualiza el ciclo de vida del requerimiento.
                </span>
              </div>

              {/* Assignment Button */}
              {ticket.assignee_name !== currentUser?.full_name && (
                <button
                  type="button"
                  disabled={assigning}
                  onClick={handleAssignToMe}
                  className="craft-btn-secondary text-xs rounded-full py-1.5 px-4 self-start sm:self-auto"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  {assigning ? 'Asignando...' : 'Asignarme a mí'}
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { key: 'open', label: 'Abierto' },
                { key: 'in_progress', label: 'En Progreso' },
                { key: 'waiting', label: 'En Espera de Datos' },
                { key: 'resolved', label: 'Resuelto' },
                { key: 'closed', label: 'Cerrado' },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(s.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                    currentStatus === s.key
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-surface border border-hairline text-secondary hover:text-primary'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Diagnostic Field when Resolving */}
            {currentStatus === 'resolved' && (
              <div className="pt-3 border-t border-hairline space-y-2">
                <label className="block text-xs font-bold text-rose-500">
                  Diagnóstico y Solución Definitiva (Alimenta la memoria de la mesa)
                </label>
                <textarea
                  rows={2}
                  value={diagnosticText}
                  onChange={(e) => setDiagnosticText(e.target.value)}
                  placeholder="Explica qué causó la incidencia y cómo se resolvió para enriquecer el contexto colectivo..."
                  className="craft-input w-full text-xs"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={updatingStatus || !diagnosticText.trim()}
                    onClick={() => handleStatusChange('resolved')}
                    className="craft-btn-primary text-xs rounded-full py-1.5 px-4 disabled:opacity-50"
                  >
                    Confirmar Resolución
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Manual Response Composer (Prominent & Spacious) */}
          <div className="p-5 rounded-3xl bg-canvas border border-hairline space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-hairline">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Componer Respuesta Manual de Soporte
                </h3>
              </div>
              <span className="text-[11px] text-secondary">
                Redacta libremente o inserta sugerencias del Copilot
              </span>
            </div>

            <form onSubmit={handleSendManualResponse} className="space-y-3">
              <textarea
                rows={5}
                required
                value={manualResponse}
                onChange={(e) => setManualResponse(e.target.value)}
                placeholder="Escribe la respuesta técnica o manual detallada para el usuario, instrucciones paso a paso, solución o nota interna..."
                className="craft-input w-full text-xs leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded-full border-hairline text-rose-500 focus:ring-rose-500 w-4 h-4"
                  />
                  <Lock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Nota Interna (visible únicamente para agentes y administradores)</span>
                </label>

                <button
                  type="submit"
                  disabled={submittingResponse || !manualResponse.trim()}
                  className="craft-btn-primary text-xs rounded-full py-2 px-6 flex items-center gap-2 self-end sm:self-auto shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingResponse ? 'Registrando...' : (isInternal ? 'Guardar Nota Interna' : 'Enviar Respuesta al Usuario')}
                </button>
              </div>
            </form>
          </div>

          {/* Section 3: AI Copilot Assistance Drawer */}
          <div className="p-5 rounded-3xl bg-surface border border-hairline space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Copilot de Inteligencia Artificial (BYOK)
                </h3>
              </div>
              <span className="text-[11px] text-secondary">
                Consulta la memoria contextual de la mesa
              </span>
            </div>

            {/* Triggers */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={copilotLoading}
                onClick={handleFetchSuggestion}
                className="craft-btn-secondary text-xs rounded-full py-1.5 px-4"
              >
                <Sparkles className="w-3 h-3 text-rose-500" />
                Sugerir Respuesta
              </button>

              <button
                type="button"
                disabled={copilotLoading}
                onClick={handleFetchDiagnosis}
                className="craft-btn-secondary text-xs rounded-full py-1.5 px-4"
              >
                <ShieldCheck className="w-3 h-3 text-rose-500" />
                Diagnóstico de Causa Raíz
              </button>

              <button
                type="button"
                disabled={copilotLoading}
                onClick={handleFetchSummary}
                className="craft-btn-secondary text-xs rounded-full py-1.5 px-4"
              >
                <FileText className="w-3 h-3 text-rose-500" />
                Resumen Ejecutivo
              </button>
            </div>

            {copilotLoading && (
              <div className="p-4 rounded-2xl bg-canvas border border-hairline text-center text-xs text-secondary flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <span>Consultando la memoria del Help Desk y formulando asistencia técnica...</span>
              </div>
            )}

            {copilotFeedback && (
              <div className="text-xs text-rose-500 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                {copilotFeedback}
              </div>
            )}

            {/* Suggestion Card with Copy to Manual Action */}
            {copilotMode === 'suggestion' && suggestion && (
              <div className="p-4 rounded-2xl bg-canvas border border-rose-500/25 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    Propuesta Generada por IA ({suggestion.source})
                  </span>
                  <span className="text-[11px] text-secondary">
                    {suggestion.explanation}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-hairline text-xs text-primary whitespace-pre-wrap leading-relaxed select-text">
                  {suggestion.suggested_reply}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleInsertSuggestionIntoManual(suggestion.suggested_reply)}
                    className="craft-btn-primary text-xs rounded-full py-1.5 px-4 flex items-center gap-1.5 shadow-sm"
                  >
                    <CornerDownLeft className="w-3.5 h-3.5" />
                    Insertar en Editor Manual
                  </button>
                </div>
              </div>
            )}

            {/* Diagnosis Card */}
            {copilotMode === 'diagnosis' && diagnosis && (
              <div className="p-4 rounded-2xl bg-canvas border border-rose-500/25 space-y-2 text-xs">
                <span className="font-bold text-primary block">
                  Diagnóstico y Análisis de Causa Raíz
                </span>
                <p className="text-secondary leading-relaxed whitespace-pre-wrap">
                  {diagnosis.diagnosis}
                </p>
                {diagnosis.recommended_steps && diagnosis.recommended_steps.length > 0 && (
                  <div className="space-y-1 pt-2">
                    <span className="font-bold text-primary block">Pasos Sugeridos:</span>
                    {diagnosis.recommended_steps.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-secondary">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Summary Card */}
            {copilotMode === 'summary' && summary && (
              <div className="p-4 rounded-2xl bg-canvas border border-rose-500/25 space-y-2 text-xs">
                <span className="font-bold text-primary block">Resumen Ejecutivo del Hilo</span>
                <p className="text-secondary leading-relaxed">{summary.summary}</p>
                {summary.key_points.length > 0 && (
                  <div className="space-y-1 pt-2">
                    <span className="font-bold text-primary block">Puntos Clave:</span>
                    {summary.key_points.map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-secondary">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-hairline bg-canvas flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="craft-btn-secondary text-xs rounded-full py-2 px-6"
          >
            Cerrar Consola
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
