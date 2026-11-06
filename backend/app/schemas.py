import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

# --- AI Vault Schemas ---
class AIConnectRequest(BaseModel):
    provider: str = Field(..., pattern="^(gemini|openai|claude)$")
    api_key: str = Field(..., min_length=10)
    model_name: Optional[str] = None
    desk_slug: Optional[str] = None

class ModelOption(BaseModel):
    id: str
    name: str
    description: str

class AIStatusResponse(BaseModel):
    is_connected: bool
    provider: Optional[str] = None
    model_name: Optional[str] = None
    latency_ms: Optional[float] = None
    last_tested_at: Optional[datetime.datetime] = None
    available_models: List[ModelOption] = []
    desk_slug: Optional[str] = None
    desk_name: Optional[str] = None

class AITestResponse(BaseModel):
    success: bool
    latency_ms: float
    message: str
    provider: str
    model_name: str
    models: List[ModelOption]

# --- Category & Priority Schemas ---
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    color: str = "#f43f5e"
    icon: str = "Folder"

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    help_desk_id: int

    class Config:
        from_attributes = True

class PriorityBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    level: int = Field(..., ge=1, le=4)
    color: str = "#f43f5e"
    sla_response_hours: int = Field(..., ge=1)
    sla_resolution_hours: int = Field(..., ge=1)

class PriorityCreate(PriorityBase):
    pass

class PriorityResponse(PriorityBase):
    id: int
    help_desk_id: int

    class Config:
        from_attributes = True

# --- HelpDesk Schemas ---
class HelpDeskCreateWizard(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    slug: str = Field(..., min_length=3, max_length=50, pattern="^[a-z0-9-]+$")
    description: Optional[str] = None
    enable_ai: bool = False
    categories: List[CategoryCreate] = []
    priorities: List[PriorityCreate] = []
    invite_emails: List[EmailStr] = []

class HelpDeskResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    is_ai_enabled: bool
    is_ai_active: bool = False
    created_at: datetime.datetime
    categories: List[CategoryResponse] = []
    priorities: List[PriorityResponse] = []
    user_role: Optional[str] = "admin"

    class Config:
        from_attributes = True

class HelpDeskListItem(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    is_ai_enabled: bool
    is_ai_active: bool = False
    role: str
    members_count: int
    tickets_count: int
    sla_compliance_rate: float
    created_at: datetime.datetime

# --- Ticket Schemas (Sprint 2) ---
class TicketCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=5)
    category_id: Optional[int] = None
    priority_id: Optional[int] = None

class TicketPriorityUpdate(BaseModel):
    priority_id: int

class TicketStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(open|in_progress|waiting|resolved|closed)$")
    diagnostic: Optional[str] = None

class TicketCommentCreate(BaseModel):
    message: str = Field(..., min_length=1)
    is_internal: bool = False

class TicketCommentResponse(BaseModel):
    id: int
    ticket_id: int
    user_id: int
    user_name: str
    message: str
    is_internal: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TicketResponse(BaseModel):
    id: int
    help_desk_id: int
    ticket_code: str
    title: str
    description: str
    status: str
    category_id: Optional[int]
    category_name: Optional[str]
    priority_id: Optional[int]
    priority_name: Optional[str]
    priority_level: Optional[int]
    requester_id: int
    requester_name: str
    assignee_id: Optional[int]
    assignee_name: Optional[str]
    created_at: datetime.datetime
    resolved_at: Optional[datetime.datetime]
    sla_resolution_hours: int = 24
    sla_due_at: Optional[datetime.datetime] = None
    comments_count: int = 0

    class Config:
        from_attributes = True

class TicketDetailResponse(TicketResponse):
    comments: List[TicketCommentResponse] = []

# --- AI Context Schemas (Sprint 2) ---
class HelpDeskContextResponse(BaseModel):
    id: int
    help_desk_id: int
    content: str
    version: int
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class HelpDeskContextUpdate(BaseModel):
    content: str = Field(..., min_length=10)

class RetrospectiveIngestRequest(BaseModel):
    guidelines: Optional[str] = None

class RetrospectiveIngestResponse(BaseModel):
    success: bool
    processed_tickets: int
    version: int
    message: str
    context_preview: str

class AIRefineTicketRequest(BaseModel):
    description: str = Field(..., min_length=5)

class AIRefineTicketResponse(BaseModel):
    suggested_title: str
    suggested_category_id: Optional[int] = None
    suggested_priority_id: Optional[int] = None
    analysis: str

# --- Sprint 3: Governance & AI Copilot Schemas ---
class AIFeatureToggleItem(BaseModel):
    id: int
    help_desk_id: int
    feature_name: str
    feature_label: str
    description: str
    role_requester: bool
    role_agent: bool
    role_admin: bool
    is_enabled: bool

    class Config:
        from_attributes = True

class AIFeatureToggleUpdate(BaseModel):
    feature_name: str
    role_requester: Optional[bool] = None
    role_agent: Optional[bool] = None
    role_admin: Optional[bool] = None
    is_enabled: Optional[bool] = None

class AIFeatureTogglesUpdateRequest(BaseModel):
    toggles: List[AIFeatureToggleUpdate]

class CopilotSuggestionResponse(BaseModel):
    suggested_reply: str
    explanation: str
    source: str

class CopilotDiagnosisResponse(BaseModel):
    diagnosis: str
    recommended_steps: List[str]
    similar_cases: List[str]

class CopilotSummaryResponse(BaseModel):
    summary: str
    key_points: List[str]

class TicketAssignRequest(BaseModel):
    assignee_id: int

# --- Sprint 4: Member Management & Invitation Schemas ---
class HelpDeskMemberResponse(BaseModel):
    id: int
    user_id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class HelpDeskMemberUpdate(BaseModel):
    role: Optional[str] = Field(None, pattern="^(admin|agent|requester)$")
    is_active: Optional[bool] = None

class InvitationCreate(BaseModel):
    role: str = Field("requester", pattern="^(admin|agent|requester)$")
    label: Optional[str] = Field(None, max_length=150)
    max_uses: Optional[int] = Field(None, ge=1)
    expires_days: Optional[int] = Field(None, ge=1)

class InvitationResponse(BaseModel):
    id: int
    help_desk_id: int
    code: str
    role: str
    label: Optional[str] = None
    is_active: bool
    max_uses: Optional[int] = None
    uses_count: int
    expires_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    invite_url: str

    class Config:
        from_attributes = True

class InvitationPreviewResponse(BaseModel):
    valid: bool
    code: str
    help_desk_name: str
    help_desk_slug: str
    role: str
    label: Optional[str] = None
    message: Optional[str] = None

class JoinDeskRequest(BaseModel):
    code: str = Field(..., min_length=4)

class JoinDeskResponse(BaseModel):
    message: str
    role: str
    desk: HelpDeskResponse
