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
  desk_slug?: string | null;
  desk_name?: string | null;
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

export interface TicketComment {
  id: number;
  ticket_id: number;
  user_id: number;
  user_name: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export interface TicketItem {
  id: number;
  help_desk_id: number;
  ticket_code: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  category_id: number | null;
  category_name: string;
  priority_id: number | null;
  priority_name: string;
  priority_level: number;
  requester_id: number;
  requester_name: string;
  assignee_id: number | null;
  assignee_name: string | null;
  created_at: string;
  resolved_at: string | null;
  sla_resolution_hours: number;
  sla_due_at: string | null;
  comments_count: number;
}

export interface TicketDetail extends TicketItem {
  comments: TicketComment[];
}

export interface HelpDeskContextData {
  id: number;
  help_desk_id: number;
  content: string;
  version: number;
  updated_at: string;
}

export interface RetrospectiveIngestResult {
  success: boolean;
  processed_tickets: number;
  version: number;
  message: string;
  context_preview: string;
}

export interface AIRefineResult {
  suggested_title: string;
  suggested_category_id: number | null;
  suggested_priority_id: number | null;
  analysis: string;
}

export interface AIFeatureToggle {
  id: number;
  help_desk_id: number;
  feature_name: string;
  feature_label: string;
  description: string;
  role_requester: boolean;
  role_agent: boolean;
  role_admin: boolean;
  is_enabled: boolean;
}

export interface CopilotSuggestion {
  suggested_reply: string;
  explanation: string;
  source: string;
}

export interface CopilotDiagnosis {
  diagnosis: string;
  recommended_steps: string[];
  similar_cases: string[];
}

export interface CopilotSummary {
  summary: string;
  key_points: string[];
}

export interface HelpDeskMemberItem {
  id: number;
  user_id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface HelpDeskInvitationItem {
  id: number;
  help_desk_id: number;
  code: string;
  role: string;
  label?: string;
  is_active: boolean;
  max_uses?: number | null;
  uses_count: number;
  expires_at?: string | null;
  created_at: string;
  invite_url: string;
}

export interface InvitationPreview {
  valid: boolean;
  code: string;
  help_desk_name: string;
  help_desk_slug: string;
  role: string;
  label?: string;
  message?: string;
}

export interface JoinDeskResult {
  message: string;
  role: string;
  desk: HelpDeskDetails;
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
      throw new Error(err.detail || 'Credenciales inválidas');
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Sesión expirada o no autorizada');
    return res.json();
  },

