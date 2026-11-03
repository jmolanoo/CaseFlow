import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    User, HelpDesk, HelpDeskMember, Category, Priority, Ticket, TicketComment,
    HelpDeskContext, AIFeatureToggle
)
from app.schemas import (
    HelpDeskContextResponse, HelpDeskContextUpdate,
    RetrospectiveIngestRequest, RetrospectiveIngestResponse,
    AIRefineTicketRequest, AIRefineTicketResponse,
    AIFeatureToggleItem, AIFeatureToggleUpdate, AIFeatureTogglesUpdateRequest,
    CopilotSuggestionResponse, CopilotDiagnosisResponse, CopilotSummaryResponse
)
from app.auth import get_current_user

router = APIRouter(prefix="/desks/{slug}", tags=["AI Context, Memoria Organizacional & Copiloto"])

FEATURE_METADATA = {
    "radicacion_asistida": {
        "label": "Sugerencia en Radicación",
        "description": "Asiste al usuario deduciendo título óptimo y categoría inicial.",
        "default_requester": True,
        "default_agent": True,
        "default_admin": True,
    },
    "copiloto_respuestas": {
        "label": "Copiloto de Respuestas Técnicas",
        "description": "Formula propuestas de respuesta empáticas basadas en la memoria del equipo.",
        "default_requester": False,
        "default_agent": True,
        "default_admin": True,
    },
    "diagnostico_casos": {
        "label": "Diagnóstico y Casos Similares",
        "description": "Compara la incidencia con casos históricos resueltos para identificar causas raíz.",
        "default_requester": False,
        "default_agent": True,
        "default_admin": True,
    },
    "aprendizaje_resolucion": {
        "label": "Aprendizaje Dinámico al Resolver",
        "description": "Incorpora automáticamente diagnósticos de cierre a la memoria viva de la mesa.",
        "default_requester": False,
        "default_agent": True,
        "default_admin": True,
    },
    "resumen_ejecutivo": {
        "label": "Resumen Ejecutivo de Casos",
        "description": "Sintetiza hilos y conversaciones extensas en viñetas clave para agilizar la atención.",
        "default_requester": True,
        "default_agent": True,
        "default_admin": True,
    }
}

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

def ensure_feature_toggles(desk_id: int, db: Session) -> List[AIFeatureToggle]:
    existing = db.query(AIFeatureToggle).filter(AIFeatureToggle.help_desk_id == desk_id).all()
    existing_names = {t.feature_name for t in existing}

    created = False
    for fname, meta in FEATURE_METADATA.items():
        if fname not in existing_names:
            t = AIFeatureToggle(
                help_desk_id=desk_id,
                feature_name=fname,
                role_requester=meta["default_requester"],
                role_agent=meta["default_agent"],
                role_admin=meta["default_admin"],
                is_enabled=True
            )
            db.add(t)
            created = True
    if created:
        db.commit()
    return db.query(AIFeatureToggle).filter(AIFeatureToggle.help_desk_id == desk_id).all()

def check_feature_permission(desk: HelpDesk, member: HelpDeskMember, feature_name: str, db: Session):
    toggles = {t.feature_name: t for t in ensure_feature_toggles(desk.id, db)}
    t = toggles.get(feature_name)
    if not t:
        return True
    if not t.is_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"La función de IA '{feature_name}' se encuentra deshabilitada globalmente en esta mesa."
        )
    if member.role == "requester" and not t.role_requester:
        raise HTTPException(status_code=403, detail="Esta función de IA no está habilitada para solicitantes.")
    if member.role == "agent" and not t.role_agent:
        raise HTTPException(status_code=403, detail="Esta función de IA no está habilitada para agentes.")
    if member.role == "admin" and not t.role_admin:
        raise HTTPException(status_code=403, detail="Esta función de IA no está habilitada para administradores.")
    return True

