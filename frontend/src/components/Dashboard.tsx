import React, { useState, useEffect } from 'react';
import { 
  Plus, Layers, ArrowUpRight, 
  Link2, Users, Ticket, CheckCircle2
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl border border-emerald-500/30 bg-surface shadow-xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-xs font-semibold text-primary">{feedbackToast}</span>
        </div>
      )}

      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
            Mis Mesas de Ayuda
          </h1>
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
            className="craft-btn-secondary flex-1 sm:flex-initial shadow-xs"
          >
            <Link2 className="w-4 h-4 text-rose-500" />
            Unirme a una Mesa
          </button>

          <button
            type="button"
            onClick={() => setShowWizard(true)}
            className="craft-btn-primary flex-1 sm:flex-initial shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Mesa de Ayuda
          </button>
        </div>
      </div>

      {/* Bento Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
              Mesas de Ayuda
            </span>
            <span className="text-2xl font-black text-primary mt-1 block">
              {helpDesks.length}
            </span>
            <span className="text-[11px] text-secondary mt-0.5 block">
              Espacios de trabajo activos
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-canvas border border-hairline flex items-center justify-center text-rose-500 shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
              Tickets Gestionados
            </span>
            <span className="text-2xl font-black text-primary mt-1 block">
              {totalTickets}
            </span>
            <span className="text-[11px] text-secondary mt-0.5 block">
              En todas tus mesas vinculadas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-canvas border border-hairline flex items-center justify-center text-blue-500 shadow-xs">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
              Compañeros y Miembros
            </span>
            <span className="text-2xl font-black text-primary mt-1 block">
              {totalMembers}
            </span>
            <span className="text-[11px] text-secondary mt-0.5 block">
              Usuarios y agentes de soporte
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-canvas border border-hairline flex items-center justify-center text-emerald-500 shadow-xs">
            <Users className="w-6 h-6" />
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
          <div className="p-12 text-center text-secondary text-sm">
            Cargando tus mesas de ayuda...
          </div>
        ) : helpDesks.length === 0 ? (
          <div className="rounded-3xl border border-hairline bg-surface p-12 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-canvas border border-hairline text-rose-500 flex items-center justify-center mx-auto shadow-xs">
              <Layers className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-base font-bold text-primary">
                Aún no perteneces a ninguna mesa de ayuda
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                Crea una nueva mesa de ayuda para tu organización o únete a una existente utilizando el enlace de invitación compartido por tu administrador.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowJoinModal(true)}
                className="craft-btn-secondary shadow-xs"
              >
                <Link2 className="w-4 h-4 text-rose-500" />
                Unirme mediante enlace
              </button>
              <button
                type="button"
                onClick={() => setShowWizard(true)}
                className="craft-btn-primary shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Crear Primera Mesa
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {helpDesks.map((desk) => {
              const roleDisplay = 
                desk.role === 'admin' ? 'Administrador' :
                desk.role === 'agent' ? 'Soporte / Agente' : 'Usuario / Solicitante';

              const roleBadgeColor =
                desk.role === 'admin' ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' :
                desk.role === 'agent' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' : 'text-zinc-500 border-hairline bg-canvas';

              return (
                <div
                  key={desk.id}
                  onClick={() => onSelectDesk(desk)}
                  className="rounded-2xl border border-hairline bg-surface p-6 space-y-4 hover:border-rose-500/40 hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${roleBadgeColor}`}>
                        {roleDisplay}
                      </span>

                      <span className="text-[11px] font-semibold text-secondary flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            desk.is_ai_enabled ? 'bg-emerald-500' : 'bg-zinc-400'
                          }`}
                        />
                        {desk.is_ai_enabled ? 'IA Activa' : 'Manual'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-primary mt-2.5 group-hover:text-rose-500 transition-colors">
                      {desk.name}
                    </h3>
                    <span className="text-xs text-secondary font-mono">
                      /{desk.slug}
                    </span>

                    <p className="text-xs text-secondary mt-3 line-clamp-2 leading-relaxed">
                      {desk.description || 'Mesa de ayuda para atención y gestión de incidencias.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-hairline space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-canvas border border-hairline shadow-xs">
                        <span className="text-[10px] text-secondary uppercase font-semibold block">Tickets</span>
                        <span className="font-extrabold text-primary text-sm mt-0.5 block">{desk.tickets_count}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-canvas border border-hairline shadow-xs">
                        <span className="text-[10px] text-secondary uppercase font-semibold block">Miembros</span>
                        <span className="font-extrabold text-primary text-sm mt-0.5 block">{desk.members_count}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-canvas border border-hairline shadow-xs">
                        <span className="text-[10px] text-secondary uppercase font-semibold block">SLA</span>
                        <span className="font-extrabold text-emerald-500 text-sm mt-0.5 block">{desk.sla_compliance_rate}%</span>
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

      {/* Onboarding Wizard Modal */}
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

      {/* Join Desk Modal */}
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
    </div>
  );
};
