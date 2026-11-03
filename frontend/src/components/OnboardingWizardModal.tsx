import React, { useState } from 'react';
import { 
  X, Check, ArrowRight, ArrowLeft, Plus, Trash2, Layers
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
      setError(err.message || 'Error al crear Help Desk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-xl border border-hairline bg-surface p-6 transition-all">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-surface border border-hairline text-rose-500">
                Paso {step} de 4
              </span>
              <h3 className="text-sm font-bold text-primary">
                {step === 1 && 'Identidad de la Mesa de Ayuda'}
                {step === 2 && 'Catálogo de Categorías y Servicios'}
                {step === 3 && 'Matriz de Prioridades y Políticas de SLA'}
                {step === 4 && 'Confirmación y Despliegue'}
              </h3>
            </div>
            <p className="text-xs text-secondary mt-0.5">
              Configuración modular guiada (Onboarding Wizard autónomo).
            </p>
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
          <div className="mt-3 p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
            {error}
          </div>
        )}

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-3.5 py-4">
            <div>
              <label className="block text-[11px] font-medium text-secondary mb-1">
                Nombre de la Mesa de Ayuda / Departamento
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej. Centro de Soporte TI"
                className="craft-input w-full"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-secondary mb-1">
                Slug Identificador Único (URL amigable)
              </label>
              <div className="flex items-center">
                <span className="px-2.5 py-2 bg-canvas border border-r-0 border-hairline text-secondary text-xs font-mono rounded-l-md">
                  caseflow.app/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="soporte-ti"
                  className="craft-input flex-1 rounded-l-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-secondary mb-1">
                Descripción de Alcance
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Canal oficial para atención de incidencias técnicas de la organización..."
                className="craft-input w-full"
              />
            </div>

            <div className="pt-2 flex items-center justify-between p-3 rounded-lg bg-canvas border border-hairline">
              <div>
                <span className="text-xs font-semibold text-primary block">Habilitar IA en esta mesa</span>
                <span className="text-[11px] text-secondary">
                  Si activas esta opción, podrás usar el Copiloto BYOK cuando vincules tu API Key.
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableAI}
                onChange={(e) => setEnableAI(e.target.checked)}
                className="w-4 h-4 accent-rose-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Step 2: Categories */}
        {step === 2 && (
          <div className="space-y-3 py-4">
            <p className="text-xs text-secondary">
              Estructura las categorías para tipificar los casos que ingresen a esta mesa.
            </p>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-canvas border border-hairline text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-surface border border-hairline flex items-center justify-center text-primary">
                      <Layers className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <div>
                      <span className="font-semibold text-primary block">{cat.name}</span>
                      <span className="text-[11px] text-secondary">{cat.description}</span>
                    </div>
                  </div>
                  {categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCategory(idx)}
                      className="p-1 text-secondary hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nombre de nueva categoría..."
                className="craft-input flex-1 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              />
              <button
                type="button"
                onClick={addCategory}
                className="craft-btn-secondary text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: SLA Matrix */}
        {step === 3 && (
          <div className="space-y-2.5 py-4 max-h-64 overflow-y-auto pr-1">
            <p className="text-xs text-secondary mb-2">
              Define los límites de tiempo (SLA) para primera respuesta y resolución definitiva.
            </p>

            {priorities.map((p, i) => (
              <div key={i} className="p-3 rounded-lg bg-canvas border border-hairline">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-primary">{p.name}</span>
                  <span className="font-mono text-[11px] text-secondary">
                    Nivel {p.level} • SLA: {p.sla_response_hours}h resp / {p.sla_resolution_hours}h resol
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mt-2">
                  <div>
                    <label className="text-[10px] text-secondary block mb-0.5">Límite Respuesta (Horas)</label>
                    <input
                      type="number"
                      min={1}
                      max={168}
                      value={p.sla_response_hours}
                      onChange={(e) => updatePrioritySLA(i, 'sla_response_hours', parseInt(e.target.value) || 1)}
                      className="craft-input w-full text-xs font-mono py-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-secondary block mb-0.5">Límite Resolución (Horas)</label>
                    <input
                      type="number"
                      min={1}
                      max={720}
                      value={p.sla_resolution_hours}
                      onChange={(e) => updatePrioritySLA(i, 'sla_resolution_hours', parseInt(e.target.value) || 1)}
                      className="craft-input w-full text-xs font-mono py-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <div className="space-y-3 py-4 text-xs">
            <div className="p-3 rounded-lg bg-canvas border border-hairline">
              <span className="text-[10px] font-mono text-secondary uppercase block">Mesa de Ayuda</span>
              <span className="text-sm font-bold text-primary block mt-0.5">{name}</span>
              <span className="text-[11px] font-mono text-rose-500">/{slug}</span>
              <p className="text-secondary mt-1 text-[11px]">{description || 'Sin descripción adicional.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-lg bg-canvas border border-hairline">
                <span className="text-[10px] font-mono text-secondary uppercase block">Categorías</span>
                <span className="text-xs font-bold text-primary mt-0.5 block">{categories.length} configuradas</span>
              </div>
              <div className="p-2.5 rounded-lg bg-canvas border border-hairline">
                <span className="text-[10px] font-mono text-secondary uppercase block">Políticas SLA</span>
                <span className="text-xs font-bold text-primary mt-0.5 block">{priorities.length} niveles activos</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>
                Listo para desplegar. Se inicializará la memoria del Help Desk y los controles RBAC.
              </span>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-hairline mt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="craft-btn-secondary text-xs"
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
              className="craft-btn-primary text-xs disabled:opacity-50"
            >
              Siguiente
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleFinish}
              className="craft-btn-primary text-xs font-semibold disabled:opacity-50"
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
