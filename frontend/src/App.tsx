import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { api, ThemeMode, User, AIStatus } from './api';

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('caseflow_theme') as ThemeMode;
    return saved || 'dark';
  });

  // Auth & User state
  const [user, setUser] = useState<User | null>(null);
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; tab: 'login' | 'register' }>({
    isOpen: false,
    tab: 'login',
  });
  const [initializing, setInitializing] = useState(true);

  // Apply theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'amoled');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'amoled') {
      root.classList.add('dark', 'amoled');
    }
    localStorage.setItem('caseflow_theme', theme);
  }, [theme]);

  // Check existing session
  const checkSession = async () => {
    const token = localStorage.getItem('caseflow_token');
    if (!token) {
      setInitializing(false);
      return;
    }

    try {
      const userData = await api.getMe();
      setUser(userData);
      const aiData = await api.getAIStatus().catch(() => null);
      setAIStatus(aiData);
    } catch {
      localStorage.removeItem('caseflow_token');
      setUser(null);
      setAIStatus(null);
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('caseflow_token');
    setUser(null);
    setAIStatus(null);
  };

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    setAuthModal({ isOpen: false, tab: 'login' });
    api.getAIStatus().then(setAIStatus).catch(() => null);
  };

  const refreshAI = async () => {
    try {
      const data = await api.getAIStatus();
      setAIStatus(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas text-secondary font-mono text-xs">
        Iniciando CaseFlow v1.0.0...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-primary transition-colors duration-200">
      <Navbar
        currentTheme={theme}
        onThemeChange={setTheme}
        user={user}
        aiStatus={aiStatus}
        onOpenAuth={(tab) => setAuthModal({ isOpen: true, tab })}
        onLogout={handleLogout}
      />

      <main>
        {user ? (
          <Dashboard
            user={user}
            aiStatus={aiStatus}
            onRefreshAIStatus={refreshAI}
          />
        ) : (
          <LandingPage onOpenAuth={(tab) => setAuthModal({ isOpen: true, tab })} />
        )}
      </main>

      {/* Auth Modal */}
      {authModal.isOpen && (
        <AuthModal
          initialTab={authModal.tab}
          onClose={() => setAuthModal({ ...authModal, isOpen: false })}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default App;
