import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { ThemeMode } from '../api';

interface ThemeSelectorProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="flex items-center p-1 bg-surface rounded-full border border-hairline transition-all">
      <button
        onClick={() => onThemeChange('light')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
          currentTheme === 'light'
            ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200'
            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
        }`}
        title="Modo Claro"
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Claro</span>
      </button>

      <button
        onClick={() => onThemeChange('dark')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
          currentTheme === 'dark'
            ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
        }`}
        title="Modo Oscuro"
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Oscuro</span>
      </button>

      <button
        onClick={() => onThemeChange('amoled')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
          currentTheme === 'amoled'
            ? 'bg-rose-500/20 text-rose-400 shadow-sm border border-rose-500/30'
            : 'text-zinc-500 hover:text-rose-400'
        }`}
        title="Modo Oscuro AMOLED (Negro Puro)"
      >
        <Sparkles className="w-3.5 h-3.5 text-rose-500" />
        <span className="hidden sm:inline">AMOLED</span>
      </button>
    </div>
  );
};
