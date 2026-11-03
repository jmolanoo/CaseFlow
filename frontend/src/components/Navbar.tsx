import React from 'react';
import { Layers, LogOut } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { User, ThemeMode, AIStatus } from '../api';

interface NavbarProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  user: User | null;
  aiStatus: AIStatus | null;
  onOpenAuth: (tab: 'login' | 'register') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTheme,
  onThemeChange,
  user,
  aiStatus,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-canvas/80 border-b border-hairline transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-sm shadow-rose-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-primary font-sans">
              Case<span className="text-rose-500">Flow</span>
            </span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
              v1.0.0
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* AI Connection status pill (if user is logged in) */}
          {user && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-hairline bg-surface">
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus?.is_connected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                }`}
              />
              <span className="text-secondary">
                {aiStatus?.is_connected
                  ? `${aiStatus.provider?.toUpperCase()} • ${aiStatus.latency_ms}ms`
                  : 'BYOK: Inactivo (Modo Manual)'}
              </span>
            </div>
          )}

          {/* Theme Selector */}
          <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />

          {/* User state */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-hairline">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface border border-hairline flex items-center justify-center text-primary text-xs font-semibold">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium text-primary leading-tight">{user.full_name}</div>
                  <div className="text-[10px] text-secondary font-mono leading-tight">{user.email}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs font-medium text-secondary hover:text-primary transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-sm shadow-rose-500/20"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
