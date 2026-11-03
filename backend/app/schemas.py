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
    role: str
    members_count: int
    tickets_count: int
    sla_compliance_rate: float
    created_at: datetime.datetime
