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
      setError(err.message || 'Error durante la síntesis de casos');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-hairline bg-surface p-7 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-rose-500 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary">
                Ingesta y Síntesis de Casos Resueltos
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Mesa: <strong className="text-primary">{deskName}</strong>
              </p>
            </div>
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

        {!result ? (
          <div className="space-y-4 py-4">
            <div className="p-3.5 rounded-xl bg-canvas border border-hairline text-xs space-y-2 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block">
                Alcance del Proceso de Síntesis
              </span>
              <p className="text-secondary leading-relaxed">
                El sistema analizará los <strong>{totalTickets} casos registrados</strong> en esta mesa de ayuda, extrayendo patrones recurrentes, categorías frecuentes y diagnósticos de resolución para enriquecer la <strong>Memoria de Soporte</strong> del equipo.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Directrices o Políticas Adicionales (Opcional)
              </label>
              <textarea
                rows={3}
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                placeholder="ej. Políticas de atención, horarios de servicio, criterios de prioridad..."
                className="craft-input w-full text-xs"
              />
            </div>

            {running && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-secondary font-medium">
                  <span>Sintetizando conocimiento contextual...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-canvas border border-hairline overflow-hidden shadow-xs">
                  <div
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline">
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
                {running ? 'Sintetizando...' : 'Iniciar Síntesis'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-2.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-medium">{result.message}</span>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-hairline space-y-2 shadow-xs text-xs">
              <span className="text-secondary block">
                Versión de Memoria: <strong className="text-primary">{result.version}</strong>
              </span>
              <span className="text-secondary block">
                Casos Integrados: <strong className="text-primary">{result.processed_tickets}</strong>
              </span>
              <div className="pt-2 text-secondary whitespace-pre-wrap text-xs leading-relaxed border-t border-hairline">
                {result.context_preview}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-hairline">
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
