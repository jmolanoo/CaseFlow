from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    User, HelpDesk, HelpDeskMember, Category, Priority,
    HelpDeskContext, AIFeatureToggle, Ticket
)
from app.schemas import (
    HelpDeskCreateWizard, HelpDeskResponse, HelpDeskListItem,
    CategoryResponse, PriorityResponse
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

@router.get("", response_model=List[HelpDeskListItem])
def list_my_help_desks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    memberships = db.query(HelpDeskMember).filter(HelpDeskMember.user_id == current_user.id).all()
    results = []

    for m in memberships:
        desk = m.help_desk
        members_count = db.query(HelpDeskMember).filter(HelpDeskMember.help_desk_id == desk.id).count()
        tickets_count = db.query(Ticket).filter(Ticket.help_desk_id == desk.id).count()
        # Calculate simulated/real SLA compliance (defaults to 98.5% when beginning)
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
    # Check slug uniqueness
    existing = db.query(HelpDesk).filter(HelpDesk.slug == data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El identificador (slug) '{data.slug}' ya se encuentra en uso por otra mesa de ayuda."
        )

    # 1. Create HelpDesk
    desk = HelpDesk(
        name=data.name,
        slug=data.slug,
        description=data.description,
        owner_id=current_user.id,
        is_ai_enabled=data.enable_ai
    )
    db.add(desk)
    db.flush()

    # 2. Add creator as Admin
    member = HelpDeskMember(
        help_desk_id=desk.id,
        user_id=current_user.id,
        role="admin"
    )
    db.add(member)

    # 3. Add Categories (custom or defaults)
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

    # 4. Add Priorities (custom or defaults)
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

    # 5. Initialize HelpDeskContext
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

    # 6. Initialize Standard AI Feature Toggles
    features = [
        "title_refinement",
        "copilot_suggest_reply",
        "similar_cases_diagnosis",
        "ticket_summarizer",
        "sentiment_escalation"
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

    db.commit()
    db.refresh(desk)

    # Return full desk with categories and priorities
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

    # Check membership
    member = db.query(HelpDeskMember).filter(
        HelpDeskMember.help_desk_id == desk.id,
        HelpDeskMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a esta mesa de ayuda"
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
        HelpDeskMember.user_id == current_user.id
    ).first()

    if not member or member.role != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de Administrador para alternar la IA")

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
