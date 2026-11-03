export type ThemeMode = 'light' | 'dark' | 'amoled';

export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

export interface AIStatus {
  is_connected: boolean;
  provider: 'gemini' | 'openai' | 'claude' | null;
  model_name: string | null;
  latency_ms: number | null;
  last_tested_at: string | null;
  available_models: ModelOption[];
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
}

export interface Priority {
  id?: number;
  name: string;
  level: number;
  color: string;
  sla_response_hours: number;
  sla_resolution_hours: number;
}

export interface HelpDeskListItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_ai_enabled: boolean;
  role: string;
  members_count: number;
  tickets_count: number;
  sla_compliance_rate: number;
  created_at: string;
}

export interface HelpDeskDetails {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_ai_enabled: boolean;
  created_at: string;
  categories: Category[];
  priorities: Priority[];
  user_role: string;
}

const API_BASE = '/api';

function getHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const activeToken = token || localStorage.getItem('caseflow_token');
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
}

export const api = {
  // Auth
  async register(email: string, full_name: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, full_name, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al registrar usuario');
    }
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al iniciar sesión');
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error('Sesión expirada');
    }
    return res.json();
  },

  // AI Vault
  async getAIStatus(): Promise<AIStatus> {
    const res = await fetch(`${API_BASE}/ai/vault/status`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al consultar estado de IA');
    return res.json();
  },

  async testAIConnection(provider: string, api_key: string, model_name?: string) {
    const res = await fetch(`${API_BASE}/ai/vault/test`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ provider, api_key, model_name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Fallo en la prueba de conexión');
    }
    return res.json();
  },

  async connectAIKey(provider: string, api_key: string, model_name?: string) {
    const res = await fetch(`${API_BASE}/ai/vault/connect`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ provider, api_key, model_name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Fallo al vincular la clave de API');
    }
    return res.json();
  },

  async disconnectAI() {
    const res = await fetch(`${API_BASE}/ai/vault/disconnect`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al desconectar IA');
    return res.json();
  },

  // Help Desks
  async getMyHelpDesks(): Promise<HelpDeskListItem[]> {
    const res = await fetch(`${API_BASE}/desks`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener mesas de ayuda');
    return res.json();
  },

  async createHelpDeskWizard(payload: {
    name: string;
    slug: string;
    description?: string;
    enable_ai: boolean;
    categories?: Category[];
    priorities?: Priority[];
  }): Promise<HelpDeskDetails> {
    const res = await fetch(`${API_BASE}/desks/wizard`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al crear la mesa de ayuda');
    }
    return res.json();
  },

  async toggleDeskAI(slug: string): Promise<HelpDeskDetails> {
    const res = await fetch(`${API_BASE}/desks/${slug}/ai-toggle`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al alternar IA de la mesa');
    return res.json();
  },
};
