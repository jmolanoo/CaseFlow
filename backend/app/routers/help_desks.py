import datetime
import secrets
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    User, HelpDesk, HelpDeskMember, Category, Priority,
    HelpDeskContext, AIFeatureToggle, Ticket, HelpDeskInvitation
)
from app.schemas import (
    HelpDeskCreateWizard, HelpDeskResponse, HelpDeskListItem,
    CategoryResponse, PriorityResponse,
    HelpDeskMemberResponse, HelpDeskMemberUpdate,
    InvitationCreate, InvitationResponse, InvitationPreviewResponse,
    JoinDeskRequest, JoinDeskResponse
)
from app.auth import get_current_user

router = APIRouter(prefix="/desks", tags=["Help Desks (Mesas de Ayuda)"])

DEFAULT_CATEGORIES = [
    {"name": "Hardware & Equipos", "description": "Fallas físicas en estaciones de trabajo y periféricos", "color": "#f43f5e", "icon": "Cpu"},
    {"name": "Software & Licencias", "description": "Instalación, fallas y actualización de sistemas", "color": "#3b82f6", "icon": "Layers"},
    {"name": "Redes & Conectividad", "description": "Acceso a internet, VPN y servicios de red", "color": "#10b981", "icon": "Wifi"},
    {"name": "Accesos & Seguridad", "description": "Cuentas corporativas, permisos y contraseñas", "color": "#8b5cf6", "icon": "Shield"},
]

DEFAULT_PRIORITIES = [
    {"name": "Baja", "level": 1, "color": "#10b981", "sla_response_hours": 24, "sla_resolution_hours": 72},
    {"name": "Media", "level": 2, "color": "#3b82f6", "sla_response_hours": 8, "sla_resolution_hours": 24},
    {"name": "Alta", "level": 3, "color": "#f59e0b", "sla_response_hours": 4, "sla_resolution_hours": 12},
    {"name": "Crítica", "level": 4, "color": "#f43f5e", "sla_response_hours": 1, "sla_resolution_hours": 4},
]

def extract_code_from_input(raw: str) -> str:
    raw = raw.strip()
    if "/" in raw:
        raw = raw.split("/")[-1]
    if "?join=" in raw:
        raw = raw.split("?join=")[-1]
    if "&" in raw:
        raw = raw.split("&")[0]
    return raw.strip()

@router.get("", response_model=List[HelpDeskListItem])
def list_my_help_desks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    memberships = db.query(HelpDeskMember).filter(
        HelpDeskMember.user_id == current_user.id,
        HelpDeskMember.is_active == True
    ).all()
    results = []

    for m in memberships:
        desk = m.help_desk
        members_count = db.query(HelpDeskMember).filter(
            HelpDeskMember.help_desk_id == desk.id,
            HelpDeskMember.is_active == True
        ).count()
        tickets_count = db.query(Ticket).filter(Ticket.help_desk_id == desk.id).count()
        sla_rate = 98.5

        results.append(HelpDeskListItem(
            id=desk.id,
            name=desk.name,
            slug=desk.slug,
            description=desk.description,
            is_ai_enabled=desk.is_ai_enabled,
            role=m.role,
            members_count=members_count,
            tickets_count=tickets_count,
            sla_compliance_rate=sla_rate,
            created_at=desk.created_at
        ))

    return results

