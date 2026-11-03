import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { api, Category, Priority, TicketItem } from '../api';

interface TicketCreateModalProps {
  slug: string;
  isAIEnabled: boolean;
  categories: Category[];
  priorities: Priority[];
  onClose: () => void;
  onSuccess: (newTicket: TicketItem) => void;
}

export const TicketCreateModal: React.FC<TicketCreateModalProps> = ({
  slug,
  isAIEnabled,
  categories,
  priorities,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(
    categories.length > 0 && categories[0].id ? categories[0].id : null
  );
  const [priorityId, setPriorityId] = useState<number | null>(
    priorities.length > 0 && priorities[0].id ? priorities[0].id : null
  );

  const [refining, setRefining] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected priority SLA info
  const selectedPriority = priorities.find((p) => p.id === priorityId);

  const handleRefineWithAI = async () => {
    if (!description.trim() || description.length < 5) {
      setError('Describe brevemente lo ocurrido antes de solicitar asistencia.');
      return;
    }
    setError(null);
    setRefining(true);

    try {
      const res = await api.refineTicketAI(slug, description);
      setTitle(res.suggested_title);
      if (res.suggested_category_id) {
        setCategoryId(res.suggested_category_id);
      }
      if (res.suggested_priority_id) {
        setPriorityId(res.suggested_priority_id);
      }
      setAiAnalysis(res.analysis);
    } catch (err: any) {
      setError(err.message || 'Error al analizar la incidencia');
    } finally {
      setRefining(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const newTicket = await api.createTicket(slug, {
        title,
        description,
        category_id: categoryId,
        priority_id: priorityId,
      });
      onSuccess(newTicket);
      onClose();
    } catch (err: any) {
      setError(err.message || 'No se pudo crear el caso de soporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-hairline bg-surface p-7 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-hairline">
          <div>
            <h3 className="text-base font-bold text-primary">
              Nuevo Caso de Soporte
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Registro inmediato con asignación de tiempos máximos de respuesta.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-canvas cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Description first to allow AI refinement */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-secondary">
                Descripción del Problema o Solicitud
              </label>
              {isAIEnabled && (
                <button
                  type="button"
                  disabled={refining}
                  onClick={handleRefineWithAI}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {refining ? 'Analizando caso...' : 'Asistencia Inteligente'}
                </button>
              )}
            </div>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe lo sucedido, equipo o sistema afectado, o mensaje de error..."
              className="craft-input w-full"
            />
          </div>

          {/* AI Feedback Banner */}
          {aiAnalysis && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-primary flex items-start gap-2.5">
              <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-secondary leading-relaxed text-xs">
                <strong className="text-primary font-semibold">Sugerencia Automática:</strong> {aiAnalysis}
              </p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">
              Título del Caso
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Inconveniente al sincronizar pedidos en el sistema de ventas"
              className="craft-input w-full"
            />
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Categoría del Servicio
              </label>
              <select
                value={categoryId ?? ''}
                onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                className="craft-input w-full text-xs cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Prioridad & Nivel
              </label>
              <select
                value={priorityId ?? ''}
                onChange={(e) => setPriorityId(e.target.value ? parseInt(e.target.value) : null)}
                className="craft-input w-full text-xs cursor-pointer"
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Límite: {p.sla_resolution_hours}h)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SLA Info Card */}
          {selectedPriority && (
            <div className="p-3 rounded-xl bg-canvas border border-hairline flex items-center justify-between text-xs text-secondary shadow-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-rose-500" />
                Respuesta inicial: <strong className="text-primary">{selectedPriority.sla_response_hours} horas</strong>
              </span>
              <span className="font-medium">
                Resolución estimada: <strong className="text-primary">{selectedPriority.sla_resolution_hours} horas</strong>
              </span>
            </div>
          )}

          {/* Buttons: Secondary and Primary */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="craft-btn-secondary text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title || !description}
              className="craft-btn-primary text-xs font-semibold disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Crear Caso'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
