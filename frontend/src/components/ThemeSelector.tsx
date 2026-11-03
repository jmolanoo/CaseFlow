import React from 'react';
import { Sun, Moon, CircleDot } from 'lucide-react';
import { ThemeMode } from '../api';

interface ThemeSelectorProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="flex items-center p-0.5 bg-surface rounded-lg border border-hairline transition-all">
      <button
        type="button"
        onClick={() => onThemeChange('light')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
          currentTheme === 'light'
            ? 'bg-white text-zinc-950 border border-zinc-200'
            : 'text-secondary hover:text-primary'
        }`}
        title="Modo Claro"
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Claro</span>
      </button>

      <button
        type="button"
        onClick={() => onThemeChange('dark')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
          currentTheme === 'dark'
            ? 'bg-zinc-800 text-white border border-zinc-700'
            : 'text-secondary hover:text-primary'
        }`}
        title="Modo Oscuro"
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Oscuro</span>
      </button>

      <button
        type="button"
        onClick={() => onThemeChange('amoled')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
          currentTheme === 'amoled'
            ? 'bg-black text-rose-400 border border-rose-500/40'
            : 'text-secondary hover:text-rose-400'
        }`}
        title="Modo Oscuro AMOLED (Negro Puro #000000)"
      >
        <CircleDot className="w-3.5 h-3.5 text-rose-500" />
        <span className="hidden sm:inline font-mono text-[11px]">AMOLED</span>
      </button>
    </div>
  );
};
