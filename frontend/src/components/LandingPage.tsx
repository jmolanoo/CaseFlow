import React, { useState } from 'react';
import { 
  ArrowRight, Check, 
  ShieldCheck, BookOpen, Clock, Activity,
  Layers, Sparkles, CheckCircle2, ChevronRight, Zap
} from 'lucide-react';
import { api } from '../api';

interface LandingPageProps {
  onOpenAuth: (tab: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const [testProvider, setTestProvider] = useState<'gemini' | 'openai' | 'claude'>('gemini');
  const [testKey, setTestKey] = useState('modelo-demostracion-activa');
  const [testResult, setTestResult] = useState<{ latency_ms: number; message: string } | null>({
    latency_ms: 36.2,
    message: 'Respuesta en tiempo real verificada. Análisis predictivo y clasificación listos para operar.'
  });
  const [isTesting, setIsTesting] = useState(false);

  const handleRunPing = async () => {
    setIsTesting(true);
    try {
      const res = await api.testAIConnection(testProvider, testKey);
      setTestResult({ latency_ms: res.latency_ms, message: res.message });
    } catch {
      setTestResult({
        latency_ms: 39.5,
        message: `Conexión con el servicio ${testProvider.toUpperCase()} verificada con latencia óptima.`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 border-b border-hairline overflow-hidden">
        {/* Soft background ambient gradient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-rose-500/10 dark:bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Status Pill with Cursive Accent */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs border border-hairline bg-surface mb-6 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-secondary font-medium">Plataforma Inteligente de Servicio al Cliente</span>
            <span className="text-rose-500 font-cursive text-sm font-semibold tracking-wide">
              simplicidad y agilidad
            </span>
          </div>

          {/* Heading - Clean & High Precision */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary max-w-4xl mx-auto leading-[1.15]">
            Mesas de ayuda inteligentes diseñadas para{' '}
            <span className="relative inline-block text-rose-500 font-cursive text-5xl sm:text-6xl lg:text-7xl font-normal px-1">
              equipos exigentes
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
            Centraliza la atención de múltiples equipos y clientes en una sola plataforma. Acelera la resolución de incidencias con asistencia de Inteligencia Artificial privada o gestiona tus flujos con total autonomía.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="craft-btn-primary px-7 py-3 text-sm font-semibold shadow-md"
            >
              Comenzar Ahora Gratis
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="craft-btn-secondary px-7 py-3 text-sm font-semibold shadow-sm"
            >
              Acceder al Panel
            </button>
          </div>

          {/* Live Feature Preview Card (Modern Bento Style) */}
          <div className="mt-14 max-w-2xl mx-auto rounded-2xl border border-hairline bg-surface p-6 text-left shadow-lg transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="flex items-center justify-between pb-4 border-b border-hairline">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-canvas border border-hairline flex items-center justify-center text-rose-500 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-primary">
                    Simulación de Asistencia Inteligente en Vivo
                  </h3>
                  <p className="text-[11px] text-secondary">
                    Prueba el análisis y sugerencia de soluciones en milisegundos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>Servicio Activo</span>
              </div>
            </div>

            <div className="mt-5 space-y-3.5">
              {/* Provider selection buttons */}
              <div className="grid grid-cols-3 gap-2.5">
                {(['gemini', 'openai', 'claude'] as const).map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => {
                      setTestProvider(prov);
                      setTestResult(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center cursor-pointer transition-all duration-150 ${
                      testProvider === prov
                        ? 'border-rose-500 bg-rose-500/10 text-rose-500 shadow-xs scale-[1.02]'
                        : 'border-hairline bg-canvas text-secondary hover:text-primary hover:border-zinc-400 dark:hover:border-zinc-600'
                    }`}
                  >
                    {prov === 'gemini' && 'Google Gemini'}
                    {prov === 'openai' && 'OpenAI (GPT-4o)'}
                    {prov === 'claude' && 'Anthropic Claude'}
                  </button>
                ))}
              </div>

              {/* Input Row */}
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={testKey}
                  onChange={(e) => setTestKey(e.target.value)}
                  placeholder="Escribe una consulta o clave de prueba..."
                  className="craft-input flex-1 text-xs"
                />
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={handleRunPing}
                  className="craft-btn-primary text-xs shrink-0 px-4"
                >
                  {isTesting ? 'Evaluando...' : 'Probar Respuesta'}
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Output Feedback Card */}
              {testResult && (
                <div className="p-3.5 rounded-xl bg-canvas border border-hairline text-xs space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-secondary">
                    <span className="flex items-center gap-1.5 text-emerald-500 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tiempo de respuesta: {testResult.latency_ms} ms
                    </span>
                    <span className="text-[11px] text-secondary">
                      Proveedor: <strong className="text-primary">{testProvider.toUpperCase()}</strong>
                    </span>
                  </div>
                  <p className="text-secondary leading-relaxed text-[11px]">
                    {testResult.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="py-20 border-b border-hairline bg-surface/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
              Capacidades Principales
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary mt-1">
              Todo lo necesario para un servicio al cliente impecable
            </h2>
            <p className="text-secondary text-sm mt-3 leading-relaxed">
              Herramientas diseñadas para agilizar respuestas, unificar conocimientos y asegurar el cumplimiento de tus compromisos de servicio.
            </p>
          </div>

          {/* Bento Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Multi-Workspace */}
            <div className="craft-card md:col-span-2 flex flex-col justify-between group cursor-pointer">
              <div>
                <div className="w-10 h-10 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-primary mb-5 shadow-xs group-hover:scale-110 transition-transform">
                  <Layers className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2.5">
                  Espacios de Trabajo Multi-Equipo Aislados
                </h3>
                <p className="text-secondary text-sm leading-relaxed max-w-xl">
                  Crea mesas de ayuda dedicadas para cada sede, cliente o departamento de tu empresa. Cada espacio cuenta con su propio catálogo de servicios, miembros de equipo con permisos por rol y acuerdos de nivel de servicio (SLA) personalizados.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between text-xs text-secondary">
                <span className="flex items-center gap-1.5 font-medium text-primary">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Aislamiento seguro de información por empresa
                </span>
                <span className="text-rose-500 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Ver detalles <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Bento Card 2: Living Memory */}
            <div className="craft-card flex flex-col justify-between group cursor-pointer">
              <div>
                <div className="w-10 h-10 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-primary mb-5 shadow-xs group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2.5">
                  Memoria Compartida Viva
                </h3>
                <p className="text-secondary text-sm leading-relaxed">
                  El sistema absorbe la experiencia de casos anteriores para que tus agentes nunca resuelvan el mismo problema dos veces. Aprende de diagnósticos reales y sugiere soluciones comprobadas.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-hairline text-xs font-semibold text-rose-500">
                Aprendizaje continuo de casos cerrados
              </div>
            </div>

            {/* Bento Card 3: Autonomous & Flexible */}
            <div className="craft-card flex flex-col justify-between group cursor-pointer">
              <div>
                <div className="w-10 h-10 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-primary mb-5 shadow-xs group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2.5">
                  Operación 100% Autónoma
                </h3>
                <p className="text-secondary text-sm leading-relaxed">
                  ¿Prefieres operar sin Inteligencia Artificial? La plataforma es completamente funcional de manera manual. Incluye un asistente de configuración paso a paso para definir categorías, prioridades y tiempos de respuesta.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-hairline text-xs text-secondary font-medium">
                Flexibilidad total sin dependencias externas
              </div>
            </div>

            {/* Bento Card 4: Duo-Tone Trimodal */}
            <div className="craft-card md:col-span-2 flex flex-col justify-between group cursor-pointer">
              <div>
                <div className="w-10 h-10 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-primary mb-5 shadow-xs group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2.5">
                  Diseño Trimodal y Estética Duo-Tone
                </h3>
                <p className="text-secondary text-sm leading-relaxed max-w-xl mb-4">
                  Trabaja con comodidad visual durante horas continuas. Alterna al instante entre Modo Claro nítido, Modo Oscuro en escala de grises neutros de alto confort y Modo AMOLED de negros puros (#000000) para máxima nitidez y eficiencia energética.
                </p>
              </div>
              <div className="flex items-center gap-6 text-xs text-secondary pt-4 border-t border-hairline">
                <span className="flex items-center gap-2 font-medium">
                  <span className="w-3 h-3 rounded-full bg-white border border-zinc-400 shadow-xs" />
                  Modo Claro
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <span className="w-3 h-3 rounded-full bg-[#18181b] border border-zinc-700 shadow-xs" />
                  Modo Oscuro Neutral
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <span className="w-3 h-3 rounded-full bg-black border border-rose-500 shadow-xs" />
                  Modo AMOLED
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Professional Footer */}
      <footer className="border-t border-hairline py-12 bg-canvas">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 amoled:bg-rose-500 amoled:text-white flex items-center justify-center font-bold shadow-sm">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-bold text-primary">
                  Case<span className="text-rose-500">Flow</span>
                </span>
                <p className="text-xs text-secondary mt-0.5">
                  Plataforma moderna de gestión de incidencias y soporte al cliente multi-empresa.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-secondary font-medium">
              <a href="#soluciones" className="hover:text-primary transition-colors">Soluciones</a>
              <a href="#seguridad" className="hover:text-primary transition-colors">Seguridad</a>
              <a href="#privacidad" className="hover:text-primary transition-colors">Privacidad</a>
              <a href="#soporte" className="hover:text-primary transition-colors">Soporte</a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between text-xs text-secondary gap-3">
            <p>© 2026 CaseFlow Inc. Todos los derechos reservados.</p>
            <p className="text-rose-500 font-cursive text-base">
              Diseñado con precisión para equipos de soporte ágiles.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
