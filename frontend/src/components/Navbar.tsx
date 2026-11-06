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
  onOpenAuth,
  onLogout,
  onLogoClick,
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-canvas/90 border-b border-hairline transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 amoled:bg-rose-500 amoled:text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-all duration-200">
            <Layers className="w-5 h-5 text-rose-500 dark:text-rose-500 amoled:text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold tracking-tight text-primary font-sans group-hover:opacity-90 transition-opacity">
              Case<span className="text-rose-500">Flow</span>
            </span>
            <span className="text-rose-500 font-cursive text-sm hidden sm:inline">
              gestión inteligente
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Theme Selector */}
          <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />

          {/* User state */}
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-hairline">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-surface border border-hairline flex items-center justify-center text-primary text-xs font-semibold shadow-sm">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-primary leading-tight">{user.full_name}</div>
                  <div className="text-[10px] text-secondary leading-tight">{user.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-full text-secondary hover:text-rose-500 hover:bg-surface border border-transparent hover:border-hairline cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="craft-btn-secondary text-xs rounded-full"
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="craft-btn-primary text-xs rounded-full"
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
