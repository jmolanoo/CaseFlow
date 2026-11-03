import pytest
from app.models import User, HelpDesk, HelpDeskMember, HelpDeskInvitation
from app.auth import get_password_hash, create_access_token

def test_members_and_custom_invitations_flow(client, auth_headers, test_user, db_session):
    # 1. Create a help desk
    desk_payload = {
        "name": "Mesa de Operaciones Global",
        "slug": "mesa-operaciones",
        "description": "Atención corporativa multitenant",
        "enable_ai": True,
        "categories": [],
        "priorities": []
    }
    r = client.post("/api/desks/wizard", json=desk_payload, headers=auth_headers)
    assert r.status_code == 201

    # 2. Admin creates custom invitation for users/requesters
    inv_user_payload = {
        "role": "requester",
        "label": "Invitación Personal de Ventas",
        "max_uses": 5,
        "expires_days": 7
    }
    r = client.post("/api/desks/mesa-operaciones/invitations", json=inv_user_payload, headers=auth_headers)
    assert r.status_code == 201
    inv_user_data = r.json()
    assert inv_user_data["role"] == "requester"
    assert inv_user_data["label"] == "Invitación Personal de Ventas"
    assert inv_user_data["max_uses"] == 5
    user_invite_code = inv_user_data["code"]

    # 3. Admin creates custom invitation for support/agents
    inv_agent_payload = {
        "role": "agent",
        "label": "Invitación Equipo Soporte TI",
        "max_uses": 2,
        "expires_days": 14
    }
    r = client.post("/api/desks/mesa-operaciones/invitations", json=inv_agent_payload, headers=auth_headers)
    assert r.status_code == 201
    inv_agent_data = r.json()
    assert inv_agent_data["role"] == "agent"
    agent_invite_code = inv_agent_data["code"]

    # 4. Preview invitation endpoint
    r = client.get(f"/api/desks/invitations/preview/{user_invite_code}")
    assert r.status_code == 200
    preview = r.json()
    assert preview["valid"] is True
    assert preview["help_desk_slug"] == "mesa-operaciones"
    assert preview["role"] == "requester"

    # 5. Register and login a second user (Employee)
    user2_email = "empleado.ventas@empresa.com"
    r = client.post("/api/auth/register", json={
        "email": user2_email,
        "full_name": "Carlos Mendoza",
        "password": "Password123"
    })
    assert r.status_code == 201
    user2_token = r.json()["access_token"]
    user2_headers = {"Authorization": f"Bearer {user2_token}"}

    # Second user joins via user invitation link
    r = client.post("/api/desks/join", json={"code": user_invite_code}, headers=user2_headers)
    assert r.status_code == 200
    join_res = r.json()
    assert join_res["role"] == "requester"
    assert join_res["desk"]["user_role"] == "requester"

    # 6. Register and login a third user (Support Agent)
    user3_email = "agente.soporte@empresa.com"
    r = client.post("/api/auth/register", json={
        "email": user3_email,
        "full_name": "Laura Especialista",
        "password": "Password123"
    })
    assert r.status_code == 201
    user3_token = r.json()["access_token"]
    user3_headers = {"Authorization": f"Bearer {user3_token}"}

    # Third user joins via agent invitation link
    r = client.post("/api/desks/join", json={"code": agent_invite_code}, headers=user3_headers)
    assert r.status_code == 200
    join_agent_res = r.json()
    assert join_agent_res["role"] == "agent"
    assert join_agent_res["desk"]["user_role"] == "agent"

    # 7. List members as Admin
    r = client.get("/api/desks/mesa-operaciones/members", headers=auth_headers)
    assert r.status_code == 200
    members = r.json()
    assert len(members) == 3
    emails = {m["email"]: m["role"] for m in members}
    assert emails[user2_email] == "requester"
    assert emails[user3_email] == "agent"

    # Get user2 ID
    user2_id = [m["user_id"] for m in members if m["email"] == user2_email][0]

    # 8. Admin promotes user2 to agent
    r = client.patch(
        f"/api/desks/mesa-operaciones/members/{user2_id}",
        json={"role": "agent"},
        headers=auth_headers
    )
    assert r.status_code == 200
    assert r.json()["role"] == "agent"

    # 9. Admin deactivates user2
    r = client.patch(
        f"/api/desks/mesa-operaciones/members/{user2_id}",
        json={"is_active": False},
        headers=auth_headers
    )
    assert r.status_code == 200
    assert r.json()["is_active"] is False

    # 10. Deactivated user2 is forbidden from accessing the desk
    r = client.get("/api/desks/mesa-operaciones", headers=user2_headers)
    assert r.status_code == 403
    assert "desactivada" in r.json()["detail"].lower()

    # Desk does not show up in user2's active desks
    r = client.get("/api/desks", headers=user2_headers)
    assert r.status_code == 200
    assert len([d for d in r.json() if d["slug"] == "mesa-operaciones"]) == 0

    # 11. Admin reactivates user2
    r = client.patch(
        f"/api/desks/mesa-operaciones/members/{user2_id}",
        json={"is_active": True},
        headers=auth_headers
    )
    assert r.status_code == 200
    assert r.json()["is_active"] is True

    # User2 can now access the desk again
    r = client.get("/api/desks/mesa-operaciones", headers=user2_headers)
    assert r.status_code == 200

    # 12. Protection tests: Admin cannot deactivate or demote the owner
    r = client.patch(
        f"/api/desks/mesa-operaciones/members/{test_user.id}",
        json={"is_active": False},
        headers=auth_headers
    )
    assert r.status_code == 400
    assert "propietario" in r.json()["detail"].lower()

    # 13. Admin deletes user3 from desk
    user3_id = [m["user_id"] for m in members if m["email"] == user3_email][0]
    r = client.delete(f"/api/desks/mesa-operaciones/members/{user3_id}", headers=auth_headers)
    assert r.status_code == 200
    assert "eliminado" in r.json()["message"].lower()

    # User3 no longer in desk
    r = client.get("/api/desks/mesa-operaciones/members", headers=auth_headers)
    assert len(r.json()) == 2

    # 14. Invitation list, toggle and delete
    r = client.get("/api/desks/mesa-operaciones/invitations", headers=auth_headers)
    assert r.status_code == 200
    invs = r.json()
    assert len(invs) >= 2

    # Toggle agent invite to inactive
    agent_inv_id = inv_agent_data["id"]
    r = client.patch(f"/api/desks/mesa-operaciones/invitations/{agent_inv_id}/toggle", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["is_active"] is False

    # Attempting to join with toggled inactive invitation fails
    r = client.post("/api/desks/join", json={"code": agent_invite_code}, headers=user3_headers)
    assert r.status_code == 400
    assert "desactivado" in r.json()["detail"].lower()

    # Delete invitation
    r = client.delete(f"/api/desks/mesa-operaciones/invitations/{agent_inv_id}", headers=auth_headers)
    assert r.status_code == 200
    assert "eliminado" in r.json()["message"].lower()
