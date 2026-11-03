import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    ai_credentials = relationship("UserAICredential", back_populates="user", cascade="all, delete-orphan")
    memberships = relationship("HelpDeskMember", back_populates="user", cascade="all, delete-orphan")
    owned_help_desks = relationship("HelpDesk", back_populates="owner")


class UserAICredential(Base):
    __tablename__ = "user_ai_credentials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    provider = Column(String(50), nullable=False)  # 'gemini', 'openai', 'claude'
    encrypted_api_key = Column(Text, nullable=False)
    model_name = Column(String(100), nullable=False)
    latency_ms = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="ai_credentials")


class HelpDesk(Base):
    __tablename__ = "help_desks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_ai_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="owned_help_desks")
    members = relationship("HelpDeskMember", back_populates="help_desk", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="help_desk", cascade="all, delete-orphan")
    priorities = relationship("Priority", back_populates="help_desk", cascade="all, delete-orphan")
    context = relationship("HelpDeskContext", back_populates="help_desk", uselist=False, cascade="all, delete-orphan")
    toggles = relationship("AIFeatureToggle", back_populates="help_desk", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="help_desk", cascade="all, delete-orphan")


class HelpDeskMember(Base):
    __tablename__ = "help_desk_members"

    id = Column(Integer, primary_key=True, index=True)
    help_desk_id = Column(Integer, ForeignKey("help_desks.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default="requester")  # 'admin', 'agent', 'requester'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    help_desk = relationship("HelpDesk", back_populates="members")
    user = relationship("User", back_populates="memberships")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    help_desk_id = Column(Integer, ForeignKey("help_desks.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    color = Column(String(50), default="#f43f5e")
    icon = Column(String(50), default="Folder")

    help_desk = relationship("HelpDesk", back_populates="categories")
    tickets = relationship("Ticket", back_populates="category")


class Priority(Base):
    __tablename__ = "priorities"

    id = Column(Integer, primary_key=True, index=True)
    help_desk_id = Column(Integer, ForeignKey("help_desks.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    level = Column(Integer, default=1)  # 1: Baja, 2: Media, 3: Alta, 4: Crítica
    color = Column(String(50), default="#f43f5e")
    sla_response_hours = Column(Integer, default=24)
    sla_resolution_hours = Column(Integer, default=72)

    help_desk = relationship("HelpDesk", back_populates="priorities")
    tickets = relationship("Ticket", back_populates="priority")


class HelpDeskContext(Base):
    __tablename__ = "help_desk_contexts"

    id = Column(Integer, primary_key=True, index=True)
    help_desk_id = Column(Integer, ForeignKey("help_desks.id", ondelete="CASCADE"), unique=True, nullable=False)
    content = Column(Text, nullable=False, default="# Help Desk Context\n\nMemoria inicial del espacio de soporte.")
    version = Column(Integer, default=1)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    help_desk = relationship("HelpDesk", back_populates="context")


class AIFeatureToggle(Base):
    __tablename__ = "ai_feature_toggles"

    id = Column(Integer, primary_key=True, index=True)
    help_desk_id = Column(Integer, ForeignKey("help_desks.id", ondelete="CASCADE"), nullable=False)
    feature_name = Column(String(100), nullable=False)
    role_requester = Column(Boolean, default=True)
    role_agent = Column(Boolean, default=True)
    role_admin = Column(Boolean, default=True)
    is_enabled = Column(Boolean, default=True)

    help_desk = relationship("HelpDesk", back_populates="toggles")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    help_desk_id = Column(Integer, ForeignKey("help_desks.id", ondelete="CASCADE"), nullable=False)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    priority_id = Column(Integer, ForeignKey("priorities.id"), nullable=True)
    ticket_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="open")  # 'open', 'in_progress', 'waiting', 'resolved', 'closed'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    help_desk = relationship("HelpDesk", back_populates="tickets")
    category = relationship("Category", back_populates="tickets")
    priority = relationship("Priority", back_populates="tickets")
    comments = relationship("TicketComment", back_populates="ticket", cascade="all, delete-orphan")


class TicketComment(Base):
    __tablename__ = "ticket_comments"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    ticket = relationship("Ticket", back_populates="comments")