@router.post("/wizard", response_model=HelpDeskResponse, status_code=status.HTTP_201_CREATED)
def create_help_desk_wizard(
    data: HelpDeskCreateWizard,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(HelpDesk).filter(HelpDesk.slug == data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El identificador (slug) '{data.slug}' ya se encuentra en uso por otra mesa de ayuda."
        )

    desk = HelpDesk(
        name=data.name,
        slug=data.slug,
        description=data.description,
        owner_id=current_user.id,
        is_ai_enabled=data.enable_ai
    )
    db.add(desk)
    db.flush()

    # Creator is Admin
    member = HelpDeskMember(
        help_desk_id=desk.id,
        user_id=current_user.id,
        role="admin",
        is_active=True
    )
    db.add(member)

    # Categories
    cats_to_create = data.categories if data.categories else [CategoryResponse(**c, id=0, help_desk_id=0) for c in DEFAULT_CATEGORIES]
    for c in cats_to_create:
        cat_obj = Category(
            help_desk_id=desk.id,
            name=c.name,
            description=c.description,
            color=c.color,
            icon=c.icon
        )
        db.add(cat_obj)

    # Priorities
    priors_to_create = data.priorities if data.priorities else [PriorityResponse(**p, id=0, help_desk_id=0) for p in DEFAULT_PRIORITIES]
    for p in priors_to_create:
        prior_obj = Priority(
            help_desk_id=desk.id,
            name=p.name,
            level=p.level,
            color=p.color,
            sla_response_hours=p.sla_response_hours,
            sla_resolution_hours=p.sla_resolution_hours
        )
        db.add(prior_obj)

    # Context
    context = HelpDeskContext(
        help_desk_id=desk.id,
        content=f"# Memoria y Contexto Organizacional: {desk.name}\n\n"
                f"**Descripción:** {desk.description or 'Mesa de ayuda técnica general.'}\n\n"
                f"## Políticas de Soporte\n"
                f"- Tiempo de respuesta estándar según criticidad.\n"
                f"- Canales de atención habilitados.\n",
        version=1
    )
    db.add(context)

    # Standard Feature Toggles
    features = [
        "radicacion_asistida",
        "copiloto_respuestas",
        "diagnostico_casos",
        "aprendizaje_resolucion",
        "resumen_ejecutivo"
    ]
    for feat in features:
        toggle = AIFeatureToggle(
            help_desk_id=desk.id,
            feature_name=feat,
            role_requester=True,
            role_agent=True,
            role_admin=True,
            is_enabled=data.enable_ai
        )
        db.add(toggle)

    # Create default invitation link for users/employees
    default_invite = HelpDeskInvitation(
        help_desk_id=desk.id,
        code=f"inv_{secrets.token_hex(6)}",
        role="requester",
        label="Enlace General de Empleados / Usuarios",
        created_by_id=current_user.id,
        is_active=True
    )
    db.add(default_invite)

    db.commit()
    db.refresh(desk)

    cats = db.query(Category).filter(Category.help_desk_id == desk.id).all()
    priors = db.query(Priority).filter(Priority.help_desk_id == desk.id).all()

    return HelpDeskResponse(
        id=desk.id,
        name=desk.name,
        slug=desk.slug,
        description=desk.description,
        is_ai_enabled=desk.is_ai_enabled,
        created_at=desk.created_at,
        categories=[CategoryResponse.model_validate(c) for c in cats],
        priorities=[PriorityResponse.model_validate(p) for p in priors],
        user_role="admin"
    )

@router.get("/{slug}", response_model=HelpDeskResponse)
def get_help_desk(slug: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    desk = db.query(HelpDesk).filter(HelpDesk.slug == slug).first()
    if not desk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Help Desk '{slug}' no encontrado"
        )

    member = db.query(HelpDeskMember).filter(
        HelpDeskMember.help_desk_id == desk.id,
        HelpDeskMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a esta mesa de ayuda"
        )

    if not member.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta en esta mesa de ayuda ha sido desactivada por el administrador."
        )

    cats = db.query(Category).filter(Category.help_desk_id == desk.id).all()
    priors = db.query(Priority).filter(Priority.help_desk_id == desk.id).all()

    return HelpDeskResponse(
        id=desk.id,
        name=desk.name,
        slug=desk.slug,
        description=desk.description,
        is_ai_enabled=desk.is_ai_enabled,
        created_at=desk.created_at,
        categories=[CategoryResponse.model_validate(c) for c in cats],
        priorities=[PriorityResponse.model_validate(p) for p in priors],
        user_role=member.role
    )