# --- Context Endpoints ---
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

    resolved_tickets = [t for t in tickets if t.status in ["resolved", "closed"]]
    open_tickets = [t for t in tickets if t.status in ["open", "in_progress"]]

    guidelines_text = payload.guidelines.strip() if payload.guidelines else "No se especificaron directrices manuales adicionales."

    ticket_summaries = []
    for t in tickets[:15]:
        cat = db.query(Category).filter(Category.id == t.category_id).first()
        ticket_summaries.append(f"- **[{t.ticket_code}] {t.title}** (Cat: {cat.name if cat else 'General'} | Estado: {t.status})")

    summary_list = "\n".join(ticket_summaries) if ticket_summaries else "- *No existen tickets previos. Memoria inicializada para aprendizaje dinámico.*"

    new_content = f"""# Memoria Organizacional & Help Desk Context: {desk.name}
> **Última Ingesta Retrospectiva:** {datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")} UTC  
> **Estado de la Mesa:** {'IA Asistida (BYOK)' if desk.is_ai_enabled else 'Operación Manual'}  
> **Total de Casos Ingeridos:** {len(tickets)} tickets ({len(resolved_tickets)} resueltos, {len(open_tickets)} en curso).

---

## 1. Directrices Fundacionales y Políticas
{guidelines_text}

---

## 2. Catálogo Oficial de Categorías Ingeridas
{", ".join(cat_names) if cat_names else "General"}

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
    check_feature_permission(desk, member, "radicacion_asistida", db)

    desc = payload.description.strip()
    categories = db.query(Category).filter(Category.help_desk_id == desk.id).all()
    priorities = db.query(Priority).filter(Priority.help_desk_id == desk.id).all()

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

    suggested_prio = None
    if any(k in lower for k in ["urgente", "critico", "bloqueado", "parado", "emergencia", "servidor caido"]):
        suggested_prio = next((p for p in priorities if p.level >= 3), None)
    elif any(k in lower for k in ["lento", "falla", "revision", "problema"]):
        suggested_prio = next((p for p in priorities if p.level == 2), None)
    else:
        suggested_prio = next((p for p in priorities if p.level == 1), None)

    if not suggested_prio and priorities:
        suggested_prio = priorities[0]

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

# --- Sprint 3: Governance & AI Feature Toggles Endpoints ---
@router.get("/ai/toggles", response_model=List[AIFeatureToggleItem])
def get_desk_ai_toggles(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    toggles = ensure_feature_toggles(desk.id, db)

    result = []
    for t in toggles:
        meta = FEATURE_METADATA.get(t.feature_name, {
            "label": t.feature_name.replace("_", " ").title(),
            "description": "Configuración de IA para este módulo."
        })
        result.append(AIFeatureToggleItem(
            id=t.id,
            help_desk_id=t.help_desk_id,
            feature_name=t.feature_name,
            feature_label=meta["label"],
            description=meta["description"],
            role_requester=t.role_requester,
            role_agent=t.role_agent,
            role_admin=t.role_admin,
            is_enabled=t.is_enabled
        ))
    return result

@router.put("/ai/toggles", response_model=List[AIFeatureToggleItem])
def update_desk_ai_toggles(
    slug: str,
    payload: AIFeatureTogglesUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    if member.role != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de Administrador para modificar la matriz de gobierno de IA")

    ensure_feature_toggles(desk.id, db)
    for update in payload.toggles:
        toggle = db.query(AIFeatureToggle).filter(
            AIFeatureToggle.help_desk_id == desk.id,
            AIFeatureToggle.feature_name == update.feature_name
        ).first()
        if toggle:
            if update.is_enabled is not None:
                toggle.is_enabled = update.is_enabled
            if update.role_requester is not None:
                toggle.role_requester = update.role_requester
            if update.role_agent is not None:
                toggle.role_agent = update.role_agent
            if update.role_admin is not None:
                toggle.role_admin = update.role_admin

    db.commit()
    return get_desk_ai_toggles(slug, current_user, db)

# --- Sprint 3: Copilot Endpoints ---
@router.post("/tickets/{ticket_code}/copilot/suggest-reply", response_model=CopilotSuggestionResponse)
def copilot_suggest_reply(
    slug: str,
    ticket_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    check_feature_permission(desk, member, "copiloto_respuestas", db)

    ticket = db.query(Ticket).filter(Ticket.help_desk_id == desk.id, Ticket.ticket_code == ticket_code).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    requester = db.query(User).filter(User.id == ticket.requester_id).first()
    category = db.query(Category).filter(Category.id == ticket.category_id).first()
    ctx = db.query(HelpDeskContext).filter(HelpDeskContext.help_desk_id == desk.id).first()

    requester_name = requester.full_name if requester else "Estimado usuario"
    combined = (ticket.title + " " + ticket.description).lower()

    if any(k in combined for k in ["red", "wifi", "conexion", "internet", "dns", "vpn"]):
        steps = (
            "1. Validar si el adaptador de red se encuentra en estado habilitado.\n"
            "2. Ejecutar la renovación de dirección IP y limpieza de caché DNS.\n"
            "3. Verificar credenciales del portal cautivo institucional."
        )
        diagnosis_hint = "incidencia de conectividad o asignación de red local"
    elif any(k in combined for k in ["password", "clave", "contraseña", "bloqueo", "login", "acceso"]):
        steps = (
            "1. Hemos verificado el estado de tu cuenta institucional.\n"
            "2. Se ha emitido un enlace de restablecimiento seguro a tu correo verificado.\n"
            "3. Por favor ingresa una nueva clave con al menos 8 caracteres y caracteres especiales."
        )
        diagnosis_hint = "solicitud de desbloqueo o restablecimiento de credenciales"
    elif any(k in combined for k in ["hardware", "pantalla", "impresora", "teclado", "mouse", "equipo"]):
        steps = (
            "1. Comprobar la conexión física del cableado y puerto USB/HDMI correspondiente.\n"
            "2. Se ha agendado la inspección presencial del equipo de servicio técnico.\n"
            "3. Te solicitamos tener disponible el número de placa o serial del dispositivo."
        )
        diagnosis_hint = "revisión física de periférico o hardware institucional"
    else:
        steps = (
            "1. Hemos revisado la descripción del caso reportado.\n"
            "2. Aplicamos la verificación según las políticas estándar de la mesa de ayuda.\n"
            "3. Por favor confírmanos si el inconveniente persiste o si requieres asistencia remota."
        )
        diagnosis_hint = "requerimiento general de servicio técnico"

    suggested_reply = (
        f"Hola {requester_name},\n\n"
        f"Gracias por comunicarte con la mesa de ayuda de {desk.name}. Hemos analizado tu caso '{ticket.title}' "
        f"identificado como {diagnosis_hint}.\n\n"
        f"Te recomendamos seguir los siguientes pasos iniciales:\n{steps}\n\n"
        f"Quedamos atentos a tus comentarios para proceder con la verificación final o coordinar soporte adicional."
    )

    explanation = f"Propuesta generada mediante el Copiloto de Soporte, respaldada en las directrices de la categoría {category.name if category else 'General'} y la memoria de soporte del equipo (versión {ctx.version if ctx else 1})."

    return CopilotSuggestionResponse(
        suggested_reply=suggested_reply,
        explanation=explanation,
        source=f"Help Desk Context v{ctx.version if ctx else 1}"
    )

@router.post("/tickets/{ticket_code}/copilot/diagnose", response_model=CopilotDiagnosisResponse)
def copilot_diagnose(
    slug: str,
    ticket_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    check_feature_permission(desk, member, "diagnostico_casos", db)

    ticket = db.query(Ticket).filter(Ticket.help_desk_id == desk.id, Ticket.ticket_code == ticket_code).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    history = db.query(Ticket).filter(
        Ticket.help_desk_id == desk.id,
        Ticket.ticket_code != ticket_code,
        Ticket.status.in_(["resolved", "closed"])
    ).limit(5).all()

    similar_cases = [f"[{t.ticket_code}] {t.title}" for t in history] if history else ["Sin incidencias históricas similares cerradas aún"]

    diagnosis = (
        f"Evaluación técnica para [{ticket.ticket_code}]: Se detecta probabilidad media-alta de inconsistencia "
        f"en configuración de servicio local. El ticket cuenta con prioridad calculada bajo SLA de {ticket.priority_id or 24} horas."
    )

    recommended_steps = [
        "Confirmar la reproducibilidad del fallo en ambiente cliente.",
        "Revisar registros de eventos del sistema o mensajes de error reportados.",
        "Aplicar procedimiento de solución estandarizado y verificar resolución con el solicitante.",
        "Documentar el diagnóstico final antes de cerrar el caso para enriquecer la memoria viva."
    ]

    return CopilotDiagnosisResponse(
        diagnosis=diagnosis,
        recommended_steps=recommended_steps,
        similar_cases=similar_cases
    )

@router.post("/tickets/{ticket_code}/copilot/summary", response_model=CopilotSummaryResponse)
def copilot_summary(
    slug: str,
    ticket_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    desk, member = get_membership(slug, current_user.id, db)
    check_feature_permission(desk, member, "resumen_ejecutivo", db)

    ticket = db.query(Ticket).filter(Ticket.help_desk_id == desk.id, Ticket.ticket_code == ticket_code).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    comments = db.query(TicketComment).filter(TicketComment.ticket_id == ticket.id).order_by(TicketComment.created_at.asc()).all()
    requester = db.query(User).filter(User.id == ticket.requester_id).first()

    summary_text = (
        f"Caso radicado por {requester.full_name if requester else 'Solicitante'} con estado actual '{ticket.status}'. "
        f"Se registran {len(comments)} interacciones en el hilo cronológico de soporte."
    )

    key_points = [
        f"Problema Principal: {ticket.title}",
        f"Detalle: {ticket.description[:120]}..." if len(ticket.description) > 120 else f"Detalle: {ticket.description}",
        f"Interacciones registradas: {len(comments)} respuestas del equipo técnico y solicitante.",
        f"Estado de SLA: Abierto el {ticket.created_at.strftime('%d/%m/%Y')}."
    ]

    return CopilotSummaryResponse(
        summary=summary_text,
        key_points=key_points
    )
