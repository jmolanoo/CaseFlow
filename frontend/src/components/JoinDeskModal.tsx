import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Link2, ArrowRight, CheckCircle2, AlertTriangle, User, Loader2 } from 'lucide-react';
import { api, InvitationPreview, HelpDeskDetails } from '../api';

interface JoinDeskModalProps {
  initialCode?: string;
  onClose: () => void;
  onSuccess: (desk: HelpDeskDetails) => void;
}

export const JoinDeskModal: React.FC<JoinDeskModalProps> = ({
  initialCode = '',
  onClose,
  onSuccess,
}) => {
  const [code, setCode] = useState(initialCode);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [joining, setJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      handlePreview(initialCode);
    }
  }, [initialCode]);

  const cleanCode = (raw: string) => {
    let cleaned = raw.trim();
    if (cleaned.includes('/')) {
      cleaned = cleaned.split('/').pop() || cleaned;
    }
    if (cleaned.includes('?join=')) {
      cleaned = cleaned.split('?join=').pop() || cleaned;
    }
    if (cleaned.includes('&')) {
      cleaned = cleaned.split('&')[0];
    }
    return cleaned.trim();
  };

  const handlePreview = async (inputCode: string) => {
    const cleaned = cleanCode(inputCode);
    if (!cleaned || cleaned.length < 4) {
      setPreview(null);
      return;
    }

    setLoadingPreview(true);
    setErrorMsg(null);
    try {
      const data = await api.previewInvitation(cleaned);
      setPreview(data);
    } catch (err: any) {
      setPreview(null);
      setErrorMsg(err.message || 'El código o enlace ingresado no es válido');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanCode(code);
    if (!cleaned) return;

    setJoining(true);
    setErrorMsg(null);
    try {
      const res = await api.joinDesk(cleaned);
      onSuccess(res.desk);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'No fue posible unirse a la mesa de ayuda');
    } finally {
      setJoining(false);
    }
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
        className="relative w-full max-w-lg rounded-3xl border border-hairline bg-surface p-6 sm:p-8 shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-hairline">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-canvas border border-hairline text-rose-500 flex items-center justify-center shadow-xs">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-primary">
                Unirme a una Mesa de Ayuda
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                Ingresa el código o enlace de invitación compartido por tu equipo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-secondary hover:text-primary hover:bg-canvas transition-all hover:scale-110 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
              Enlace o Código de Invitación
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (e.target.value.length > 5) {
                    handlePreview(e.target.value);
                  } else {
                    setPreview(null);
                    setErrorMsg(null);
                  }
                }}
                onBlur={() => handlePreview(code)}
                placeholder="Pega aquí el link (ej. inv_a8c2f1...)"
                className="w-full pl-4 pr-10 py-3 rounded-full bg-canvas border border-hairline text-primary placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-sm font-medium transition-all"
                required
              />
              {loadingPreview && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary">
                  <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-secondary mt-1.5">
              Puedes pegar la URL completa o solo el identificador de la invitación.
            </p>
          </div>

          {/* Invitation Preview Feedback */}
          {preview && preview.valid && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                Invitación Válida Confirmada
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                <div>
                  <span className="text-secondary block">Mesa de destino:</span>
                  <strong className="text-primary font-bold text-sm">{preview.help_desk_name}</strong>
                  <span className="text-secondary text-[11px] block">/{preview.help_desk_slug}</span>
                </div>
                <div className="sm:text-right">
                  <span className="text-secondary block">Rol asignado:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-rose-500 uppercase tracking-wider text-[11px] px-3 py-1 rounded-full bg-canvas border border-hairline">
                    <User className="w-3 h-3" />
                    {preview.role === 'agent' ? 'Soporte / Agente' : (preview.role === 'admin' ? 'Administrador' : 'Usuario / Empleado')}
                  </span>
                </div>
              </div>
              {preview.label && (
                <div className="text-[11px] text-secondary pt-1 border-t border-hairline">
                  Nota: <em>{preview.label}</em>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-500 font-medium">
                {errorMsg}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="craft-btn-secondary text-xs rounded-full"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={joining || !code.trim() || (preview !== null && !preview.valid)}
              className="craft-btn-primary text-xs shadow-sm rounded-full"
            >
              {joining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uniéndome...
                </>
              ) : (
                <>
                  Unirme a la Mesa
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
