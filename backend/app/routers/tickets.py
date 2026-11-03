import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    User, HelpDesk, HelpDeskMember, Category, Priority, Ticket, TicketComment
)
from app.schemas import (
    TicketCreate, TicketResponse, TicketDetailResponse,
    TicketStatusUpdate, TicketCommentCreate, TicketCommentResponse
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
    return desk, member

def map_ticket_response(ticket: Ticket, db: Session) -> TicketResponse:
    requester = db.query(User).filter(User.id == ticket.requester_id).first()
    assignee = db.query(User).filter(User.id == ticket.assignee_id).first() if ticket.assignee_id else None
    category = db.query(Category).filter(Category.id == ticket.category_id).first() if ticket.category_id else None
    priority = db.query(Priority).filter(Priority.id == ticket.priority_id).first() if ticket.priority_id else None
    comments_count = db.query(TicketComment).filter(TicketComment.ticket_id == ticket.id).count()

    sla_hours = priority.sla_resolution_hours if priority else 24
    sla_due = ticket.created_at + datetime.timedelta(hours=sla_hours)

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
        priority_name=priority.name if priority else "Media",
        priority_level=priority.level if priority else 2,
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

    # Validate priority if passed
    prio_id = payload.priority_id
    if prio_id:
        prio = db.query(Priority).filter(Priority.id == prio_id, Priority.help_desk_id == desk.id).first()
        if not prio:
            prio_id = None
    if not prio_id:
        default_prio = db.query(Priority).filter(Priority.help_desk_id == desk.id).order_by(Priority.level.asc()).first()
        prio_id = default_prio.id if default_prio else None

    # Generate sequential unique ticket code
    total_tickets = db.query(Ticket).filter(Ticket.help_desk_id == desk.id).count()
    ticket_code = f"CASE-{desk.id * 100 + total_tickets + 1}"

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

@router.get("", response_model=List[TicketResponse])
def list_tickets(
    slug: str,
    status_filter: Optional[str] = Query(None, alias="status"),
    category_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    query = db.query(Ticket).filter(Ticket.help_desk_id == desk.id)

    if status_filter and status_filter != "all":
        query = query.filter(Ticket.status == status_filter)
    if category_id:
        query = query.filter(Ticket.category_id == category_id)

    # Order newest first
    tickets = query.order_by(Ticket.created_at.desc()).all()
    return [map_ticket_response(t, db) for t in tickets]

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

    base_resp = map_ticket_response(ticket, db)

    # Fetch comments
    raw_comments = db.query(TicketComment).filter(
        TicketComment.ticket_id == ticket.id
    ).order_by(TicketComment.created_at.asc()).all()

    comments = []
    for c in raw_comments:
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

    old_status = ticket.status
    ticket.status = payload.status

    if payload.status in ["resolved", "closed"] and not ticket.resolved_at:
        ticket.resolved_at = datetime.datetime.utcnow()
    elif payload.status not in ["resolved", "closed"]:
        ticket.resolved_at = None

    # If diagnostic note provided, record as internal resolution comment
    if payload.diagnostic:
        diag_comment = TicketComment(
            ticket_id=ticket.id,
            user_id=current_user.id,
            message=f"**Diagnóstico de Resolución:** {payload.diagnostic}",
            is_internal=False,
            created_at=datetime.datetime.utcnow()
        )
        db.add(diag_comment)

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

    comment = TicketComment(
        ticket_id=ticket.id,
        user_id=current_user.id,
        message=payload.message,
        is_internal=payload.is_internal,
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