  // Global / Legacy AI Vault
  async getAIStatus(): Promise<AIStatus> {
    const res = await fetch(`${API_BASE}/ai/vault/status`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al consultar estado de IA');
    return res.json();
  },

  async testAIKey(provider: string, api_key: string, model_name?: string) {
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

  async testAIConnection(provider: string, api_key: string, model_name?: string) {
    return this.testAIKey(provider, api_key, model_name);
  },

  async connectAIKey(provider: string, api_key: string, model_name?: string) {
    const res = await fetch(`${API_BASE}/ai/vault/connect`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ provider, api_key, model_name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al vincular clave de API');
    }
    return res.json();
  },

  async disconnectAI() {
    const res = await fetch(`${API_BASE}/ai/vault/disconnect`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al desvincular credenciales');
    return res.json();
  },

  // Desk-Specific AI Vault (Sprint 4)
  async getDeskAIStatus(slug: string): Promise<AIStatus> {
    const res = await fetch(`${API_BASE}/ai/vault/status?desk_slug=${encodeURIComponent(slug)}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al consultar estado de IA para esta mesa');
    return res.json();
  },

  async connectDeskAIKey(slug: string, provider: string, api_key: string, model_name?: string): Promise<{ success: boolean; latency_ms: number; message: string; model_name: string }> {
    const res = await fetch(`${API_BASE}/ai/vault/connect`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ desk_slug: slug, provider, api_key, model_name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'No se pudo vincular la clave de API a esta mesa');
    }
    return res.json();
  },

  async disconnectDeskAI(slug: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/ai/vault/disconnect?desk_slug=${encodeURIComponent(slug)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al desvincular IA de esta mesa');
    return res.json();
  },

  // Help Desks
  async getMyHelpDesks(): Promise<HelpDeskListItem[]> {
    const res = await fetch(`${API_BASE}/desks`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al cargar mesas de ayuda');
    return res.json();
  },

  async createHelpDesk(data: {
    name: string;
    slug: string;
    description?: string;
    enable_ai?: boolean;
    categories?: Partial<Category>[];
    priorities?: Partial<Priority>[];
  }): Promise<HelpDeskDetails> {
    const res = await fetch(`${API_BASE}/desks/wizard`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al crear la mesa de ayuda');
    }
    return res.json();
  },

  async createHelpDeskWizard(data: any): Promise<HelpDeskDetails> {
    return this.createHelpDesk(data);
  },

  async getDeskDetails(slug: string): Promise<HelpDeskDetails> {
    const res = await fetch(`${API_BASE}/desks/${slug}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al consultar mesa de ayuda');
    return res.json();
  },

  async toggleDeskAI(slug: string): Promise<HelpDeskDetails> {
    const res = await fetch(`${API_BASE}/desks/${slug}/ai-toggle`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al cambiar estado de IA');
    return res.json();
  },

  // Invitations & Joining (Sprint 4)
  async previewInvitation(code: string): Promise<InvitationPreview> {
    const res = await fetch(`${API_BASE}/desks/invitations/preview/${encodeURIComponent(code)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Enlace o código de invitación inválido');
    }
    return res.json();
  },

  async joinDesk(code: string): Promise<JoinDeskResult> {
    const res = await fetch(`${API_BASE}/desks/join`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'No fue posible unirse a la mesa de ayuda');
    }
    return res.json();
  },

  async getDeskInvitations(slug: string): Promise<HelpDeskInvitationItem[]> {
    const res = await fetch(`${API_BASE}/desks/${slug}/invitations`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al listar enlaces de invitación');
    return res.json();
  },

  async createDeskInvitation(slug: string, payload: {
    role: string;
    label?: string;
    max_uses?: number;
    expires_days?: number;
  }): Promise<HelpDeskInvitationItem> {
    const res = await fetch(`${API_BASE}/desks/${slug}/invitations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al generar enlace de invitación');
    }
    return res.json();
  },

  async toggleDeskInvitation(slug: string, invitationId: number): Promise<HelpDeskInvitationItem> {
    const res = await fetch(`${API_BASE}/desks/${slug}/invitations/${invitationId}/toggle`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al alternar estado del enlace');
    return res.json();
  },

  async deleteDeskInvitation(slug: string, invitationId: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/desks/${slug}/invitations/${invitationId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar enlace de invitación');
    return res.json();
  },

  // Members Management (Sprint 4)
  async getDeskMembers(slug: string): Promise<HelpDeskMemberItem[]> {
    const res = await fetch(`${API_BASE}/desks/${slug}/members`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al listar miembros de la mesa');
    return res.json();
  },

  async updateDeskMember(slug: string, userId: number, payload: { role?: string; is_active?: boolean }): Promise<HelpDeskMemberItem> {
    const res = await fetch(`${API_BASE}/desks/${slug}/members/${userId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al actualizar usuario');
    }
    return res.json();
  },

  async removeDeskMember(slug: string, userId: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/desks/${slug}/members/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al eliminar usuario');
    }
    return res.json();
  },

  // Tickets
  async getTickets(
    slug: string, 
    statusFilter?: string, 
    catFilter?: number, 
    priorityFilter?: number, 
    slaFilter?: string
  ): Promise<TicketItem[]> {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
    if (catFilter) params.append('category_id', catFilter.toString());
    if (priorityFilter) params.append('priority_id', priorityFilter.toString());
    if (slaFilter && slaFilter !== 'all') params.append('sla_status', slaFilter);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/desks/${slug}/tickets${qs}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al cargar tickets');
    return res.json();
  },

  async createTicket(slug: string, data: {
    title: string;
    description: string;
    category_id?: number | null;
    priority_id?: number | null;
  }): Promise<TicketItem> {
    const res = await fetch(`${API_BASE}/desks/${slug}/tickets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al crear ticket');
    }
    return res.json();
  },

  async getTicketDetail(slug: string, ticketCode: string): Promise<TicketDetail> {
    const res = await fetch(`${API_BASE}/desks/${slug}/tickets/${ticketCode}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al consultar ticket');
    return res.json();
  },

  async updateTicketStatus(slug: string, ticketCode: string, statusVal: string, diagnostic?: string): Promise<TicketItem> {
    const res = await fetch(`${API_BASE}/desks/${slug}/tickets/${ticketCode}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status: statusVal, diagnostic }),
    });
    if (!res.ok) throw new Error('Error al actualizar estado del ticket');
    return res.json();
  },

  async assignTicket(slug: string, ticketCode: string, assignee_id: number): Promise<TicketItem> {
    const res = await fetch(`${API_BASE}/desks/${slug}/tickets/${ticketCode}/assign`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ assignee_id }),
    });
    if (!res.ok) throw new Error('Error al asignar ticket');
    return res.json();
  },

  async addTicketComment(slug: string, ticketCode: string, message: string, is_internal = false): Promise<TicketComment> {
    const res = await fetch(`${API_BASE}/desks/${slug}/tickets/${ticketCode}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, is_internal }),
    });
    if (!res.ok) throw new Error('Error al registrar comentario');
    return res.json();
  },

  // Context & AI Retrospective
  async getDeskContext(slug: string): Promise<HelpDeskContextData> {
    const res = await fetch(`${API_BASE}/desks/${slug}/context`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al consultar la memoria de soporte');
    return res.json();
  },

  async updateDeskContext(slug: string, content: string): Promise<HelpDeskContextData> {
    const res = await fetch(`${API_BASE}/desks/${slug}/context`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Error al actualizar la memoria de soporte');
    return res.json();
  },

  async ingestDeskContext(slug: string, guidelines?: string): Promise<RetrospectiveIngestResult> {
    const res = await fetch(`${API_BASE}/desks/${slug}/context/ingest`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ guidelines }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error en la síntesis de casos');
    }
    return res.json();
  },

  async refineTicketAI(slug: string, description: string): Promise<AIRefineResult> {
    const res = await fetch(`${API_BASE}/desks/${slug}/ai/refine-ticket`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ description }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error en el asistente de refinamiento');
    }
    return res.json();
  },

  // Governance & AI Toggles (Sprint 3)
  async getAIToggles(slug: string): Promise<AIFeatureToggle[]> {
    const res = await fetch(`${API_BASE}/desks/${slug}/ai/toggles`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al consultar gobierno de IA');
    return res.json();
  },

  async updateAIToggles(slug: string, toggles: {
    feature_name: string;
    role_requester?: boolean;
    role_agent?: boolean;
    role_admin?: boolean;
    is_enabled?: boolean;
  }[]): Promise<AIFeatureToggle[]> {
    const res = await fetch(`${API_BASE}/desks/${slug}/ai/toggles`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ toggles }),
    });
    if (!res.ok) throw new Error('Error al actualizar gobierno de IA');
    return res.json();
  },

  // AI Copilot Endpoints (Sprint 3)
  async getCopilotSuggestedReply(slug: string, ticketCode: string): Promise<CopilotSuggestion> {
    const res = await fetch(`${API_BASE}/desks/${slug}/tickets/${ticketCode}/copilot/suggest-reply`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al generar sugerencia de respuesta');
    }
    return res.json();
  },

  async getCopilotDiagnosis(slug: string, ticketCode: string): Promise<CopilotDiagnosis> {
    const res = await fetch(`${API_BASE}/desks/${slug}/tickets/${ticketCode}/copilot/diagnose`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al obtener diagnóstico técnico');
    }
    return res.json();
  },

  async getCopilotSummary(slug: string, ticketCode: string): Promise<CopilotSummary> {
    const res = await fetch(`${API_BASE}/desks/${slug}/tickets/${ticketCode}/copilot/summary`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al generar resumen ejecutivo');
    }
    return res.json();
  },
};
