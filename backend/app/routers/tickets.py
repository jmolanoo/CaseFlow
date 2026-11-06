import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    User, HelpDesk, HelpDeskMember, Category, Priority, Ticket, TicketComment, HelpDeskContext,
    UserAICredential
)
from app.schemas import (
    TicketCreate, TicketResponse, TicketDetailResponse,
    TicketStatusUpdate, TicketCommentCreate, TicketCommentResponse,
    TicketAssignRequest, TicketPriorityUpdate
)
from app.auth import get_current_user

router = APIRouter(prefix="/desks/{slug}/tickets", tags=["Tickets & Casos de Soporte"])

def get_membership(slug: str, user_id: int, db: Session):
    desk = db.query(HelpDesk).filter(HelpDesk.slug == slug).first()
    if not desk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mesa de ayuda '{slug}' no encontrada"
        )
    member = db.query(HelpDeskMember).filter(
        HelpDeskMember.help_desk_id == desk.id,
        HelpDeskMember.user_id == user_id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No perteneces a esta mesa de ayuda"
        )
    if not member.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta en esta mesa de ayuda ha sido desactivada por el administrador."
        )
    return desk, member

def map_ticket_response(ticket: Ticket, db: Session) -> TicketResponse:
    requester = db.query(User).filter(User.id == ticket.requester_id).first()
    assignee = db.query(User).filter(User.id == ticket.assignee_id).first() if ticket.assignee_id else None
    category = db.query(Category).filter(Category.id == ticket.category_id).first() if ticket.category_id else None
    priority = db.query(Priority).filter(Priority.id == ticket.priority_id).first() if ticket.priority_id else None
    comments_count = db.query(TicketComment).filter(TicketComment.ticket_id == ticket.id).count()

    sla_hours = priority.sla_resolution_hours if priority else 24
    sla_due = (ticket.created_at + datetime.timedelta(hours=sla_hours)) if priority else None

    return TicketResponse(
        id=ticket.id,
        help_desk_id=ticket.help_desk_id,
        ticket_code=ticket.ticket_code,
        title=ticket.title,
        description=ticket.description,
        status=ticket.status,
        category_id=category.id if category else None,
        category_name=category.name if category else "General",
        priority_id=priority.id if priority else None,
        priority_name=priority.name if priority else "Sin prioridad asignada",
        priority_level=priority.level if priority else None,
        requester_id=ticket.requester_id,
        requester_name=requester.full_name if requester else "Usuario",
        assignee_id=assignee.id if assignee else None,
        assignee_name=assignee.full_name if assignee else None,
        created_at=ticket.created_at,
        resolved_at=ticket.resolved_at,
        sla_resolution_hours=sla_hours,
        sla_due_at=sla_due,
        comments_count=comments_count
    )

