import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
        className="relative w-full max-w-sm rounded-3xl border border-hairline bg-surface p-7 shadow-2xl transition-all"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-secondary hover:text-primary hover:bg-canvas cursor-pointer transition-all hover:scale-110 active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab switch pills */}
        <div className="flex p-1 bg-canvas rounded-full border border-hairline mb-6">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer ${
              tab === 'login'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer ${
              tab === 'register'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2.5">
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
            className="craft-btn-primary w-full mt-3 py-3 shadow-md rounded-full"
          >
            {loading ? 'Procesando...' : tab === 'login' ? 'Acceder al Sistema' : 'Completar Registro'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};
