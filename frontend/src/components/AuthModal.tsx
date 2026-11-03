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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-hairline bg-surface p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-canvas transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab switch */}
        <div className="flex border-b border-hairline pb-3 mb-6">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`pb-2 text-sm font-semibold transition-all border-b-2 mr-6 ${
              tab === 'login'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`pb-2 text-sm font-semibold transition-all border-b-2 ${
              tab === 'register'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Ing. Jairo Molano"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-canvas border border-hairline text-primary focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@usco.edu.co"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-canvas border border-hairline text-primary focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-canvas border border-hairline text-primary focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-all flex items-center justify-center gap-2 shadow-sm shadow-rose-500/20"
          >
            {loading ? 'Procesando...' : tab === 'login' ? 'Entrar a CaseFlow' : 'Crear Cuenta'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
