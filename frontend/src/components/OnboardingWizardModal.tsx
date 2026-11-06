import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Check, ArrowRight, ArrowLeft, Plus, Trash2, Folder
} from 'lucide-react';
import { api, Category, Priority, HelpDeskDetails } from '../api';

interface OnboardingWizardModalProps {
  onClose: () => void;
  onSuccess: (newDesk: HelpDeskDetails) => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [enableAI, setEnableAI] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([
    { name: 'Hardware & Equipos', description: 'Fallas físicas y periféricos', color: '#f43f5e', icon: 'Cpu' },
    { name: 'Software & Licencias', description: 'Sistemas operativos y programas', color: '#f43f5e', icon: 'Layers' },
    { name: 'Redes & Conectividad', description: 'Acceso a internet y VPN', color: '#f43f5e', icon: 'Wifi' },
  ]);
  const [newCatName, setNewCatName] = useState('');

  // Priorities state
  const [priorities, setPriorities] = useState<Priority[]>([
    { name: 'Baja', level: 1, color: '#f43f5e', sla_response_hours: 24, sla_resolution_hours: 72 },
    { name: 'Media', level: 2, color: '#f43f5e', sla_response_hours: 8, sla_resolution_hours: 24 },
    { name: 'Alta', level: 3, color: '#f43f5e', sla_response_hours: 4, sla_resolution_hours: 12 },
    { name: 'Crítica', level: 4, color: '#f43f5e', sla_response_hours: 1, sla_resolution_hours: 4 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (step === 1) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-')
      );
    }
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    setCategories([...categories, { name: newCatName.trim(), color: '#f43f5e', icon: 'Folder' }]);
    setNewCatName('');
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updatePrioritySLA = (index: number, field: 'sla_response_hours' | 'sla_resolution_hours', val: number) => {
    const updated = [...priorities];
    updated[index][field] = val;
    setPriorities(updated);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.createHelpDeskWizard({
        name,
        slug,
        description,
        enable_ai: enableAI,
        categories,
        priorities,
      });
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear la mesa de ayuda');
    } finally {
      setLoading(false);
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
        className="relative w-full max-w-xl rounded-3xl border border-hairline bg-surface p-7 shadow-2xl transition-all"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface border border-hairline text-rose-500">
                Paso {step} de 4
              </span>
              <h3 className="text-sm font-bold text-primary">
                {step === 1 && 'Identidad de la Mesa de Ayuda'}
                {step === 2 && 'Catálogo de Categorías de Servicio'}
                {step === 3 && 'Tiempos de Respuesta y Acuerdos de Nivel (SLA)'}
                {step === 4 && 'Confirmación y Despliegue'}
              </h3>
            </div>
            <p className="text-xs text-secondary mt-1">
              Asistente de configuración guiado para poner en marcha tu mesa de soporte.
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 rounded-full text-secondary hover:text-primary hover:bg-canvas cursor-pointer transition-all hover:scale-110 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
            {error}
          </div>
        )}

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Nombre de la Mesa</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="ej. Soporte Técnico Corporativo"
                className="craft-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Identificador de Acceso (Slug URL)</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="ej. soporte-corporativo"
                className="craft-input w-full text-xs text-rose-500"
              />
              <span className="text-[11px] text-secondary mt-1 block">
                Dirección única para acceder y compartir invitaciones de esta mesa.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Descripción o Propósito (Opcional)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente la función de este espacio de atención..."
                className="craft-input w-full text-xs"
              />
            </div>

            <div className="p-4 rounded-2xl bg-canvas border border-hairline flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-primary block">Habilitar Asistencia con Inteligencia Artificial</span>
                <span className="text-[11px] text-secondary">
                  Permite conectar modelos BYOK (Gemini, Claude o GPT) para sugerencias y triaje.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEnableAI(!enableAI)}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  enableAI ? 'bg-rose-500' : 'bg-surface border border-hairline'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    enableAI ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Categories */}
        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                placeholder="Nueva categoría (ej. Facturación & Cobros)..."
                className="craft-input flex-1 text-xs"
              />
              <button
                type="button"
                onClick={addCategory}
                className="craft-btn-primary text-xs shrink-0 rounded-full"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {categories.map((cat, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-2xl bg-canvas border border-hairline shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-surface border border-hairline flex items-center justify-center text-rose-500">
                      <Folder className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-primary">{cat.name}</span>
                      {cat.description && (
                        <p className="text-[10px] text-secondary">{cat.description}</p>
                      )}
                    </div>
                  </div>
                  {categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCategory(i)}
                      className="p-1.5 rounded-full text-secondary hover:text-rose-500 hover:bg-surface cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: SLAs */}
        {step === 3 && (
          <div className="space-y-3.5 py-4 max-h-80 overflow-y-auto pr-1">
            {priorities.map((p, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-canvas border border-hairline shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-primary">{p.name} (Nivel {p.level})</span>
                  <span className="text-[11px] text-secondary font-medium">
                    Respuesta: {p.sla_response_hours}h • Resolución: {p.sla_resolution_hours}h
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-secondary font-medium block mb-1">Respuesta Inicial (Horas)</label>
                    <input
                      type="number"
                      min={1}
                      max={168}
                      value={p.sla_response_hours}
                      onChange={(e) => updatePrioritySLA(i, 'sla_response_hours', parseInt(e.target.value) || 1)}
                      className="craft-input w-full text-xs py-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-secondary font-medium block mb-1">Resolución Final (Horas)</label>
                    <input
                      type="number"
                      min={1}
                      max={720}
                      value={p.sla_resolution_hours}
                      onChange={(e) => updatePrioritySLA(i, 'sla_resolution_hours', parseInt(e.target.value) || 1)}
                      className="craft-input w-full text-xs py-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <div className="space-y-3.5 py-4 text-xs">
            <div className="p-4 rounded-2xl bg-canvas border border-hairline shadow-xs">
              <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block">Mesa de Ayuda</span>
              <span className="text-base font-bold text-primary block mt-1">{name}</span>
              <span className="text-xs text-rose-500 font-semibold">/{slug}</span>
              <p className="text-secondary mt-1.5 text-xs">{description || 'Mesa de soporte y atención.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-canvas border border-hairline shadow-xs">
                <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block">Categorías</span>
                <span className="text-sm font-bold text-primary mt-0.5 block">{categories.length} configuradas</span>
              </div>
              <div className="p-3 rounded-2xl bg-canvas border border-hairline shadow-xs">
                <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block">Políticas de SLA</span>
                <span className="text-sm font-bold text-primary mt-0.5 block">{priorities.length} niveles activos</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2.5">
              <Check className="w-4 h-4 shrink-0" />
              <span>
                Todo listo para poner en marcha. Se inicializará la memoria del Help Desk y los controles de acceso.
              </span>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-hairline mt-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="craft-btn-secondary text-xs rounded-full"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Atrás
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={step === 1 && (!name || !slug)}
              onClick={() => setStep((s) => (s + 1) as any)}
              className="craft-btn-primary text-xs disabled:opacity-50 rounded-full"
            >
              Siguiente
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleFinish}
              className="craft-btn-primary text-xs font-semibold disabled:opacity-50 rounded-full"
            >
              {loading ? 'Creando Mesa...' : 'Poner en Marcha'}
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
