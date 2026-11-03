import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { api, RetrospectiveIngestResult } from '../api';

interface RetrospectiveIngestionModalProps {
  slug: string;
  deskName: string;
  totalTickets: number;
  onClose: () => void;
  onSuccess: (result: RetrospectiveIngestResult) => void;
}

export const RetrospectiveIngestionModal: React.FC<RetrospectiveIngestionModalProps> = ({
  slug,
  deskName,
  totalTickets,
  onClose,
  onSuccess,
}) => {
  const [guidelines, setGuidelines] = useState('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<RetrospectiveIngestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunIngestion = async () => {
    setRunning(true);
    setError(null);
    setProgress(20);

    const interval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 15 : p));
    }, 300);

    try {
      const res = await api.ingestDeskContext(slug, guidelines);
      clearInterval(interval);
      setProgress(100);
      setResult(res);
      onSuccess(res);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Error durante la ingesta retrospectiva');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-hairline bg-surface p-6 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-canvas border border-hairline flex items-center justify-center text-rose-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary">
                Ingesta Retrospectiva de Tickets
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Mesa: <strong>{deskName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-secondary hover:text-primary hover:bg-canvas transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!result ? (
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-canvas border border-hairline text-xs space-y-2">
              <span className="text-[10px] font-mono uppercase text-secondary block">
                Alcance del Proceso de Ingesta
              </span>
              <p className="text-secondary leading-relaxed">
                El motor analizará los <strong>{totalTickets} casos registrados</strong> en esta mesa de ayuda, extrayendo patrones recurrentes, categorías habituales y diagnósticos de solución previa para construir el documento fundacional <code>Help Desk Context</code>.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-secondary mb-1">
                Directrices Organizacionales Adicionales (Opcional)
              </label>
              <textarea
                rows={3}
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                placeholder="Ej. Políticas de atención, horarios de servicio, reglas de escalamiento prioritario..."
                className="craft-input w-full text-xs"
              />
            </div>

            {running && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] font-mono text-secondary">
                  <span>Sintetizando conocimiento contextual...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-canvas border border-hairline overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={onClose}
                className="craft-btn-secondary text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={running}
                onClick={handleRunIngestion}
                className="craft-btn-primary text-xs font-semibold"
              >
                {running ? 'Ingiriendo...' : 'Iniciar Ingesta'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4 text-xs">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{result.message}</span>
            </div>

            <div className="p-3 rounded-lg bg-canvas border border-hairline space-y-1.5 font-mono text-[11px]">
              <span className="text-secondary block">
                Versión de Memoria Actualizada: <strong>v{result.version}</strong>
              </span>
              <span className="text-secondary block">
                Tickets Ingeridos: <strong>{result.processed_tickets}</strong>
              </span>
              <div className="pt-2 text-secondary whitespace-pre-wrap font-sans text-xs">
                {result.context_preview}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={onClose}
                className="craft-btn-primary text-xs"
              >
                Cerrar y Ver Memoria
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
