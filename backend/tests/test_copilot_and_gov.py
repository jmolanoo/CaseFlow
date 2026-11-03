import pytest
from fastapi.testclient import TestClient

def test_ai_toggles_and_governance(client: TestClient, auth_headers: dict):
    # 1. Create a help desk with admin
    create_resp = client.post(
        "/api/desks/wizard",
        headers=auth_headers,
        json={
            "name": "Centro de Servicios TI",
            "slug": "ti-servicios",
            "description": "Mesa técnica de soporte",
            "enable_ai": True,
            "categories": [{"name": "Redes", "color": "#f43f5e", "icon": "wifi"}],
            "priorities": [{"name": "Alta", "level": 3, "color": "#f43f5e", "sla_response_hours": 2, "sla_resolution_hours": 6}]
        }
    )
    assert create_resp.status_code == 201

    # 2. Get AI toggles as admin (initializes default 5 toggles)
    toggles_resp = client.get(
        "/api/desks/ti-servicios/ai/toggles",
        headers=auth_headers
    )
    assert toggles_resp.status_code == 200
    toggles = toggles_resp.json()
    assert len(toggles) >= 5
    feature_names = {t["feature_name"] for t in toggles}
    assert "radicacion_asistida" in feature_names
    assert "copiloto_respuestas" in feature_names
    assert "diagnostico_casos" in feature_names
    assert "aprendizaje_resolucion" in feature_names
    assert "resumen_ejecutivo" in feature_names

    # 3. Update toggles as admin
    update_resp = client.put(
        "/api/desks/ti-servicios/ai/toggles",
        headers=auth_headers,
        json={
            "toggles": [
                {
                    "feature_name": "copiloto_respuestas",
                    "role_requester": False,
                    "role_agent": True,
                    "role_admin": True,
                    "is_enabled": True
                }
            ]
        }
    )
    assert update_resp.status_code == 200
    updated_toggles = {t["feature_name"]: t for t in update_resp.json()}
    assert updated_toggles["copiloto_respuestas"]["role_requester"] is False

    # 4. Attempt update as non-member (forbidden)
    # Register second user
    client.post(
        "/api/auth/register",
        json={"email": "otro@ejemplo.com", "full_name": "Otro Usuario", "password": "password123"}
    )
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "otro@ejemplo.com", "password": "password123"}
    )
    other_token = login_resp.json()["access_token"]
    forbidden_resp = client.put(
        "/api/desks/ti-servicios/ai/toggles",
        headers={"Authorization": f"Bearer {other_token}"},
        json={"toggles": [{"feature_name": "copiloto_respuestas", "is_enabled": False}]}
    )
    assert forbidden_resp.status_code == 403

def test_copilot_endpoints_and_dynamic_learning(client: TestClient, auth_headers: dict):
    # Setup desk
    client.post(
        "/api/desks/wizard",
        headers=auth_headers,
        json={
            "name": "Mesa de Soporte Corporativo",
            "slug": "soporte-corp",
            "description": "Atención interna",
            "enable_ai": True,
            "categories": [{"name": "Conectividad", "color": "#f43f5e", "icon": "wifi"}],
            "priorities": [{"name": "Crítica", "level": 4, "color": "#f43f5e", "sla_response_hours": 1, "sla_resolution_hours": 4}]
        }
    )

    # Create a ticket
    ticket_resp = client.post(
        "/api/desks/soporte-corp/tickets",
        headers=auth_headers,
        json={
            "title": "Fallo de conexión WiFi en piso 3",
            "description": "Los colaboradores no pueden autenticarse a la red inalámbrica corporativa y pierden conexión."
        }
    )
    assert ticket_resp.status_code == 201
    ticket_code = ticket_resp.json()["ticket_code"]

    # 1. Test Copilot Suggested Reply
    reply_resp = client.post(
        f"/api/desks/soporte-corp/tickets/{ticket_code}/copilot/suggest-reply",
        headers=auth_headers
    )
    assert reply_resp.status_code == 200
    reply_data = reply_resp.json()
    assert "suggested_reply" in reply_data
    assert "red" in reply_data["suggested_reply"].lower() or "conexión" in reply_data["suggested_reply"].lower() or "wifi" in reply_data["suggested_reply"].lower()
    assert "explanation" in reply_data

    # 2. Test Copilot Diagnose
    diag_resp = client.post(
        f"/api/desks/soporte-corp/tickets/{ticket_code}/copilot/diagnose",
        headers=auth_headers
    )
    assert diag_resp.status_code == 200
    diag_data = diag_resp.json()
    assert "diagnosis" in diag_data
    assert len(diag_data["recommended_steps"]) >= 2

    # 3. Test Copilot Summary
    sum_resp = client.post(
        f"/api/desks/soporte-corp/tickets/{ticket_code}/copilot/summary",
        headers=auth_headers
    )
    assert sum_resp.status_code == 200
    sum_data = sum_resp.json()
    assert "summary" in sum_data
    assert len(sum_data["key_points"]) >= 2

    # 4. Check initial context version
    ctx_before = client.get(
        "/api/desks/soporte-corp/context",
        headers=auth_headers
    ).json()
    initial_version = ctx_before["version"]

    # 5. Resolve ticket with diagnostic -> Verifying Dynamic Learning
    resolve_resp = client.patch(
        f"/api/desks/soporte-corp/tickets/{ticket_code}/status",
        headers=auth_headers,
        json={
            "status": "resolved",
            "diagnostic": "Se reinició el Access Point AP-03 y se refrescaron las credenciales RADIUS."
        }
    )
    assert resolve_resp.status_code == 200
    assert resolve_resp.json()["status"] == "resolved"

    # 6. Verify Help Desk Context has dynamically learned the resolution!
    ctx_after = client.get(
        "/api/desks/soporte-corp/context",
        headers=auth_headers
    ).json()
    assert ctx_after["version"] > initial_version
    assert ticket_code in ctx_after["content"]
    assert "RADIUS" in ctx_after["content"]

def test_ticket_assignment_and_sla_filtering(client: TestClient, auth_headers: dict):
    # Setup desk and ticket
    client.post(
        "/api/desks/wizard",
        headers=auth_headers,
        json={
            "name": "Operaciones TI",
            "slug": "operaciones-ti",
            "description": "Mesa operativa",
            "enable_ai": True
        }
    )
    t_resp = client.post(
        "/api/desks/operaciones-ti/tickets",
        headers=auth_headers,
        json={"title": "Mantenimiento preventivo", "description": "Limpieza general de equipos."}
    )
    ticket_code = t_resp.json()["ticket_code"]

    # Get user id
    me = client.get("/api/auth/me", headers=auth_headers).json()
    user_id = me["id"]

    # Assign ticket to user
    assign_resp = client.patch(
        f"/api/desks/operaciones-ti/tickets/{ticket_code}/assign",
        headers=auth_headers,
        json={"assignee_id": user_id}
    )
    assert assign_resp.status_code == 200
    assert assign_resp.json()["assignee_id"] == user_id

    # Test SLA filter parameter
    list_resp = client.get(
        "/api/desks/operaciones-ti/tickets?sla_filter=on_time",
        headers=auth_headers
    )
    assert list_resp.status_code == 200
    assert isinstance(list_resp.json(), list)
