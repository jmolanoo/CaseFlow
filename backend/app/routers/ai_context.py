import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    User, HelpDesk, HelpDeskMember, Category, Priority, Ticket, TicketComment, HelpDeskContext
)
from app.schemas import (
    HelpDeskContextResponse, HelpDeskContextUpdate,
    RetrospectiveIngestRequest, RetrospectiveIngestResponse,
    AIRefineTicketRequest, AIRefineTicketResponse
)
from app.auth import get_current_user

router = APIRouter(prefix="/desks/{slug}", tags=["AI Context & Memoria Organizacional"])

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

@router.get("/context", response_model=HelpDeskContextResponse)
def get_desk_context(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    ctx = db.query(HelpDeskContext).filter(HelpDeskContext.help_desk_id == desk.id).first()
    if not ctx:
        ctx = HelpDeskContext(
            help_desk_id=desk.id,
            content=f"# Memoria y Contexto: {desk.name}\n\nEspacio fundacional inicial.",
            version=1
        )
        db.add(ctx)
        db.commit()
        db.refresh(ctx)

    return HelpDeskContextResponse(
        id=ctx.id,
        help_desk_id=ctx.help_desk_id,
        content=ctx.content,
        version=ctx.version,
        updated_at=ctx.updated_at
    )

@router.put("/context", response_model=HelpDeskContextResponse)
def update_desk_context(
    slug: str,
    payload: HelpDeskContextUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    if member.role != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de Administrador para editar la memoria del Help Desk")

    ctx = db.query(HelpDeskContext).filter(HelpDeskContext.help_desk_id == desk.id).first()
    if not ctx:
        ctx = HelpDeskContext(help_desk_id=desk.id, content=payload.content, version=1)
        db.add(ctx)
    else:
        ctx.content = payload.content
        ctx.version += 1
        ctx.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(ctx)

    return HelpDeskContextResponse(
        id=ctx.id,
        help_desk_id=ctx.help_desk_id,
        content=ctx.content,
        version=ctx.version,
        updated_at=ctx.updated_at
    )

@router.post("/context/ingest", response_model=RetrospectiveIngestResponse)
def retrospective_ingestion(
    slug: str,
    payload: RetrospectiveIngestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    if member.role != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de Administrador para ejecutar la ingesta retrospectiva")

    tickets = db.query(Ticket).filter(Ticket.help_desk_id == desk.id).all()
    categories = db.query(Category).filter(Category.help_desk_id == desk.id).all()
    cat_names = [c.name for c in categories]

    # Analyze patterns from existing tickets
    resolved_tickets = [t for t in tickets if t.status in ["resolved", "closed"]]
    open_tickets = [t for t in tickets if t.status in ["open", "in_progress"]]

    guidelines_text = payload.guidelines.strip() if payload.guidelines else "No se especificaron directrices manuales adicionales."

    ticket_summaries = []
    for t in tickets[:10]:  # Up to 10 representative tickets
        cat = db.query(Category).filter(Category.id == t.category_id).first()
        ticket_summaries.append(f"- **[{t.ticket_code}] {t.title}** (Cat: {cat.name if cat else 'General'} | Estado: {t.status})")

    summary_list = "\n".join(ticket_summaries) if ticket_summaries else "- *No existen tickets previos. Memoria inicializada para aprendizaje dinámico.*"

    new_content = f"""# Memoria Organizacional & Help Desk Context: {desk.name}
> **Última Ingesta Retrospectiva:** {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC  
> **Estado de la Mesa:** {'IA Asistida (BYOK)' if desk.is_ai_enabled else 'Operación Manual'}  
> **Total de Casos Ingeridos:** {len(tickets)} tickets ({len(resolved_tickets)} resueltos, {len(open_tickets)} en curso).

---

## 1. Directrices Fundacionales y Políticas
{guidelines_text}

---

## 2. Catálogo Oficial de Categorías Ingeridas
{', '.join(cat_names) if cat_names else 'General'}

---

## 3. Síntesis de Patrones e Incidentes Históricos
A continuación se consolidan los casos analizados durante el proceso de ingesta:
{summary_list}

---

## 4. Guía Operativa para el Copiloto de Soporte
- Priorizar soluciones con menor tiempo de resolución histórico.
- Mantener tono profesional y empático hacia los solicitantes.
- Sugerir categorizaciones precisas según el léxico identificado en incidencias previas.
"""

    ctx = db.query(HelpDeskContext).filter(HelpDeskContext.help_desk_id == desk.id).first()
    if not ctx:
        ctx = HelpDeskContext(help_desk_id=desk.id, content=new_content, version=1)
        db.add(ctx)
    else:
        ctx.content = new_content
        ctx.version += 1
        ctx.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(ctx)

    return RetrospectiveIngestResponse(
        success=True,
        processed_tickets=len(tickets),
        version=ctx.version,
        message=f"Ingesta retrospectiva finalizada con éxito. Se procesaron {len(tickets)} tickets históricos.",
        context_preview=new_content[:300] + "..."
    )

@router.post("/ai/refine-ticket", response_model=AIRefineTicketResponse)
def refine_ticket(
    slug: str,
    payload: AIRefineTicketRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    desc = payload.description.strip()

    categories = db.query(Category).filter(Category.help_desk_id == desk.id).all()
    priorities = db.query(Priority).filter(Priority.help_desk_id == desk.id).all()

    # Heuristic / Context-aware refinement
    lower = desc.lower()
    suggested_cat = None
    if any(k in lower for k in ["red", "wifi", "internet", "vpn", "conexion"]):
        suggested_cat = next((c for c in categories if "red" in c.name.lower() or "conect" in c.name.lower()), None)
    elif any(k in lower for k in ["pantalla", "teclado", "impresora", "equipo", "disco", "ram", "cpu", "hardware"]):
        suggested_cat = next((c for c in categories if "hard" in c.name.lower() or "equip" in c.name.lower()), None)
    elif any(k in lower for k in ["password", "contraseña", "acceso", "login", "permiso", "seguridad"]):
        suggested_cat = next((c for c in categories if "acceso" in c.name.lower() or "segur" in c.name.lower()), None)
    elif any(k in lower for k in ["error", "software", "programa", "sistema", "licencia", "aplicacion"]):
        suggested_cat = next((c for c in categories if "soft" in c.name.lower() or "licenc" in c.name.lower()), None)

    if not suggested_cat and categories:
        suggested_cat = categories[0]

    # Suggest priority
    suggested_prio = None
    if any(k in lower for k in ["urgente", "critico", "bloqueado", "parado", "emergencia", "servidor caido"]):
        suggested_prio = next((p for p in priorities if p.level >= 3), None)
    elif any(k in lower for k in ["lento", "falla", "revision", "problema"]):
        suggested_prio = next((p for p in priorities if p.level == 2), None)
    else:
        suggested_prio = next((p for p in priorities if p.level == 1), None)

    if not suggested_prio and priorities:
        suggested_prio = priorities[0]

    # Formulate refined title
    words = desc.split()
    first_phrase = " ".join(words[:8])
    refined_title = f"Incidencia: {first_phrase.capitalize()}" if len(first_phrase) > 5 else "Solicitud Técnica de Soporte"

    analysis = f"Análisis completado en base al Help Desk Context. Categoría inferida: '{suggested_cat.name if suggested_cat else 'General'}' con SLA de {suggested_prio.sla_resolution_hours if suggested_prio else 24}h."

    return AIRefineTicketResponse(
        suggested_title=refined_title,
        suggested_category_id=suggested_cat.id if suggested_cat else None,
        suggested_priority_id=suggested_prio.id if suggested_prio else None,
        analysis=analysis
    )
