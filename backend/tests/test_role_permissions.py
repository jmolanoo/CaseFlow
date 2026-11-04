import pytest
from app.models import User, HelpDesk, HelpDeskMember, Category, Priority, Ticket, TicketComment, HelpDeskContext
from app.auth import get_password_hash, create_access_token

def test_role_based_permissions_matrix(client, db_session):
    # Setup 3 users: Admin, Agent, Requester
    pw_hash = get_password_hash("Secret123!")
    admin_u = User(email="admin_role@caseflow.co", full_name="Admin User", hashed_password=pw_hash)
    agent_u = User(email="agent_role@caseflow.co", full_name="Agent User", hashed_password=pw_hash)
    req_u1 = User(email="req1_role@caseflow.co", full_name="Requester One", hashed_password=pw_hash)
    req_u2 = User(email="req2_role@caseflow.co", full_name="Requester Two", hashed_password=pw_hash)
    db_session.add_all([admin_u, agent_u, req_u1, req_u2])
    db_session.commit()

    # Setup Help Desk
    desk = HelpDesk(name="Mesa Seguridad", slug="mesa-seguridad", owner_id=admin_u.id, is_ai_enabled=True)
    db_session.add(desk)
    db_session.commit()

    # Memberships
    m_admin = HelpDeskMember(help_desk_id=desk.id, user_id=admin_u.id, role="admin", is_active=True)
    m_agent = HelpDeskMember(help_desk_id=desk.id, user_id=agent_u.id, role="agent", is_active=True)
    m_req1 = HelpDeskMember(help_desk_id=desk.id, user_id=req_u1.id, role="requester", is_active=True)
    m_req2 = HelpDeskMember(help_desk_id=desk.id, user_id=req_u2.id, role="requester", is_active=True)
    db_session.add_all([m_admin, m_agent, m_req1, m_req2])

    cat = Category(help_desk_id=desk.id, name="General", color="#f43f5e")
    prio = Priority(help_desk_id=desk.id, name="Media", level=2, sla_resolution_hours=24)
    db_session.add_all([cat, prio])
    db_session.commit()

    # Create Ticket for Requester 1
    t1 = Ticket(
        help_desk_id=desk.id,
        requester_id=req_u1.id,
        category_id=cat.id,
        priority_id=prio.id,
        ticket_code="CASE-SEC-001",
        title="Problema de Requester 1",
        description="Falla privada de usuario 1",
        status="open"
    )
    # Create Ticket for Requester 2
    t2 = Ticket(
        help_desk_id=desk.id,
        requester_id=req_u2.id,
        category_id=cat.id,
        priority_id=prio.id,
        ticket_code="CASE-SEC-002",
        title="Problema de Requester 2",
        description="Falla privada de usuario 2",
        status="open"
    )
    db_session.add_all([t1, t2])
    db_session.commit()

    # Add comments: public and internal
    c_pub = TicketComment(ticket_id=t1.id, user_id=agent_u.id, message="Respuesta publica", is_internal=False)
    c_priv = TicketComment(ticket_id=t1.id, user_id=agent_u.id, message="Nota interna confidencial", is_internal=True)
    db_session.add_all([c_pub, c_priv])
    db_session.commit()

    # Tokens
    tok_admin = {"Authorization": f"Bearer {create_access_token({'sub': str(admin_u.id)})}"}
    tok_agent = {"Authorization": f"Bearer {create_access_token({'sub': str(agent_u.id)})}"}
    tok_req1 = {"Authorization": f"Bearer {create_access_token({'sub': str(req_u1.id)})}"}
    tok_req2 = {"Authorization": f"Bearer {create_access_token({'sub': str(req_u2.id)})}"}

    # 1. LIST TICKETS:
    # Admin sees all 2 tickets
    res = client.get("/api/desks/mesa-seguridad/tickets", headers=tok_admin)
    assert res.status_code == 200
    assert len(res.json()) == 2

    # Agent sees all 2 tickets
    res = client.get("/api/desks/mesa-seguridad/tickets", headers=tok_agent)
    assert res.status_code == 200
    assert len(res.json()) == 2

    # Requester 1 ONLY sees ticket 1
    res = client.get("/api/desks/mesa-seguridad/tickets", headers=tok_req1)
    assert res.status_code == 200
    req1_tickets = res.json()
    assert len(req1_tickets) == 1
    assert req1_tickets[0]["ticket_code"] == "CASE-SEC-001"

    # Requester 2 ONLY sees ticket 2
    res = client.get("/api/desks/mesa-seguridad/tickets", headers=tok_req2)
    assert res.status_code == 200
    req2_tickets = res.json()
    assert len(req2_tickets) == 1
    assert req2_tickets[0]["ticket_code"] == "CASE-SEC-002"

    # 2. GET TICKET DETAIL & INTERNAL NOTES:
    # Requester 1 sees CASE-SEC-001, but NOT the internal comment!
    res = client.get("/api/desks/mesa-seguridad/tickets/CASE-SEC-001", headers=tok_req1)
    assert res.status_code == 200
    comments = res.json()["comments"]
    assert len(comments) == 1
    assert comments[0]["message"] == "Respuesta publica"
    assert not any(c["is_internal"] for c in comments)

    # Requester 2 CANNOT access CASE-SEC-001 (403 Forbidden)
    res = client.get("/api/desks/mesa-seguridad/tickets/CASE-SEC-001", headers=tok_req2)
    assert res.status_code == 403

    # Agent and Admin CAN see both public and internal comments
    res = client.get("/api/desks/mesa-seguridad/tickets/CASE-SEC-001", headers=tok_agent)
    assert res.status_code == 200
    assert len(res.json()["comments"]) == 2

    # 3. TICKET ASSIGNMENT:
    # Requester CANNOT assign tickets (403)
    res = client.patch(
        "/api/desks/mesa-seguridad/tickets/CASE-SEC-001/assign",
        json={"assignee_id": agent_u.id},
        headers=tok_req1
    )
    assert res.status_code == 403

    # Agent CAN assign tickets
    res = client.patch(
        "/api/desks/mesa-seguridad/tickets/CASE-SEC-001/assign",
        json={"assignee_id": agent_u.id},
        headers=tok_agent
    )
    assert res.status_code == 200
    assert res.json()["assignee_id"] == agent_u.id

    # 4. TICKET STATUS MODIFICATION:
    # Requester CANNOT set status to "in_progress" or "waiting"
    res = client.patch(
        "/api/desks/mesa-seguridad/tickets/CASE-SEC-001/status",
        json={"status": "in_progress"},
        headers=tok_req1
    )
    assert res.status_code == 403

    # Requester CAN close their own ticket
    res = client.patch(
        "/api/desks/mesa-seguridad/tickets/CASE-SEC-001/status",
        json={"status": "closed"},
        headers=tok_req1
    )
    assert res.status_code == 200
    assert res.json()["status"] == "closed"

    # Requester CANNOT close ticket of another requester
    res = client.patch(
        "/api/desks/mesa-seguridad/tickets/CASE-SEC-002/status",
        json={"status": "closed"},
        headers=tok_req1
    )
    assert res.status_code == 403

    # 5. CONTEXT & AI TOGGLES RESTRICTIONS:
    # Requester and Agent CANNOT view /context (403)
    res = client.get("/api/desks/mesa-seguridad/context", headers=tok_req1)
    assert res.status_code == 403
    res = client.get("/api/desks/mesa-seguridad/context", headers=tok_agent)
    assert res.status_code == 403

    # Admin CAN view /context
    res = client.get("/api/desks/mesa-seguridad/context", headers=tok_admin)
    assert res.status_code == 200

    # Requester and Agent CANNOT view /ai/toggles (403)
    res = client.get("/api/desks/mesa-seguridad/ai/toggles", headers=tok_req1)
    assert res.status_code == 403
    res = client.get("/api/desks/mesa-seguridad/ai/toggles", headers=tok_agent)
    assert res.status_code == 403

    # Admin CAN view /ai/toggles
    res = client.get("/api/desks/mesa-seguridad/ai/toggles", headers=tok_admin)
    assert res.status_code == 200

    # 6. AI VAULT RESTRICTIONS:
    # Requester and Agent CANNOT connect AI key to desk (403)
    vault_payload = {
        "provider": "gemini",
        "api_key": "AIzaSyFakeKeyForTesting1234567890",
        "desk_slug": "mesa-seguridad"
    }
    res = client.post("/api/ai/vault/connect", json=vault_payload, headers=tok_req1)
    assert res.status_code == 403
    res = client.post("/api/ai/vault/connect", json=vault_payload, headers=tok_agent)
    assert res.status_code == 403

    # 7. COPILOT RESTRICTIONS:
    # Requester CANNOT trigger suggest-reply (403)
    res = client.post("/api/desks/mesa-seguridad/tickets/CASE-SEC-001/copilot/suggest-reply", headers=tok_req1)
    assert res.status_code == 403

    # Requester CANNOT trigger diagnose (403)
    res = client.post("/api/desks/mesa-seguridad/tickets/CASE-SEC-001/copilot/diagnose", headers=tok_req1)
    assert res.status_code == 403