@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    slug: str,
    payload: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)

    # Validate category if passed
    cat_id = payload.category_id
    if cat_id:
        cat = db.query(Category).filter(Category.id == cat_id, Category.help_desk_id == desk.id).first()
        if not cat:
            cat_id = None
    if not cat_id:
        default_cat = db.query(Category).filter(Category.help_desk_id == desk.id).first()
        cat_id = default_cat.id if default_cat else None

    # Priority logic:
    prio_id = None
    if payload.priority_id:
        prio = db.query(Priority).filter(Priority.id == payload.priority_id, Priority.help_desk_id == desk.id).first()
        if prio:
            prio_id = prio.id
    else:
        # Check if desk has active AI assistance
        cred = db.query(UserAICredential).filter(
            UserAICredential.help_desk_id == desk.id,
            UserAICredential.is_active == True
        ).first()

        if desk.is_ai_enabled and cred:
            # AI estimates priority from title and description
            priors = db.query(Priority).filter(Priority.help_desk_id == desk.id).order_by(Priority.level.desc()).all()
            text_combined = f"{payload.title} {payload.description}".lower()
            crit_keywords = ["crítico", "critico", "urgente", "bloqueo", "caído", "caido", "emergencia", "producción", "produccion", "grave", "severo", "parada", "fatal"]
            high_keywords = ["error", "falla", "imposible", "inconveniente", "rápido", "rapido", "problema", "afectado", "pago", "transacción"]

            if any(k in text_combined for k in crit_keywords) and priors:
                chosen = priors[0]
            elif any(k in text_combined for k in high_keywords) and len(priors) > 1:
                chosen = priors[1]
            elif priors:
                chosen = priors[len(priors) // 2]
            else:
                chosen = None

            prio_id = chosen.id if chosen else None
        else:
            # Desk operates manually without active AI: no priority assigned at creation
            prio_id = None

    # Generate sequential unique ticket code
    count = db.query(Ticket).filter(Ticket.help_desk_id == desk.id).count() + 1
    ticket_code = f"CASE-{count:03d}"

    ticket = Ticket(
        help_desk_id=desk.id,
        requester_id=current_user.id,
        category_id=cat_id,
        priority_id=prio_id,
        ticket_code=ticket_code,
        title=payload.title,
        description=payload.description,
        status="open",
        created_at=datetime.datetime.utcnow()
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return map_ticket_response(ticket, db)

@router.patch("/{ticket_code}/priority", response_model=TicketResponse)
def update_ticket_priority(
    slug: str,
    ticket_code: str,
    payload: TicketPriorityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    if member.role not in ["admin", "agent"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el personal de soporte o administradores pueden asignar o modificar la prioridad"
        )
    ticket = db.query(Ticket).filter(
        Ticket.help_desk_id == desk.id,
        Ticket.ticket_code == ticket_code
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    prio = db.query(Priority).filter(
        Priority.id == payload.priority_id,
        Priority.help_desk_id == desk.id
    ).first()
    if not prio:
        raise HTTPException(status_code=404, detail="Nivel de prioridad no válido para esta mesa de ayuda")

    ticket.priority_id = prio.id
    comment = TicketComment(
        ticket_id=ticket.id,
        user_id=current_user.id,
        message=f"**Triaje de Caso:** Prioridad asignada a '{prio.name}' (Nivel {prio.level}, SLA {prio.sla_resolution_hours}h).",
        is_internal=True,
        created_at=datetime.datetime.utcnow()
    )
    db.add(comment)
    db.commit()
    db.refresh(ticket)
    return map_ticket_response(ticket, db)

@router.get("", response_model=List[TicketResponse])
def list_tickets(
    slug: str,
    status_filter: Optional[str] = Query(None, alias="status"),
    category_id: Optional[int] = Query(None),
    priority_id: Optional[int] = Query(None),
    sla_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    query = db.query(Ticket).filter(Ticket.help_desk_id == desk.id)

    # Role-based restriction: Requesters ONLY see their own tickets
    if member.role == "requester":
        query = query.filter(Ticket.requester_id == current_user.id)

    if status_filter and status_filter != "all":
        query = query.filter(Ticket.status == status_filter)
    if category_id:
        query = query.filter(Ticket.category_id == category_id)
    if priority_id:
        query = query.filter(Ticket.priority_id == priority_id)

    # Order newest first
    tickets = query.order_by(Ticket.created_at.desc()).all()
    mapped = [map_ticket_response(t, db) for t in tickets]

    # Optional SLA filter
    if sla_filter and sla_filter != "all":
        now = datetime.datetime.utcnow()
        filtered = []
        for t in mapped:
            if t.status in ["resolved", "closed"]:
                if sla_filter == "on_time":
                    filtered.append(t)
                continue

            if t.sla_due_at:
                diff_sec = (t.sla_due_at - now).total_seconds()
                if sla_filter == "expired" and diff_sec < 0:
                    filtered.append(t)
                elif sla_filter == "at_risk" and 0 <= diff_sec <= 4 * 3600:
                    filtered.append(t)
                elif sla_filter == "on_time" and diff_sec > 4 * 3600:
                    filtered.append(t)
        return filtered

    return mapped

@router.get("/{ticket_code}", response_model=TicketDetailResponse)
def get_ticket_detail(
    slug: str,
    ticket_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    ticket = db.query(Ticket).filter(
        Ticket.help_desk_id == desk.id,
        Ticket.ticket_code == ticket_code
    ).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_code}' no encontrado"
        )

    # Role-based restriction: Requesters can only access their own tickets
    if member.role == "requester" and ticket.requester_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver los detalles de este caso"
        )

    base_resp = map_ticket_response(ticket, db)

    # Fetch comments
    raw_comments = db.query(TicketComment).filter(
        TicketComment.ticket_id == ticket.id
    ).order_by(TicketComment.created_at.asc()).all()

    comments = []
    for c in raw_comments:
        # Requesters CANNOT view internal notes!
        if member.role == "requester" and c.is_internal:
            continue

        c_user = db.query(User).filter(User.id == c.user_id).first()
        comments.append(TicketCommentResponse(
            id=c.id,
            ticket_id=c.ticket_id,
            user_id=c.user_id,
            user_name=c_user.full_name if c_user else "Usuario",
            message=c.message,
            is_internal=c.is_internal,
            created_at=c.created_at
        ))

    return TicketDetailResponse(
        **base_resp.model_dump(),
        comments=comments
    )

@router.patch("/{ticket_code}/status", response_model=TicketResponse)
def update_ticket_status(
    slug: str,
    ticket_code: str,
    payload: TicketStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    ticket = db.query(Ticket).filter(
        Ticket.help_desk_id == desk.id,
        Ticket.ticket_code == ticket_code
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    # Role check:
    # Requesters can only close their own tickets (confirm resolution)
    if member.role == "requester":
        if ticket.requester_id != current_user.id:
            raise HTTPException(status_code=403, detail="No puedes modificar el estado de un caso ajeno")
        if payload.status not in ["closed", "resolved"]:
            raise HTTPException(
                status_code=403,
                detail="Los solicitantes únicamente pueden dar por cerrado o conforme su propio caso"
            )
        # Requesters cannot inject diagnostic learning
        payload.diagnostic = None

    ticket.status = payload.status

    if payload.status in ["resolved", "closed"] and not ticket.resolved_at:
        ticket.resolved_at = datetime.datetime.utcnow()
    elif payload.status not in ["resolved", "closed"]:
        ticket.resolved_at = None

    # If diagnostic note provided, record as internal resolution comment
    # and dynamic learning in HelpDeskContext (Sprint 3 requirement)
    if payload.diagnostic and member.role in ["admin", "agent"]:
        diag_comment = TicketComment(
            ticket_id=ticket.id,
            user_id=current_user.id,
            message=f"**Diagnóstico de Resolución:** {payload.diagnostic}",
            is_internal=False,
            created_at=datetime.datetime.utcnow()
        )
        db.add(diag_comment)

        # Dynamic Learning Ingestion
        category = db.query(Category).filter(Category.id == ticket.category_id).first()
        ctx = db.query(HelpDeskContext).filter(HelpDeskContext.help_desk_id == desk.id).first()
        if not ctx:
            ctx = HelpDeskContext(
                help_desk_id=desk.id,
                content=f"# Memoria y Contexto: {desk.name}\n\nEspacio fundacional inicial.",
                version=1
            )
            db.add(ctx)

        learning_entry = (
            f"\n\n### ✦ Caso Resuelto [{ticket.ticket_code}]: {ticket.title}\n"
            f"- **Categoría:** {category.name if category else 'General'}\n"
            f"- **Fecha:** {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M')} UTC\n"
            f"- **Diagnóstico y Solución:** {payload.diagnostic.strip()}"
        )
        ctx.content += learning_entry
        ctx.version += 1
        ctx.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(ticket)
    return map_ticket_response(ticket, db)

@router.patch("/{ticket_code}/assign", response_model=TicketResponse)
def assign_ticket(
    slug: str,
    ticket_code: str,
    payload: TicketAssignRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    if member.role not in ["admin", "agent"]:
        raise HTTPException(
            status_code=403,
            detail="Solo los miembros del equipo de soporte o administradores pueden asignar o reasignar casos"
        )

    ticket = db.query(Ticket).filter(
        Ticket.help_desk_id == desk.id,
        Ticket.ticket_code == ticket_code
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    assignee = db.query(User).filter(User.id == payload.assignee_id).first()
    if not assignee:
        raise HTTPException(status_code=404, detail="Usuario asignado no encontrado")

    ticket.assignee_id = assignee.id
    comment = TicketComment(
        ticket_id=ticket.id,
        user_id=current_user.id,
        message=f"**Asignación de Caso:** Reasignado a {assignee.full_name}.",
        is_internal=True,
        created_at=datetime.datetime.utcnow()
    )
    db.add(comment)
    db.commit()
    db.refresh(ticket)
    return map_ticket_response(ticket, db)

@router.post("/{ticket_code}/comments", response_model=TicketCommentResponse, status_code=status.HTTP_201_CREATED)
def add_ticket_comment(
    slug: str,
    ticket_code: str,
    payload: TicketCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    ticket = db.query(Ticket).filter(
        Ticket.help_desk_id == desk.id,
        Ticket.ticket_code == ticket_code
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    # Role checks
    is_internal = payload.is_internal
    if member.role == "requester":
        if ticket.requester_id != current_user.id:
            raise HTTPException(status_code=403, detail="No puedes comentar en un caso ajeno")
        is_internal = False  # Requesters cannot make internal notes

    comment = TicketComment(
        ticket_id=ticket.id,
        user_id=current_user.id,
        message=payload.message,
        is_internal=is_internal,
        created_at=datetime.datetime.utcnow()
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return TicketCommentResponse(
        id=comment.id,
        ticket_id=comment.ticket_id,
        user_id=comment.user_id,
        user_name=current_user.full_name,
        message=comment.message,
        is_internal=comment.is_internal,
        created_at=comment.created_at
    )
