import React from 'react';
import { 
  ArrowRight, ShieldCheck, Clock,
  Layers, Sparkles, ChevronRight,
  Key, Lock, Sliders, Check, Sun, Moon, CircleDot
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (tab: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen selection:bg-rose-500/20 selection:text-rose-600">
      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION
          ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-28 border-b border-hairline overflow-hidden">
        {/* Soft background ambient gradient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-rose-500/10 dark:bg-rose-500/5 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Status Pill with Cursive Accent */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs border border-hairline bg-surface mb-8 shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-secondary font-medium">Plataforma Inteligente de Servicio al Cliente</span>
            <span className="text-rose-500 font-cursive text-lg font-normal tracking-wide pl-1">
              simplicidad y agilidad
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-primary max-w-5xl mx-auto leading-[1.12]">
            Mesas de ayuda inteligentes diseñadas para{' '}
            <span className="relative inline-block text-rose-500 font-cursive text-5xl sm:text-7xl lg:text-8xl font-normal px-2">
              equipos exigentes
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
            Centraliza la atención de múltiples equipos y clientes en una sola plataforma de alto rendimiento. Acelera la resolución de incidencias con asistencia de Inteligencia Artificial privada o gestiona flujos manuales con total autonomía.
          </p>

          {/* CTAs - Strict Pills */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="craft-btn-primary px-8 py-3.5 text-sm font-semibold shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 group"
            >
              Comenzar Ahora Gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="craft-btn-secondary px-8 py-3.5 text-sm font-semibold shadow-sm flex items-center justify-center gap-2"
            >
              Acceder al Panel
            </button>
          </div>

          {/* Key Metric Highlights Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-hairline text-left">
            <div className="p-4 rounded-2xl bg-surface/60 border border-hairline">
              <span className="text-2xl font-black text-primary block">100%</span>
              <span className="text-xs text-secondary mt-0.5 block">Privacidad BYOK Cifrada</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface/60 border border-hairline">
              <span className="text-2xl font-black text-rose-500 block">&lt; 40ms</span>
              <span className="text-xs text-secondary mt-0.5 block">Latencia de Respuesta</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface/60 border border-hairline">
              <span className="text-2xl font-black text-primary block">Trimodal</span>
              <span className="text-xs text-secondary mt-0.5 block">Claro, Oscuro y AMOLED</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface/60 border border-hairline">
              <span className="text-2xl font-black text-rose-500 block">SLA 99.8%</span>
              <span className="text-xs text-secondary mt-0.5 block">Cumplimiento en Tiempo Real</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: MULTI-MESA Y AISLAMIENTO SEGURO
          ───────────────────────────────────────────────────────────── */}
      <section className="py-24 border-b border-hairline bg-surface/40 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs border border-hairline bg-canvas">
                <Layers className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-secondary font-medium">Arquitectura Multi-Tenant</span>
                <span className="text-rose-500 font-cursive text-base">aislamiento absoluto</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary leading-tight">
                Múltiples mesas de ayuda,{' '}
                <span className="text-rose-500 font-cursive text-4xl sm:text-5xl lg:text-6xl font-normal block mt-1">
                  un solo centro de control
                </span>
              </h2>

              <p className="text-base sm:text-lg text-secondary leading-relaxed">
                Crea espacios de soporte independientes para cada empresa, departamento o línea de negocio. Cada mesa opera con su propio identificador único, base de conocimiento aislada, políticas SLA personalizadas y miembros con roles estrictamente delimitados.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-primary block">Separación Estricta de Datos</strong>
                    <span className="text-xs text-secondary">Los solicitantes y agentes solo acceden a las incidencias de sus mesas autorizadas.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-primary block">Enlaces de Invitación con Rol Prefijado</strong>
                    <span className="text-xs text-secondary">Genera accesos seguros con cupos o caducidad para incorporar clientes o especialistas al instante.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-primary block">Control de Acceso Basado en Roles (RBAC)</strong>
                    <span className="text-xs text-secondary">Permisos granulares para Administradores, Agentes de soporte y Usuarios finales.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="craft-btn-primary"
                >
                  Crear Mi Primera Mesa de Ayuda
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Visual Element: Workspace Multi-Desk Mockup */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl border border-hairline bg-surface p-6 shadow-2xl transition-all hover:scale-[1.01]">
                <div className="flex items-center justify-between pb-4 border-b border-hairline">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-zinc-400/40" />
                    <div className="w-3 h-3 rounded-full bg-zinc-400/40" />
                    <span className="text-xs font-semibold text-secondary ml-2">Panel Multi-Mesa • CaseFlow</span>
                  </div>
                  <span className="text-xs font-cursive text-rose-500 text-base">seguridad garantizada</span>
                </div>

                {/* Simulated Desks Cards */}
                <div className="space-y-3.5 mt-5">
                  <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          TI
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-primary">Infraestructura & Cloud TI</h4>
                          <span className="text-[11px] text-secondary">slug: /desks/infra-cloud</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        IA Activa
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-rose-500/15 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-secondary block">Casos</span>
                        <strong className="text-primary font-bold">148</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-secondary block">Agentes</span>
                        <strong className="text-primary font-bold">12</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-secondary block">SLA</span>
                        <strong className="text-rose-500 font-bold">99.4%</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-hairline bg-canvas transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface border border-hairline text-primary flex items-center justify-center font-bold text-xs shadow-xs">
                          CX
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-primary">Atención a Clientes VIP</h4>
                          <span className="text-[11px] text-secondary">slug: /desks/clientes-vip</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface border border-hairline text-secondary">
                        Operación Manual
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-hairline text-center text-xs">
                      <div>
                        <span className="text-[10px] text-secondary block">Casos</span>
                        <strong className="text-primary font-bold">89</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-secondary block">Agentes</span>
                        <strong className="text-primary font-bold">6</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-secondary block">SLA</span>
                        <strong className="text-primary font-bold">98.1%</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-surface border border-hairline flex items-center justify-between text-xs text-secondary">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-500" />
                    Aislamiento verificado por políticas de Base de Datos
                  </span>
                  <span className="text-rose-500 font-semibold">100% Blindado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: BÓVEDA PRIVADA DE IA (BYOK)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-24 border-b border-hairline bg-canvas relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Visual Element: AI Vault Interactive Diagram */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-3xl border border-hairline bg-surface p-7 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-hairline">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-primary">Bóveda Criptográfica BYOK</h4>
                      <p className="text-[10px] text-secondary">Cifrado Fernet AES-256 en Reposo</p>
                    </div>
                  </div>
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    Bóveda Activa
                  </span>
                </div>

                {/* Model Selector Mockup */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider block">
                    Proveedor Conectado
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-2xl border-2 border-rose-500 bg-rose-500/10 text-center">
                      <span className="text-xs font-bold text-primary block">Google Gemini</span>
                      <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">gemini-1.5-pro</span>
                    </div>
                    <div className="p-3 rounded-2xl border border-hairline bg-canvas text-center opacity-70">
                      <span className="text-xs font-bold text-primary block">Claude 3.5</span>
                      <span className="text-[10px] text-secondary block mt-0.5">Anthropic</span>
                    </div>
                    <div className="p-3 rounded-2xl border border-hairline bg-canvas text-center opacity-70">
                      <span className="text-xs font-bold text-primary block">GPT-4o</span>
                      <span className="text-[10px] text-secondary block mt-0.5">OpenAI</span>
                    </div>
                  </div>
                </div>

                {/* Encryption Security Badge */}
                <div className="p-4 rounded-2xl bg-canvas border border-hairline space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary font-medium">Clave Cifrada:</span>
                    <span className="text-rose-500 font-bold">•••••••••••••••••••••••••7f8a</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary font-medium">Memoria de Mesa:</span>
                    <span className="text-primary font-semibold">Contexto Dinámico v14</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary font-medium">Latencia Promedio:</span>
                    <span className="text-rose-500 font-bold">34.2 ms</span>
                  </div>
                </div>

                {/* Privacy Guarantee Note */}
                <div className="p-3 rounded-xl bg-surface border border-hairline flex items-center gap-2.5 text-xs text-secondary">
                  <Lock className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Ninguna clave se almacena en texto plano ni se comparte entre mesas.</span>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs border border-hairline bg-surface">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-secondary font-medium">Soberanía Criptográfica</span>
                <span className="text-rose-500 font-cursive text-base">cero retención</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary leading-tight">
                Tu propia Inteligencia Artificial,{' '}
                <span className="text-rose-500 font-cursive text-4xl sm:text-5xl lg:text-6xl font-normal block mt-1">
                  bajo tus propias reglas
                </span>
              </h2>

              <p className="text-base sm:text-lg text-secondary leading-relaxed">
                Olvídate de suscripciones cautivas o filtraciones de información sensible. CaseFlow opera bajo la filosofía Bring Your Own Key (BYOK): conecta tu propia cuenta de Gemini, Claude o ChatGPT directamente a cada mesa de ayuda.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-primary block">Cifrado Militar AES-256</strong>
                    <span className="text-xs text-secondary">Las credenciales se cifran en el servidor con llaves rotadas y nunca viajan en claro.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-primary block">Memoria Colectiva Auto-Evolutiva</strong>
                    <span className="text-xs text-secondary">Cada caso resuelto alimenta automáticamente la memoria técnica de la mesa para sugerir respuestas certeras a futuro.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-primary block">Gobernanza y Activación Granular</strong>
                    <span className="text-xs text-secondary">El administrador decide qué roles pueden consultar sugerencias o diagnósticos con un solo interruptor.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="craft-btn-primary"
                >
                  Configurar Mi Bóveda Segura
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: OPERACIÓN 100% AUTÓNOMA Y TRIAJE ÁGIL
          ───────────────────────────────────────────────────────────── */}
      <section className="py-24 border-b border-hairline bg-surface/40 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs border border-hairline bg-canvas">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-secondary font-medium">Operación Flexible</span>
                <span className="text-rose-500 font-cursive text-base">autonomía absoluta</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary leading-tight">
                ¿Prefieres operar sin IA?{' '}
                <span className="text-rose-500 font-cursive text-4xl sm:text-5xl lg:text-6xl font-normal block mt-1">
                  control manual total
                </span>
              </h2>

              <p className="text-base sm:text-lg text-secondary leading-relaxed">
                CaseFlow no te ata a la Inteligencia Artificial. La plataforma está concebida para funcionar de manera completamente autónoma y eficiente en modo manual. Tus equipos tienen herramientas de triaje rápido, clasificación en 1 clic y seguimiento de SLAs sin dependencias de servicios externos.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-primary block">Triaje Directo desde el Tablero</strong>
                    <span className="text-xs text-secondary">Los casos nuevos llegan sin prioridad obligada para el usuario; el equipo de soporte asigna el nivel directamente con un solo clic.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-primary block">Temporizadores y Alertas de SLA</strong>
                    <span className="text-xs text-secondary">Cálculo dinámico de horas límite de primera respuesta y resolución definitiva con cuenta regresiva.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-primary block">Separación Clara de Vista y Atención</strong>
                    <span className="text-xs text-secondary">Consulta el historial completo de un caso sin distracciones y abre la consola de atención solo cuando vayas a intervenir.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="craft-btn-secondary"
                >
                  Conocer el Flujo de Triaje
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Visual Element: Triage Pipeline Mockup */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-hairline bg-surface p-7 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-hairline">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-primary">Flujo de Triaje de Casos</span>
                  </div>
                  <span className="text-[11px] text-secondary font-medium">Modo Autónomo</span>
                </div>

                {/* Case 1: Unassigned Priority Triage */}
                <div className="p-4 rounded-2xl bg-canvas border border-hairline space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-500">CASE-031</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-surface border border-hairline text-secondary">
                      Sin prioridad asignada
                    </span>
                  </div>
                  <p className="text-xs font-bold text-primary">Error de conexión con pasarela de pagos</p>
                  <div className="flex items-center justify-between pt-2 border-t border-hairline">
                    <span className="text-[11px] text-secondary">Asignar prioridad inmediata:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500 text-white cursor-pointer hover:scale-105 transition-transform">
                        Alta (4h)
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-surface border border-hairline text-secondary cursor-pointer hover:text-primary">
                        Media (12h)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Case 2: In Attendance Case */}
                <div className="p-4 rounded-2xl bg-canvas border border-hairline space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-500">CASE-030</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      En Atención
                    </span>
                  </div>
                  <p className="text-xs font-bold text-primary">Actualización de credenciales de acceso</p>
                  <div className="flex items-center justify-between text-[11px] text-secondary pt-1">
                    <span>Responsable: Carlos Méndez</span>
                    <span className="text-rose-500 font-bold">Límite: 2h restantes</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-hairline text-center text-xs text-secondary">
                  Respuesta manual amplia con soporte para notas internas confidenciales.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: DISEÑO TRIMODAL Y ESTÉTICA DUO-TONE
          ───────────────────────────────────────────────────────────── */}
      <section className="py-24 border-b border-hairline bg-canvas relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs border border-hairline bg-surface shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-secondary font-medium">Ergonomía y Confort Visual</span>
            <span className="text-rose-500 font-cursive text-lg pl-1">alta gama sin fatiga</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-primary max-w-3xl mx-auto leading-tight">
            Diseño trimodal de alta precisión,{' '}
            <span className="text-rose-500 font-cursive text-4xl sm:text-6xl font-normal block mt-1">
              adaptado a cada entorno
            </span>
          </h2>

          <p className="text-base sm:text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
            Las jornadas de soporte son exigentes. Disfruta de una interfaz limpia con tipografía Google Sans, toques cursivos artesanales, botones en píldora y tres modos cromáticos finamente calibrados.
          </p>

          {/* 3 Theme Demonstration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
            {/* Light Mode */}
            <div className="p-6 rounded-3xl border border-zinc-200 bg-white text-zinc-900 shadow-xl space-y-4 hover:scale-[1.03] transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
                  <Sun className="w-5 h-5 text-rose-500" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700">
                  Luminoso
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-950">Modo Claro</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Superficies níveas (#ffffff) con bordes de precisión milimétrica. Contraste óptimo para oficinas iluminadas y entornos diurnos.
              </p>
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-800">Dúo-tono: Botón Negro</span>
                <span className="w-4 h-4 rounded-full bg-black shadow-xs" />
              </div>
            </div>

            {/* Dark Neutral Mode */}
            <div className="p-6 rounded-3xl border border-zinc-800 bg-[#18181b] text-white shadow-xl space-y-4 hover:scale-[1.03] transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-[#232328] border border-zinc-700 flex items-center justify-center text-white">
                  <Moon className="w-5 h-5 text-rose-400" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300">
                  Neutro
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Modo Oscuro Neutral</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Escala de grises balanceada (#121214) libre de tinte azulado molesto. Máximo confort visual para trabajar durante horas continuas.
              </p>
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200">Dúo-tono: Botón Blanco</span>
                <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
            </div>

            {/* AMOLED Mode */}
            <div className="p-6 rounded-3xl border border-rose-500/40 bg-black text-white shadow-xl space-y-4 hover:scale-[1.03] transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500">
                  <CircleDot className="w-5 h-5 text-rose-500" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  #000000 Puro
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Modo AMOLED</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Negros absolutos con píxeles completamente apagados en paneles OLED. Cero consumo innecesario de energía y resalte fucsia neón.
              </p>
              <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-400">Acentos Salmón Neón</span>
                <span className="w-4 h-4 rounded-full bg-rose-500 shadow-xs" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FOOTER SECTION
          ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-hairline py-16 bg-canvas">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 amoled:bg-rose-500 amoled:text-white flex items-center justify-center font-bold shadow-md">
                <Layers className="w-5 h-5 text-rose-500 dark:text-rose-500 amoled:text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-primary">
                  Case<span className="text-rose-500">Flow</span>
                </span>
                <p className="text-xs text-secondary mt-0.5">
                  Plataforma moderna de gestión de incidencias y mesas de ayuda inteligentes.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-secondary font-medium">
              <button onClick={() => onOpenAuth('login')} className="hover:text-primary transition-colors cursor-pointer">
                Iniciar Sesión
              </button>
              <button onClick={() => onOpenAuth('register')} className="hover:text-primary transition-colors cursor-pointer">
                Crear Cuenta
              </button>
              <span className="text-hairline">•</span>
              <span className="text-secondary">Spec-Driven Development</span>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-hairline flex flex-col sm:flex-row items-center justify-between text-xs text-secondary gap-4">
            <p>© 2026 CaseFlow Inc. Todos los derechos reservados.</p>
            <p className="text-rose-500 font-cursive text-xl font-normal">
              Diseñado con rigor y estética para equipos exigentes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
