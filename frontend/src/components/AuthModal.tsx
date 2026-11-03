import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import { api, User as UserType } from '../api';

interface AuthModalProps {
  initialTab: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: UserType, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialTab, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'register') {
        const res = await api.register(email, fullName, password);
        localStorage.setItem('caseflow_token', res.access_token);
        onSuccess(res.user, res.access_token);
      } else {
        const res = await api.login(email, password);
        localStorage.setItem('caseflow_token', res.access_token);
        onSuccess(res.user, res.access_token);
      }
    } catch (err: any) {
      setError(err.message || 'Error en el proceso de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl border border-hairline bg-surface p-7 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-canvas cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab switch */}
        <div className="flex border-b border-hairline pb-3 mb-6">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`pb-2 text-xs font-semibold tracking-tight transition-all border-b-2 mr-6 cursor-pointer ${
              tab === 'login'
                ? 'border-rose-500 text-rose-500 font-bold'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`pb-2 text-xs font-semibold tracking-tight transition-all border-b-2 cursor-pointer ${
              tab === 'register'
                ? 'border-rose-500 text-rose-500 font-bold'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">Nombre Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="craft-input craft-input-with-icon w-full"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-secondary mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                className="craft-input craft-input-with-icon w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="craft-input craft-input-with-icon w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="craft-btn-primary w-full mt-3 py-2.5 shadow-md"
          >
            {loading ? 'Procesando...' : tab === 'login' ? 'Acceder al Sistema' : 'Completar Registro'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
