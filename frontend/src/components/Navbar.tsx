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
  onLogoClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTheme,
  onThemeChange,
  user,
  aiStatus,
  onOpenAuth,
  onLogout,
  onLogoClick,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-canvas/90 border-b border-hairline transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 amoled:bg-rose-500 amoled:text-white flex items-center justify-center font-bold transition-all">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold tracking-tight text-primary font-sans">
              Case<span className="text-rose-500">Flow</span>
            </span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-surface border border-hairline text-secondary">
              v1.0.0
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* AI Connection status pill (if user is logged in) */}
          {user && (
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono border border-hairline bg-surface">
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus?.is_connected ? 'bg-emerald-500' : 'bg-zinc-400'
                }`}
              />
              <span className="text-secondary text-[11px]">
                {aiStatus?.is_connected
                  ? `${aiStatus.provider?.toUpperCase()} • ${aiStatus.latency_ms}ms`
                  : 'BYOK: Inactivo'}
              </span>
            </div>
          )}

          {/* Theme Selector */}
          <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />

          {/* User state */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-hairline">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-surface border border-hairline flex items-center justify-center text-primary text-xs font-mono font-semibold">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium text-primary leading-tight">{user.full_name}</div>
                  <div className="text-[10px] text-secondary font-mono leading-tight">{user.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-md text-secondary hover:text-rose-500 hover:bg-surface border border-transparent hover:border-hairline transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-medium text-secondary hover:text-primary transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="craft-btn-primary"
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
