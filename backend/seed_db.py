import datetime
from app.database import SessionLocal, Base, engine
from app.models import (
    User, HelpDesk, HelpDeskMember, Category, Priority,
    Ticket, TicketComment, HelpDeskContext, AIFeatureToggle, HelpDeskInvitation
)
from app.auth import get_password_hash

def seed_database():
    db = SessionLocal()
    try:
        print("Cleaning previous data...")
        # Drop all tables and recreate them cleanly
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        print("Creating users...")
        pw_hash = get_password_hash("CaseFlow2026!")

        admin_user = User(
            email="admin@caseflow.co",
            full_name="Carlos Mendoza",
            hashed_password=pw_hash,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=15)
        )
        agent_user = User(
            email="soporte@caseflow.co",
            full_name="Valeria Ríos",
            hashed_password=pw_hash,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=14)
        )
        requester_user = User(
            email="usuario@caseflow.co",
            full_name="Santiago Torres",
            hashed_password=pw_hash,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=10)
        )

        db.add_all([admin_user, agent_user, requester_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(agent_user)
        db.refresh(requester_user)

        print(f"Users created: Admin (ID {admin_user.id}), Agent (ID {agent_user.id}), Requester (ID {requester_user.id})")

        print("Creating Help Desk...")
        desk = HelpDesk(
            name="Centro de Servicios Tecnológicos",
            slug="centro-de-servicios",
            description="Mesa de ayuda unificada para la gestión integral de incidentes tecnológicos, soporte a usuarios, ciberseguridad e infraestructura de TI.",
            owner_id=admin_user.id,
            is_ai_enabled=True,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=14)
        )
        db.add(desk)
        db.commit()
        db.refresh(desk)

        print("Adding members to Help Desk...")
        member_admin = HelpDeskMember(
            help_desk_id=desk.id,
            user_id=admin_user.id,
            role="admin",
            is_active=True,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=14)
        )
        member_agent = HelpDeskMember(
            help_desk_id=desk.id,
            user_id=agent_user.id,
            role="agent",
            is_active=True,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=14)
        )
        member_requester = HelpDeskMember(
            help_desk_id=desk.id,
            user_id=requester_user.id,
            role="requester",
            is_active=True,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=10)
        )
        db.add_all([member_admin, member_agent, member_requester])
        db.commit()

        print("Creating Categories...")
        cat_hw = Category(help_desk_id=desk.id, name="Hardware & Estaciones", description="Fallas físicas en portátiles, monitores y periféricos", color="#f43f5e", icon="Cpu")
        cat_sw = Category(help_desk_id=desk.id, name="Software & Licencias", description="Sistemas operativos, ofimática y suite de productividad", color="#3b82f6", icon="Layers")
        cat_net = Category(help_desk_id=desk.id, name="Redes & Conectividad", description="VPN corporativa, WiFi, switches y enlaces dedicados", color="#10b981", icon="Wifi")
        cat_sec = Category(help_desk_id=desk.id, name="Accesos & Ciberseguridad", description="Gestión de identidades, MFA, credenciales y permisos", color="#8b5cf6", icon="Shield")
        cat_cloud = Category(help_desk_id=desk.id, name="Infraestructura Cloud", description="Servidores virtuales, Docker, Kubernetes y bases de datos", color="#06b6d4", icon="Cloud")
        db.add_all([cat_hw, cat_sw, cat_net, cat_sec, cat_cloud])
        db.commit()
        db.refresh(cat_hw)
        db.refresh(cat_sw)
        db.refresh(cat_net)
        db.refresh(cat_sec)
        db.refresh(cat_cloud)

        print("Creating Priorities...")
        prio_baja = Priority(help_desk_id=desk.id, name="Baja", level=1, color="#10b981", sla_response_hours=24, sla_resolution_hours=72)
        prio_media = Priority(help_desk_id=desk.id, name="Media", level=2, color="#3b82f6", sla_response_hours=8, sla_resolution_hours=24)
        prio_alta = Priority(help_desk_id=desk.id, name="Alta", level=3, color="#f59e0b", sla_response_hours=4, sla_resolution_hours=12)
        prio_critica = Priority(help_desk_id=desk.id, name="Crítica", level=4, color="#f43f5e", sla_response_hours=1, sla_resolution_hours=4)
        db.add_all([prio_baja, prio_media, prio_alta, prio_critica])
        db.commit()
        db.refresh(prio_baja)
        db.refresh(prio_media)
        db.refresh(prio_alta)
        db.refresh(prio_critica)

        print("Creating Invitations...")
        inv_agent = HelpDeskInvitation(
            help_desk_id=desk.id,
            code="inv_soporte_2026",
            role="agent",
            label="Enlace Oficial para Especialistas de Soporte N2",
            created_by_id=admin_user.id,
            is_active=True,
            max_uses=20,
            uses_count=1,
            expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=30),
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=14)
        )
        inv_requester = HelpDeskInvitation(
            help_desk_id=desk.id,
            code="inv_solicitantes_2026",
            role="requester",
            label="Enlace de Auto-Registro para Empleados y Solicitantes",
            created_by_id=admin_user.id,
            is_active=True,
            max_uses=100,
            uses_count=1,
            expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=30),
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=10)
        )
        db.add_all([inv_agent, inv_requester])
        db.commit()

        print("Creating AI Feature Toggles...")
        toggles = [
            AIFeatureToggle(help_desk_id=desk.id, feature_name="radicacion_asistida", role_requester=True, role_agent=True, role_admin=True, is_enabled=True),
            AIFeatureToggle(help_desk_id=desk.id, feature_name="copiloto_respuestas", role_requester=False, role_agent=True, role_admin=True, is_enabled=True),
            AIFeatureToggle(help_desk_id=desk.id, feature_name="diagnostico_casos", role_requester=False, role_agent=True, role_admin=True, is_enabled=True),
            AIFeatureToggle(help_desk_id=desk.id, feature_name="aprendizaje_resolucion", role_requester=False, role_agent=True, role_admin=True, is_enabled=True),
            AIFeatureToggle(help_desk_id=desk.id, feature_name="resumen_ejecutivo", role_requester=True, role_agent=True, role_admin=True, is_enabled=True),
        ]
        db.add_all(toggles)
        db.commit()

        print("Creating HelpDeskContext (Memoria Organizacional)...")
        context_md = f"""# Memoria Organizacional & Contexto Operativo: {desk.name}
> **Estado Operativo:** Producción Activa  
> **Arquitectura:** Asistencia Inteligente BYOK Multi-Tenant  
> **Última Actualización:** {datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")} UTC  
> **Versión de Memoria:** 3

---

## 1. Directrices Fundacionales y Políticas de Atención
- Todo incidente con impacto sobre más de 10 usuarios o servicios de facturación/gateway se cataloga de prioridad **Crítica** (SLA 4 horas).
- Los diagnósticos de resolución deben documentar causa raíz y paso a paso exacto para alimentar el aprendizaje dinámico del copiloto.
- Se mantiene estricta privacidad de credenciales: ninguna contraseña o token debe quedar registrada en comentarios públicos o notas internas sin enmascarar.

---

## 2. Catálogo Oficial de Categorías y Especialistas
1. **Hardware & Estaciones:** Revisión física de conectores USB-C/HDMI, docking stations, laptops Lenovo ThinkPad y Dell Latitude.
2. **Software & Licencias:** Paquetería Windows 11 Enterprise, Docker Desktop corporativo, navegadores y certificados SSL.
3. **Redes & Conectividad:** Red WiFi corporativa (WPA3-Enterprise), túneles IPsec IKEv2 sede principal y VPN WireGuard.
4. **Accesos & Ciberseguridad:** Directorio activo, Microsoft Entra ID, rotación de MFA TOTP y políticas de contraseñas de 14+ caracteres.
5. **Infraestructura Cloud:** Clústeres Kubernetes, AWS S3, bases de datos PostgreSQL y pipelines CI/CD.

---

## 3. Incidentes Históricos Ingeridos y Causa Raíz
### ✦ Caso Resuelto [CF-001]: Bloqueo masivo de autenticación MFA tras rotación de certificados
- **Categoría:** Accesos & Ciberseguridad
- **Diagnóstico y Solución:** Resincronización del demonio chrony NTP en los servidores perimetrales auth-01 y auth-02 tras detectar desfase de 180 segundos. Los códigos TOTP se restablecieron de inmediato.

### ✦ Caso Resuelto [CF-005]: Ajuste de cuota en bucket S3 de respaldos analíticos
- **Categoría:** Infraestructura Cloud
- **Diagnóstico y Solución:** Incremento de cuota a 500GB en bucket stg-reports y configuración de regla de ciclo de vida para migración a Glacier tras 90 días.

### ✦ Caso Resuelto [CF-006]: Alerta de acceso sospechoso detectado desde IP no reconocida
- **Categoría:** Accesos & Ciberseguridad
- **Diagnóstico y Solución:** Validación de ejecución de batch nocturno programado desde servidor de integración. Se agregó la IP fija a la lista blanca del firewall de aplicaciones (WAF).
"""
        ctx = HelpDeskContext(
            help_desk_id=desk.id,
            content=context_md,
            version=3,
            updated_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
        )
        db.add(ctx)
        db.commit()

        print("Creating Tickets & Comments...")
        now = datetime.datetime.utcnow()

        # Ticket 1: Critical - Resolved
        t1 = Ticket(
            help_desk_id=desk.id,
            requester_id=requester_user.id,
            assignee_id=agent_user.id,
            category_id=cat_sec.id,
            priority_id=prio_critica.id,
            ticket_code="CF-001",
            title="Bloqueo masivo de autenticación MFA tras rotación de certificados",
            description="Desde las 08:00 AM múltiples usuarios de operaciones no pueden validar el segundo factor de autenticación mediante la app corporativa. Se recibe error de token inválido en el gateway de acceso.",
            status="resolved",
            created_at=now - datetime.timedelta(days=3, hours=5),
            resolved_at=now - datetime.timedelta(days=3, hours=2)
        )
        db.add(t1)
        db.commit()
        db.refresh(t1)

        c1_1 = TicketComment(ticket_id=t1.id, user_id=requester_user.id, message="Adjunto información: el problema ocurre en dispositivos iOS y Android indistintamente.", is_internal=False, created_at=now - datetime.timedelta(days=3, hours=4, minutes=50))
        c1_2 = TicketComment(ticket_id=t1.id, user_id=agent_user.id, message="Revisando registros del clúster de autenticación. Detectamos desfase horario de 3 minutos en el servidor NTP principal que causaba invalidación del TOTP.", is_internal=False, created_at=now - datetime.timedelta(days=3, hours=3))
        c1_3 = TicketComment(ticket_id=t1.id, user_id=agent_user.id, message="Se forzó sincronización chrony en nodos auth-01 y auth-02.", is_internal=True, created_at=now - datetime.timedelta(days=3, hours=2, minutes=30))
        c1_4 = TicketComment(ticket_id=t1.id, user_id=agent_user.id, message="**Diagnóstico de Resolución:** Resincronización de reloj con servidor NTP stratum-1. Los códigos MFA validaron al instante. Se configuró alerta de deriva temporal.", is_internal=False, created_at=now - datetime.timedelta(days=3, hours=2))
        db.add_all([c1_1, c1_2, c1_3, c1_4])

        # Ticket 2: High - In Progress
        t2 = Ticket(
            help_desk_id=desk.id,
            requester_id=requester_user.id,
            assignee_id=agent_user.id,
            category_id=cat_net.id,
            priority_id=prio_alta.id,
            ticket_code="CF-002",
            title="Intermitencia en túnel VPN corporativo sede Bogotá y desconexiones VoIP",
            description="Durante llamadas con clientes por conmutador IP se presentan caídas aleatorias cada 15 minutos en el enlace VPN IPsec de la sede Bogotá.",
            status="in_progress",
            created_at=now - datetime.timedelta(hours=6),
            resolved_at=None
        )
        db.add(t2)
        db.commit()
        db.refresh(t2)

        c2_1 = TicketComment(ticket_id=t2.id, user_id=requester_user.id, message="Las extensiones 402, 405 y 408 experimentan caída simultánea durante la renegociación de llaves.", is_internal=False, created_at=now - datetime.timedelta(hours=5))
        c2_2 = TicketComment(ticket_id=t2.id, user_id=agent_user.id, message="Tomando el caso. Inicié captura de tráfico en interfaz tun0 para revisar lifetime del Security Association (SA).", is_internal=False, created_at=now - datetime.timedelta(hours=4))
        c2_3 = TicketComment(ticket_id=t2.id, user_id=agent_user.id, message="Nota interna: El ISP secundario tiene pérdida de paquetes del 12%. Estamos conmutando a la fibra óptica primaria.", is_internal=True, created_at=now - datetime.timedelta(hours=2))
        db.add_all([c2_1, c2_2, c2_3])

        # Ticket 3: Medium - Open (Unassigned)
        t3 = Ticket(
            help_desk_id=desk.id,
            requester_id=requester_user.id,
            assignee_id=None,
            category_id=cat_hw.id,
            priority_id=prio_media.id,
            ticket_code="CF-003",
            title="Falla de encendido en docking station USB-C y parpadeo en segundo monitor",
            description="Al conectar la laptop corporativa al replicador de puertos USB-C, el monitor secundario DisplayPort muestra pantalla negra intermitente y el teclado no recibe alimentación adecuada.",
            status="open",
            created_at=now - datetime.timedelta(hours=2),
            resolved_at=None
        )
        db.add(t3)
        db.commit()
        db.refresh(t3)

        c3_1 = TicketComment(ticket_id=t3.id, user_id=requester_user.id, message="Probé intercambiando cables DisplayPort a HDMI y cambiando de tomacorriente sin éxito.", is_internal=False, created_at=now - datetime.timedelta(hours=1, minutes=45))
        db.add(c3_1)

        # Ticket 4: Medium - Waiting
        t4 = Ticket(
            help_desk_id=desk.id,
            requester_id=requester_user.id,
            assignee_id=agent_user.id,
            category_id=cat_sw.id,
            priority_id=prio_media.id,
            ticket_code="CF-004",
            title="Solicitud de provisión de licencia Docker Desktop y JetBrains Suite",
            description="Requiero activación de licencia corporativa para el entorno de desarrollo y contenedores del nuevo proyecto de microservicios financieros.",
            status="waiting",
            created_at=now - datetime.timedelta(days=1, hours=8),
            resolved_at=None
        )
        db.add(t4)
        db.commit()
        db.refresh(t4)

        c4_1 = TicketComment(ticket_id=t4.id, user_id=agent_user.id, message="Hola Santiago, hemos asignado el seat de licencia en el portal empresarial. Por favor ingresa con tu correo corporativo y confirma si la activación fue exitosa.", is_internal=False, created_at=now - datetime.timedelta(hours=18))
        db.add(c4_1)

        # Ticket 5: Low - Resolved
        t5 = Ticket(
            help_desk_id=desk.id,
            requester_id=requester_user.id,
            assignee_id=admin_user.id,
            category_id=cat_cloud.id,
            priority_id=prio_baja.id,
            ticket_code="CF-005",
            title="Ajuste de cuota de almacenamiento en bucket S3 de respaldos analíticos",
            description="El proceso de exportación mensual de reportes de auditoría alcanzó el 90% de la capacidad asignada en el bucket stg-reports.",
            status="resolved",
            created_at=now - datetime.timedelta(days=2, hours=10),
            resolved_at=now - datetime.timedelta(days=2, hours=3)
        )
        db.add(t5)
        db.commit()
        db.refresh(t5)

        c5_1 = TicketComment(ticket_id=t5.id, user_id=admin_user.id, message="**Diagnóstico de Resolución:** Se incrementó la cuota a 500GB y se configuró regla de ciclo de vida (Lifecycle Policy) para transición automática a Glacier tras 90 días.", is_internal=False, created_at=now - datetime.timedelta(days=2, hours=3))
        db.add(c5_1)

        # Ticket 6: High - Resolved
        t6 = Ticket(
            help_desk_id=desk.id,
            requester_id=requester_user.id,
            assignee_id=agent_user.id,
            category_id=cat_sec.id,
            priority_id=prio_alta.id,
            ticket_code="CF-006",
            title="Alerta de acceso sospechoso detectado desde IP no reconocida",
            description="El sistema de auditoría perimetral reportó intento de login fuera de horario laboral habitual para una de las cuentas de servicio.",
            status="resolved",
            created_at=now - datetime.timedelta(days=4, hours=12),
            resolved_at=now - datetime.timedelta(days=4, hours=8)
        )
        db.add(t6)
        db.commit()
        db.refresh(t6)

        c6_1 = TicketComment(ticket_id=t6.id, user_id=agent_user.id, message="**Diagnóstico de Resolución:** Se verificó que correspondía a tarea batch autorizada del pipeline de datos. Se agregó la IP estática a la lista blanca del firewall perimetral.", is_internal=False, created_at=now - datetime.timedelta(days=4, hours=8))
        db.add(c6_1)

        db.commit()
        print("Database successfully seeded with realistic enterprise data!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
