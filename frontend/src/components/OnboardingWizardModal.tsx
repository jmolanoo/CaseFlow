import React, { useState } from 'react';
import { 
  X, Check, ArrowRight, ArrowLeft, Plus, Trash2
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
    { name: 'Software & Licencias', description: 'Sistemas operativos y programas', color: '#3b82f6', icon: 'Layers' },
    { name: 'Redes & Conectividad', description: 'Acceso a internet y VPN', color: '#10b981', icon: 'Wifi' },
  ]);
  const [newCatName, setNewCatName] = useState('');

  // Priorities state
  const [priorities, setPriorities] = useState<Priority[]>([
    { name: 'Baja', level: 1, color: '#10b981', sla_response_hours: 24, sla_resolution_hours: 72 },
    { name: 'Media', level: 2, color: '#3b82f6', sla_response_hours: 8, sla_resolution_hours: 24 },
    { name: 'Alta', level: 3, color: '#f59e0b', sla_response_hours: 4, sla_resolution_hours: 12 },
    { name: 'Crítica', level: 4, color: '#f43f5e', sla_response_hours: 1, sla_resolution_hours: 4 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug when typing name
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
      setError(err.message || 'Error al crear Help Desk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-hairline bg-surface p-6 shadow-2xl transition-all">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-500">
                Paso {step} de 4
              </span>
              <h3 className="text-base font-bold text-primary">
                {step === 1 && 'Identidad de la Mesa de Ayuda'}
                {step === 2 && 'Catálogo de Categorías y Servicios'}
                {step === 3 && 'Matriz de Prioridades y Políticas de SLA'}
                {step === 4 && 'Confirmación y Puesta en Marcha'}
              </h3>
            </div>
            <p className="text-xs text-secondary mt-1">
              Onboarding Wizard guiado para configuración autónoma sin dependencias externas.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-secondary hover:text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-canvas h-1.5 rounded-full my-4 overflow-hidden border border-hairline">
          <div
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
            {error}
          </div>
        )}

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Nombre del Help Desk</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej. Centro de Servicios de TI USCO"
                className="w-full px-3.5 py-2 text-xs rounded-lg bg-canvas border border-hairline text-primary focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Identificador URL (Slug)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="ti-usco"
                className="w-full px-3.5 py-2 text-xs font-mono rounded-lg bg-canvas border border-hairline text-primary focus:outline-none focus:border-rose-500"
              />
              <span className="text-[10px] text-secondary">
                Ruta única del espacio: /desk/<strong>{slug || 'mi-mesa'}</strong>
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Descripción del Alcance</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Mesa de soporte para incidencias técnicas, software, cuentas y conectividad institucional."
                className="w-full px-3.5 py-2 text-xs rounded-lg bg-canvas border border-hairline text-primary focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="p-3 rounded-lg bg-canvas border border-hairline flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-primary block">Habilitar Asistencia con IA</span>
                <span className="text-[10px] text-secondary">
                  Activa el copiloto y categorización automática si tienes una clave BYOK configurada.
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableAI}
                onChange={(e) => setEnableAI(e.target.checked)}
                className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Categories */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Añadir nueva categoría..."
                className="flex-1 px-3.5 py-2 text-xs rounded-lg bg-canvas border border-hairline text-primary focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={addCategory}
                className="px-3.5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {categories.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-canvas border border-hairline text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-medium text-primary">{c.name}</span>
                    {c.description && <span className="text-secondary text-[11px]">— {c.description}</span>}
                  </div>
                  <button
                    onClick={() => removeCategory(i)}
                    className="text-secondary hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Priorities & SLAs */}
        {step === 3 && (
          <div className="space-y-3 py-2 max-h-64 overflow-y-auto pr-1">
            {priorities.map((p, i) => (
              <div key={i} className="p-3 rounded-lg bg-canvas border border-hairline text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-semibold text-primary">{p.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-secondary">
                    Nivel {p.level} • SLA: {p.sla_response_hours}h resp / {p.sla_resolution_hours}h resol
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-[10px] text-secondary block">Horas Respuesta Límite</label>
                    <input
                      type="number"
                      min={1}
                      max={168}
                      value={p.sla_response_hours}
                      onChange={(e) => updatePrioritySLA(i, 'sla_response_hours', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 text-xs font-mono rounded bg-surface border border-hairline text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-secondary block">Horas Resolución Límite</label>
                    <input
                      type="number"
                      min={1}
                      max={720}
                      value={p.sla_resolution_hours}
                      onChange={(e) => updatePrioritySLA(i, 'sla_resolution_hours', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 text-xs font-mono rounded bg-surface border border-hairline text-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-canvas border border-hairline">
              <span className="text-[10px] font-mono text-secondary uppercase block">Mesa de Ayuda</span>
              <span className="text-sm font-bold text-primary block mt-0.5">{name}</span>
              <span className="text-[11px] font-mono text-rose-500">slug: /{slug}</span>
              <p className="text-secondary mt-1 text-[11px]">{description || 'Sin descripción adicional.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-canvas border border-hairline">
                <span className="text-[10px] font-mono text-secondary uppercase block">Categorías</span>
                <span className="text-sm font-bold text-primary mt-0.5 block">{categories.length} configuradas</span>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-hairline">
                <span className="text-[10px] font-mono text-secondary uppercase block">Políticas SLA</span>
                <span className="text-sm font-bold text-primary mt-0.5 block">{priorities.length} niveles activos</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>
                Listo para desplegar. Se inicializará la memoria organizacional y los toggles granulares RBAC.
              </span>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-hairline mt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-3.5 py-1.5 text-xs font-medium text-secondary hover:text-primary flex items-center gap-1.5"
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
              className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm shadow-rose-500/20"
            >
              Siguiente
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleFinish}
              className="px-5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-rose-500/20"
            >
              {loading ? 'Creando Mesa...' : 'Poner en Marcha'}
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