@router.patch("/{slug}/ai-toggle", response_model=HelpDeskResponse)
def toggle_ai(slug: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    desk = db.query(HelpDesk).filter(HelpDesk.slug == slug).first()
    if not desk:
        raise HTTPException(status_code=404, detail="Help Desk no encontrado")

    member = db.query(HelpDeskMember).filter(
        HelpDeskMember.help_desk_id == desk.id,
        HelpDeskMember.user_id == current_user.id,
        HelpDeskMember.is_active == True
    ).first()

    if not member or member.role != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de Administrador activo para alternar la IA")

    desk.is_ai_enabled = not desk.is_ai_enabled
    db.commit()
    db.refresh(desk)

    cats = db.query(Category).filter(Category.help_desk_id == desk.id).all()
    priors = db.query(Priority).filter(Priority.help_desk_id == desk.id).all()

    return HelpDeskResponse(
        id=desk.id,
        name=desk.name,
        slug=desk.slug,
        description=desk.description,
        is_ai_enabled=desk.is_ai_enabled,
        created_at=desk.created_at,
        categories=[CategoryResponse.model_validate(c) for c in cats],
        priorities=[PriorityResponse.model_validate(p) for p in priors],
        user_role=member.role
    )

# --- Sprint 4: Member Management Endpoints ---

@router.get("/{slug}/members", response_model=List[HelpDeskMemberResponse])
def list_help_desk_members(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk = db.query(HelpDesk).filter(HelpDesk.slug == slug).first()
    if not desk:
        raise HTTPException(status_code=404, detail="Mesa de ayuda no encontrada")

    caller = db.query(HelpDeskMember).filter(
        HelpDeskMember.help_desk_id == desk.id,
        HelpDeskMember.user_id == current_user.id,
        HelpDeskMember.is_active == True
    ).first()
    if not caller:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta mesa de ayuda")

    members = db.query(HelpDeskMember).filter(HelpDeskMember.help_desk_id == desk.id).all()
    res = []
    for m in members:
        u = m.user
        res.append(HelpDeskMemberResponse(
            id=m.id,
            user_id=u.id,
            email=u.email,
            full_name=u.full_name,
            role=m.role,
            is_active=m.is_active,
            created_at=m.created_at
        ))
    return res

@router.patch("/{slug}/members/{user_id}", response_model=HelpDeskMemberResponse)
def update_help_desk_member(
    slug: str,
    user_id: int,
    payload: HelpDeskMemberUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk = db.query(HelpDesk).filter(HelpDesk.slug == slug).first()
    if not desk:
        raise HTTPException(status_code=404, detail="Mesa de ayuda no encontrada")

    caller = db.query(HelpDeskMember).filter(
        HelpDeskMember.help_desk_id == desk.id,
        HelpDeskMember.user_id == current_user.id,
        HelpDeskMember.is_active == True
    ).first()
    if not caller or caller.role != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de Administrador para gestionar usuarios")

    target_member = db.query(HelpDeskMember).filter(
        HelpDeskMember.help_desk_id == desk.id,
        HelpDeskMember.user_id == user_id
    ).first()
    if not target_member:
        raise HTTPException(status_code=404, detail="El usuario no pertenece a esta mesa de ayuda")

    # Protection for Help Desk owner
    if desk.owner_id == target_member.user_id:
        if payload.role and payload.role != "admin":
            raise HTTPException(status_code=400, detail="No se puede degradar el rol del Propietario de la mesa de ayuda")
        if payload.is_active is False:
            raise HTTPException(status_code=400, detail="No se puede desactivar al Propietario de la mesa de ayuda")

    # Check that at least one active admin remains
    if target_member.role == "admin" and (payload.is_active is False or (payload.role and payload.role != "admin")):
        active_admins_count = db.query(HelpDeskMember).filter(
            HelpDeskMember.help_desk_id == desk.id,
            HelpDeskMember.role == "admin",
            HelpDeskMember.is_active == True
        ).count()
        if active_admins_count <= 1:
            raise HTTPException(status_code=400, detail="No se puede desactivar ni degradar al único administrador activo de la mesa")

    if payload.role is not None:
        target_member.role = payload.role
    if payload.is_active is not None:
        target_member.is_active = payload.is_active

    db.commit()
    db.refresh(target_member)

    u = target_member.user
    return HelpDeskMemberResponse(
        id=target_member.id,
        user_id=u.id,
        email=u.email,
        full_name=u.full_name,
        role=target_member.role,
        is_active=target_member.is_active,
        created_at=target_member.created_at
    )

@router.delete("/{slug}/members/{user_id}")
def remove_help_desk_member(
    slug: str,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk = db.query(HelpDesk).filter(HelpDesk.slug == slug).first()
    if not desk:
        raise HTTPException(status_code=404, detail="Mesa de ayuda no encontrada")

    caller = db.query(HelpDeskMember).filter(
        HelpDeskMember.help_desk_id == desk.id,
        HelpDeskMember.user_id == current_user.id,
        HelpDeskMember.is_active == True
    ).first()
    if not caller or caller.role != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de Administrador para eliminar usuarios")

    target_member = db.query(HelpDeskMember).filter(
        HelpDeskMember.help_desk_id == desk.id,
        HelpDeskMember.user_id == user_id
    ).first()
    if not target_member:
        raise HTTPException(status_code=404, detail="El usuario no pertenece a esta mesa de ayuda")

    if desk.owner_id == target_member.user_id:
        raise HTTPException(status_code=400, detail="No se puede eliminar al Propietario de la mesa de ayuda")

    if target_member.role == "admin":
        active_admins_count = db.query(HelpDeskMember).filter(
            HelpDeskMember.help_desk_id == desk.id,
            HelpDeskMember.role == "admin",
            HelpDeskMember.is_active == True
        ).count()
        if active_admins_count <= 1:
            raise HTTPException(status_code=400, detail="No se puede eliminar al único administrador de la mesa")

    db.delete(target_member)
    db.commit()

    return {"message": "Usuario eliminado exitosamente de la mesa de ayuda"}

# --- Sprint 4: Custom Invitation Links Endpoints ---

@router.post("/{slug}/invitations", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
def create_invitation(
    slug: str,
    payload: InvitationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk = db.query(HelpDesk).filter(HelpDesk.slug == slug).first()
    if not desk:
        raise HTTPException(status_code=404, detail="Mesa de ayuda no encontrada")

    caller = db.query(HelpDeskMember).filter(
        HelpDeskMember.help_desk_id == desk.id,
        HelpDeskMember.user_id == current_user.id,
        HelpDeskMember.is_active == True
    ).first()
    if not caller or caller.role != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de Administrador para crear enlaces de invitación")

    code = f"inv_{secrets.token_hex(6)}"
    expires_at = None
    if payload.expires_days:
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=payload.expires_days)

    label = payload.label or f"Enlace para {payload.role.capitalize()}"

    inv = HelpDeskInvitation(
        help_desk_id=desk.id,
        code=code,
        role=payload.role,
        label=label,
        created_by_id=current_user.id,
        is_active=True,
        max_uses=payload.max_uses,
        uses_count=0,
        expires_at=expires_at
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)

    return InvitationResponse(
        id=inv.id,
        help_desk_id=inv.help_desk_id,
        code=inv.code,
        role=inv.role,
        label=inv.label,
        is_active=inv.is_active,
        max_uses=inv.max_uses,
        uses_count=inv.uses_count,
        expires_at=inv.expires_at,
        created_at=inv.created_at,
        invite_url=f"/join/{inv.code}"
    )

@router.get("/{slug}/invitations", response_model=List[InvitationResponse])
def list_invitations(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk = db.query(HelpDesk).filter(HelpDesk.slug == slug).first()
    if not desk:
        raise HTTPException(status_code=404, detail="Mesa de ayuda no encontrada")

    caller = db.query(HelpDeskMember).filter(
        HelpDeskMember.help_desk_id == desk.id,
        HelpDeskMember.user_id == current_user.id,
        HelpDeskMember.is_active == True
    ).first()
    if not caller or caller.role != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de Administrador para listar enlaces de invitación")

    invitations = db.query(HelpDeskInvitation).filter(
        HelpDeskInvitation.help_desk_id == desk.id
    ).order_by(HelpDeskInvitation.created_at.desc()).all()

    return [
        InvitationResponse(
            id=inv.id,
            help_desk_id=inv.help_desk_id,
            code=inv.code,
            role=inv.role,
            label=inv.label,
            is_active=inv.is_active,
            max_uses=inv.max_uses,
            uses_count=inv.uses_count,
            expires_at=inv.expires_at,
            created_at=inv.created_at,
            invite_url=f"/join/{inv.code}"
        ) for inv in invitations
    ]

@router.patch("/{slug}/invitations/{invitation_id}/toggle", response_model=InvitationResponse)
def toggle_invitation(
    slug: str,
    invitation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk = db.query(HelpDesk).filter(HelpDesk.slug == slug).first()
    if not desk:
        raise HTTPException(status_code=404, detail="Mesa de ayuda no encontrada")

    caller = db.query(HelpDeskMember).filter(
        HelpDeskMember.help_desk_id == desk.id,
        HelpDeskMember.user_id == current_user.id,
        HelpDeskMember.is_active == True
    ).first()
    if not caller or caller.role != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de Administrador")

    inv = db.query(HelpDeskInvitation).filter(
        HelpDeskInvitation.id == invitation_id,
        HelpDeskInvitation.help_desk_id == desk.id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Enlace de invitación no encontrado")

    inv.is_active = not inv.is_active
    db.commit()
    db.refresh(inv)

    return InvitationResponse(
        id=inv.id,
        help_desk_id=inv.help_desk_id,
        code=inv.code,
        role=inv.role,
        label=inv.label,
        is_active=inv.is_active,
        max_uses=inv.max_uses,
        uses_count=inv.uses_count,
        expires_at=inv.expires_at,
        created_at=inv.created_at,
        invite_url=f"/join/{inv.code}"
    )

@router.delete("/{slug}/invitations/{invitation_id}")
def delete_invitation(
    slug: str,
    invitation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk = db.query(HelpDesk).filter(HelpDesk.slug == slug).first()
    if not desk:
        raise HTTPException(status_code=404, detail="Mesa de ayuda no encontrada")

    caller = db.query(HelpDeskMember).filter(
        HelpDeskMember.help_desk_id == desk.id,
        HelpDeskMember.user_id == current_user.id,
        HelpDeskMember.is_active == True
    ).first()
    if not caller or caller.role != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de Administrador")

    inv = db.query(HelpDeskInvitation).filter(
        HelpDeskInvitation.id == invitation_id,
        HelpDeskInvitation.help_desk_id == desk.id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Enlace de invitación no encontrado")

    db.delete(inv)
    db.commit()

    return {"message": "Enlace de invitación eliminado exitosamente"}

# --- Sprint 4: Join Help Desk by Invitation ---

@router.get("/invitations/preview/{code}", response_model=InvitationPreviewResponse)
def preview_invitation(code: str, db: Session = Depends(get_db)):
    clean_code = extract_code_from_input(code)
    inv = db.query(HelpDeskInvitation).filter(HelpDeskInvitation.code == clean_code).first()
    if not inv:
        raise HTTPException(status_code=404, detail="El enlace o código de invitación no existe")

    if not inv.is_active:
        return InvitationPreviewResponse(
            valid=False,
            code=clean_code,
            help_desk_name=inv.help_desk.name,
            help_desk_slug=inv.help_desk.slug,
            role=inv.role,
            label=inv.label,
            message="Este enlace de invitación ha sido desactivado por la organización"
        )

    if inv.expires_at and datetime.datetime.utcnow() > inv.expires_at:
        return InvitationPreviewResponse(
            valid=False,
            code=clean_code,
            help_desk_name=inv.help_desk.name,
            help_desk_slug=inv.help_desk.slug,
            role=inv.role,
            label=inv.label,
            message="Este enlace de invitación ha expirado"
        )

    if inv.max_uses and inv.uses_count >= inv.max_uses:
        return InvitationPreviewResponse(
            valid=False,
            code=clean_code,
            help_desk_name=inv.help_desk.name,
            help_desk_slug=inv.help_desk.slug,
            role=inv.role,
            label=inv.label,
            message="Este enlace de invitación alcanzó el límite máximo de usos permitido"
        )

    return InvitationPreviewResponse(
        valid=True,
        code=clean_code,
        help_desk_name=inv.help_desk.name,
        help_desk_slug=inv.help_desk.slug,
        role=inv.role,
        label=inv.label,
        message=f"Invitación válida para unirse como {inv.role.capitalize()}"
    )

@router.post("/join", response_model=JoinDeskResponse)
def join_help_desk(
    payload: JoinDeskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    code = extract_code_from_input(payload.code)
    inv = db.query(HelpDeskInvitation).filter(HelpDeskInvitation.code == code).first()
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El código o enlace de invitación no es válido"
        )

    if not inv.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este enlace de invitación ha sido desactivado por el administrador"
        )

    if inv.expires_at and datetime.datetime.utcnow() > inv.expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El enlace de invitación ha expirado"
        )

    if inv.max_uses and inv.uses_count >= inv.max_uses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este enlace de invitación ha alcanzado su límite máximo de usos"
        )

    desk = inv.help_desk

    # Check if already a member
    member = db.query(HelpDeskMember).filter(
        HelpDeskMember.help_desk_id == desk.id,
        HelpDeskMember.user_id == current_user.id
    ).first()

    cats = db.query(Category).filter(Category.help_desk_id == desk.id).all()
    priors = db.query(Priority).filter(Priority.help_desk_id == desk.id).all()

    if member:
        if not member.is_active:
            # Reactivate member with new role
            member.is_active = True
            member.role = inv.role
            inv.uses_count += 1
            db.commit()
            msg = f"Tu cuenta en '{desk.name}' ha sido reactivada con rol de {inv.role.capitalize()}."
        else:
            msg = f"Ya eres miembro activo de '{desk.name}' con rol de {member.role.capitalize()}."
        desk_resp = HelpDeskResponse(
            id=desk.id,
            name=desk.name,
            slug=desk.slug,
            description=desk.description,
            is_ai_enabled=desk.is_ai_enabled,
            created_at=desk.created_at,
            categories=[CategoryResponse.model_validate(c) for c in cats],
            priorities=[PriorityResponse.model_validate(p) for p in priors],
            user_role=member.role
        )
        return JoinDeskResponse(message=msg, role=member.role, desk=desk_resp)

    # Add new member
    new_member = HelpDeskMember(
        help_desk_id=desk.id,
        user_id=current_user.id,
        role=inv.role,
        is_active=True
    )
    db.add(new_member)
    inv.uses_count += 1
    db.commit()

    desk_resp = HelpDeskResponse(
        id=desk.id,
        name=desk.name,
        slug=desk.slug,
        description=desk.description,
        is_ai_enabled=desk.is_ai_enabled,
        created_at=desk.created_at,
        categories=[CategoryResponse.model_validate(c) for c in cats],
        priorities=[PriorityResponse.model_validate(p) for p in priors],
        user_role=inv.role
    )

    role_label = "Soporte (Agente)" if inv.role == "agent" else ("Administrador" if inv.role == "admin" else "Usuario / Empleado")
    return JoinDeskResponse(
        message=f"¡Te has unido exitosamente a '{desk.name}' como {role_label}!",
        role=inv.role,
        desk=desk_resp
    )
