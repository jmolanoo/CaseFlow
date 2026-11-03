import React from 'react';
import { Sun, Moon, CircleDot } from 'lucide-react';
import { ThemeMode } from '../api';

interface ThemeSelectorProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="flex items-center p-1 bg-surface rounded-xl border border-hairline shadow-xs transition-all">
      <button
        type="button"
        onClick={() => onThemeChange('light')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 ${
          currentTheme === 'light'
            ? 'bg-white text-zinc-950 border border-zinc-200 shadow-xs scale-[1.02]'
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
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 ${
          currentTheme === 'dark'
            ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs scale-[1.02]'
            : 'text-secondary hover:text-primary'
        }`}
        title="Modo Oscuro Neutral"
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Oscuro</span>
      </button>

      <button
        type="button"
        onClick={() => onThemeChange('amoled')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 ${
          currentTheme === 'amoled'
            ? 'bg-black text-rose-400 border border-rose-500/40 shadow-xs scale-[1.02]'
            : 'text-secondary hover:text-rose-400'
        }`}
        title="Modo Oscuro AMOLED (#000000)"
      >
        <CircleDot className="w-3.5 h-3.5 text-rose-500" />
        <span className="hidden sm:inline text-xs">AMOLED</span>
      </button>
    </div>
  );
};
