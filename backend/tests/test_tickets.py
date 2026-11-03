import pytest

def test_create_and_list_tickets(client, auth_headers):
    # 1. Create a Help Desk via wizard
    desk_payload = {
        "name": "Soporte TI Facultad",
        "slug": "ti-facultad-tickets",
        "description": "Mesa de pruebas para tickets",
        "enable_ai": True,
        "categories": [
            {"name": "Hardware", "color": "#f43f5e", "icon": "Cpu"},
            {"name": "Redes", "color": "#10b981", "icon": "Wifi"}
        ],
        "priorities": [
            {"name": "Baja", "level": 1, "color": "#10b981", "sla_response_hours": 24, "sla_resolution_hours": 72},
            {"name": "Urgente", "level": 4, "color": "#f43f5e", "sla_response_hours": 1, "sla_resolution_hours": 4}
        ]
    }
    desk_res = client.post("/api/desks/wizard", json=desk_payload, headers=auth_headers)
    assert desk_res.status_code == 201
    desk_data = desk_res.json()
    cat_id = desk_data["categories"][0]["id"]
    prio_id = desk_data["priorities"][1]["id"]

    # 2. Create Ticket 1 (custom category and priority)
    t1_payload = {
        "title": "Falla en monitor de sala",
        "description": "El monitor parpadea y huele a quemado en el laboratorio.",
        "category_id": cat_id,
        "priority_id": prio_id
    }
    t1_res = client.post("/api/desks/ti-facultad-tickets/tickets", json=t1_payload, headers=auth_headers)
    assert t1_res.status_code == 201
    t1_data = t1_res.json()
    assert t1_data["ticket_code"].startswith("CASE-")
    assert t1_data["title"] == "Falla en monitor de sala"
    assert t1_data["status"] == "open"
    assert t1_data["priority_name"] == "Urgente"
    assert t1_data["sla_resolution_hours"] == 4

    # 3. Create Ticket 2 (default category and priority)
    t2_payload = {
        "title": "Sin acceso a red wifi",
        "description": "No conecta al SSID institucional desde la oficina 204."
    }
    t2_res = client.post("/api/desks/ti-facultad-tickets/tickets", json=t2_payload, headers=auth_headers)
    assert t2_res.status_code == 201
    t2_data = t2_res.json()
    assert t2_data["status"] == "open"

    # 4. List Tickets
    list_res = client.get("/api/desks/ti-facultad-tickets/tickets", headers=auth_headers)
    assert list_res.status_code == 200
    tickets = list_res.json()
    assert len(tickets) >= 2

    # Filter by status
    filter_res = client.get("/api/desks/ti-facultad-tickets/tickets?status=open", headers=auth_headers)
    assert filter_res.status_code == 200
    assert len(filter_res.json()) >= 2

    # 5. Add Comment to Ticket 1
    comment_payload = {
        "message": "Se asigna técnico para revisión presencial en laboratorio.",
        "is_internal": False
    }
    com_res = client.post(
        f"/api/desks/ti-facultad-tickets/tickets/{t1_data['ticket_code']}/comments",
        json=comment_payload,
        headers=auth_headers
    )
    assert com_res.status_code == 201
    assert com_res.json()["message"] == comment_payload["message"]

    # 6. Get Ticket Detail
    detail_res = client.get(f"/api/desks/ti-facultad-tickets/tickets/{t1_data['ticket_code']}", headers=auth_headers)
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert len(detail_data["comments"]) == 1
    assert detail_data["comments"][0]["message"] == comment_payload["message"]

    # 7. Update Status to in_progress then resolved
    update_res = client.patch(
        f"/api/desks/ti-facultad-tickets/tickets/{t1_data['ticket_code']}/status",
        json={"status": "in_progress"},
        headers=auth_headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "in_progress"

    resolve_res = client.patch(
        f"/api/desks/ti-facultad-tickets/tickets/{t1_data['ticket_code']}/status",
        json={"status": "resolved", "diagnostic": "Se reemplazó cable de poder defectuoso. Monitor 100% operativo."},
        headers=auth_headers
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "resolved"
    assert resolve_res.json()["resolved_at"] is not None
