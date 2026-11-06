import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  Plus, Layers, ArrowUpRight, 
  Link2, Users, Ticket, CheckCircle2, TrendingUp,
  ShieldCheck, Clock, BarChart3
} from 'lucide-react';
import { api, User, HelpDeskListItem } from '../api';
import { OnboardingWizardModal } from './OnboardingWizardModal';
import { JoinDeskModal } from './JoinDeskModal';

interface DashboardProps {
  user: User;
  onSelectDesk: (desk: HelpDeskListItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onSelectDesk,
}) => {
  const [helpDesks, setHelpDesks] = useState<HelpDeskListItem[]>([]);
  const [loadingDesks, setLoadingDesks] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCodeParam, setJoinCodeParam] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const fetchDesks = async () => {
    setLoadingDesks(true);
    try {
      const data = await api.getMyHelpDesks();
      setHelpDesks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDesks(false);
    }
  };

  useEffect(() => {
    fetchDesks();

    // Check if URL has ?join=code parameter
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      setJoinCodeParam(joinCode);
      setShowJoinModal(true);
    }
  }, []);

  const totalTickets = helpDesks.reduce((acc, d) => acc + d.tickets_count, 0);
  const totalMembers = helpDesks.reduce((acc, d) => acc + d.members_count, 0);
  const aiDesksCount = helpDesks.filter((d) => d.is_ai_active).length;
  const avgSla = helpDesks.length > 0 
    ? (helpDesks.reduce((acc, d) => acc + d.sla_compliance_rate, 0) / helpDesks.length).toFixed(1)
    : '99.2';

  // Sample weekly metrics for interactive SVG visualization
  const weeklyTrend = [
    { day: 'Lun', received: 18, resolved: 17 },
    { day: 'Mar', received: 24, resolved: 23 },
    { day: 'Mié', received: 32, resolved: 30 },
    { day: 'Jue', received: 28, resolved: 29 },
    { day: 'Vie', received: 36, resolved: 35 },
    { day: 'Sáb', received: 12, resolved: 14 },
    { day: 'Dom', received: 8, resolved: 9 },
  ];

  const maxVal = Math.max(...weeklyTrend.map(d => Math.max(d.received, d.resolved)));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-[90] rounded-full border border-rose-500/30 bg-surface shadow-xl py-3 px-5 flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="text-xs font-semibold text-primary">{feedbackToast}</span>
        </div>
      )}

      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
              Mis Mesas de Ayuda
            </h1>
            <span className="text-rose-500 font-cursive text-xl hidden sm:inline">
              control central
            </span>
          </div>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Organización: <strong className="text-primary">{user.full_name}</strong> • Espacios de soporte y gestión de incidencias
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setJoinCodeParam('');
              setShowJoinModal(true);
            }}
            className="craft-btn-secondary flex-1 sm:flex-initial shadow-xs rounded-full"
          >
            <Link2 className="w-4 h-4 text-rose-500" />
            Unirme a una Mesa
          </button>

          <button
            type="button"
            onClick={() => setShowWizard(true)}
            className="craft-btn-primary flex-1 sm:flex-initial shadow-sm rounded-full"
          >
            <Plus className="w-4 h-4" />
            Nueva Mesa de Ayuda
          </button>
        </div>
      </div>

      {/* 4 Enhanced Bento Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="craft-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
              Mesas de Ayuda
            </span>
            <span className="text-2xl font-black text-primary mt-1 block">
              {helpDesks.length}
            </span>
            <span className="text-[11px] text-secondary mt-0.5 block flex items-center gap-1">
              <span className="text-rose-500 font-semibold">{aiDesksCount} con IA</span> • {helpDesks.length - aiDesksCount} manuales
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-canvas border border-hairline flex items-center justify-center text-rose-500 shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="craft-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
              Volumen de Tickets
            </span>
            <span className="text-2xl font-black text-primary mt-1 block">
              {totalTickets}
            </span>
            <span className="text-[11px] text-secondary mt-0.5 block flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-rose-500" />
              <span>Flujo continuo activo</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-canvas border border-hairline flex items-center justify-center text-rose-500 shadow-xs">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="craft-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
              Cumplimiento SLA
            </span>
            <span className="text-2xl font-black text-rose-500 mt-1 block">
              {avgSla}%
            </span>
            <span className="text-[11px] text-secondary mt-0.5 block">
              Índice global de resolución
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-canvas border border-hairline flex items-center justify-center text-rose-500 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="craft-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
              Comunidad y Miembros
            </span>
            <span className="text-2xl font-black text-primary mt-1 block">
              {totalMembers}
            </span>
            <span className="text-[11px] text-secondary mt-0.5 block">
              Agentes y solicitantes
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-canvas border border-hairline flex items-center justify-center text-rose-500 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Interactive Visual Activity Chart Strip */}
      <div className="rounded-3xl border border-hairline bg-surface p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-primary tracking-tight">
                Flujo Operativo Semanal de Incidencias
              </h3>
            </div>
            <p className="text-xs text-secondary mt-0.5">
              Comparativa de tickets ingresados vs incidencias atendidas y cerradas
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-secondary">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/30 border border-rose-500" />
              Ingresados
            </span>
            <span className="flex items-center gap-1.5 text-primary">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Resueltos
            </span>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div className="pt-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 h-44 items-end px-2">
            {weeklyTrend.map((t, idx) => {
              const recHeight = (t.received / maxVal) * 100;
              const resHeight = (t.resolved / maxVal) * 100;

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-32">
                    {/* Received Bar */}
                    <div
                      style={{ height: `${recHeight}%` }}
                      className="w-1/2 max-w-[14px] bg-rose-500/25 group-hover:bg-rose-500/40 rounded-full transition-all duration-300 relative"
                      title={`Ingresados: ${t.received}`}
                    />
                    {/* Resolved Bar */}
                    <div
                      style={{ height: `${resHeight}%` }}
                      className="w-1/2 max-w-[14px] bg-rose-500 group-hover:bg-rose-600 rounded-full transition-all duration-300 shadow-xs relative"
                      title={`Resueltos: ${t.resolved}`}
                    />
                  </div>

                  {/* Day Label */}
                  <span className="text-[11px] font-bold text-secondary group-hover:text-primary transition-colors">
                    {t.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-hairline flex flex-col sm:flex-row items-center justify-between text-xs text-secondary gap-2">
            <span>Rendimiento óptimo: Tasa de resolución sostenida del 96.4% esta semana</span>
            <span className="text-rose-500 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Tiempo medio de primera respuesta: 18 min
            </span>
          </div>
        </div>
      </div>

      {/* Help Desks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary tracking-tight">
            Tus Espacios Asignados
          </h2>
          <span className="text-xs text-secondary font-medium">
            {helpDesks.length} {helpDesks.length === 1 ? 'mesa disponible' : 'mesas disponibles'}
          </span>
        </div>

        {loadingDesks ? (
          <div className="p-12 text-center text-secondary text-sm space-y-2">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Cargando tus mesas de ayuda...</p>
          </div>
        ) : helpDesks.length === 0 ? (
          <div className="rounded-3xl border border-hairline bg-surface p-12 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-canvas border border-hairline text-rose-500 flex items-center justify-center mx-auto shadow-xs">
              <Layers className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-primary">No tienes ninguna mesa de ayuda creada</h3>
              <p className="text-xs text-secondary max-w-sm mx-auto">
                Crea tu primera mesa de ayuda o únete a un equipo mediante un enlace de invitación compartido.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWizard(true)}
              className="craft-btn-primary text-xs rounded-full"
            >
              <Plus className="w-4 h-4" />
              Crear Mesa de Ayuda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {helpDesks.map((desk) => {
              const roleDisplay =
                desk.role === 'admin' ? 'Administrador' :
                desk.role === 'agent' ? 'Soporte / Agente' : 'Usuario / Solicitante';

              const roleBadgeColor =
                desk.role === 'admin' ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' :
                desk.role === 'agent' ? 'text-primary border-hairline bg-canvas' : 'text-secondary border-hairline bg-surface';

              return (
                <div
                  key={desk.id}
                  onClick={() => onSelectDesk(desk)}
                  className="rounded-3xl border border-hairline bg-surface p-6 space-y-4 hover:border-rose-500/40 hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${roleBadgeColor}`}>
                        {roleDisplay}
                      </span>

                      {/* Truthful AI status */}
                      <span className="text-[11px] font-semibold text-secondary flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            desk.is_ai_active ? 'bg-rose-500 animate-pulse' : 'bg-zinc-400'
                          }`}
                        />
                        {desk.is_ai_active 
                          ? 'IA Activa' 
                          : (desk.is_ai_enabled ? 'IA Sin Configurar' : 'Manual')}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-primary mt-3 group-hover:text-rose-500 transition-colors">
                      {desk.name}
                    </h3>
                    <span className="text-xs text-rose-500 font-semibold block mt-0.5">
                      /{desk.slug}
                    </span>

                    <p className="text-xs text-secondary mt-3 line-clamp-2 leading-relaxed">
                      {desk.description || 'Mesa de ayuda para atención y gestión de incidencias.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-hairline space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-2xl bg-canvas border border-hairline shadow-xs">
                        <span className="text-[10px] text-secondary uppercase font-semibold block">Tickets</span>
                        <span className="font-extrabold text-primary text-sm mt-0.5 block">{desk.tickets_count}</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-canvas border border-hairline shadow-xs">
                        <span className="text-[10px] text-secondary uppercase font-semibold block">Miembros</span>
                        <span className="font-extrabold text-primary text-sm mt-0.5 block">{desk.members_count}</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-canvas border border-hairline shadow-xs">
                        <span className="text-[10px] text-secondary uppercase font-semibold block">SLA</span>
                        <span className="font-extrabold text-rose-500 text-sm mt-0.5 block">{desk.sla_compliance_rate}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-secondary pt-1">
                      <span className="text-[11px] text-secondary">
                        Acceso directo
                      </span>
                      <span className="text-primary font-semibold flex items-center gap-1 group-hover:text-rose-500 transition-colors">
                        Abrir Espacio <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Onboarding Wizard Modal with AnimatePresence */}
      <AnimatePresence>
        {showWizard && (
          <OnboardingWizardModal
            onClose={() => setShowWizard(false)}
            onSuccess={() => {
              fetchDesks();
              setFeedbackToast('¡Mesa de ayuda creada exitosamente!');
              setTimeout(() => setFeedbackToast(null), 4000);
            }}
          />
        )}
      </AnimatePresence>

      {/* Join Desk Modal with AnimatePresence */}
      <AnimatePresence>
        {showJoinModal && (
          <JoinDeskModal
            initialCode={joinCodeParam}
            onClose={() => {
              setShowJoinModal(false);
              setJoinCodeParam('');
            }}
            onSuccess={(joinedDesk) => {
              fetchDesks();
              setFeedbackToast(`¡Te has unido exitosamente a ${joinedDesk.name}!`);
              setTimeout(() => setFeedbackToast(null), 4000);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
