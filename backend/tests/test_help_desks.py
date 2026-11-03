def test_create_help_desk_wizard(client, auth_headers):
    response = client.post("/api/desks/wizard", headers=auth_headers, json={
        "name": "Mesa Central TI Facultad",
        "slug": "ti-facultad",
        "description": "Atención de soporte técnico a docentes y estudiantes",
        "enable_ai": True,
        "categories": [
            {"name": "Hardware", "description": "Equipos de cómputo", "color": "#f43f5e", "icon": "Cpu"},
            {"name": "Software", "description": "Aplicaciones y sistemas", "color": "#3b82f6", "icon": "Layers"}
        ],
        "priorities": [
            {"name": "Normal", "level": 1, "color": "#10b981", "sla_response_hours": 12, "sla_resolution_hours": 48},
            {"name": "Urgente", "level": 2, "color": "#f43f5e", "sla_response_hours": 2, "sla_resolution_hours": 8}
        ]
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Mesa Central TI Facultad"
    assert data["slug"] == "ti-facultad"
    assert data["is_ai_enabled"] is True
    assert len(data["categories"]) == 2
    assert len(data["priorities"]) == 2

def test_create_help_desk_duplicate_slug(client, auth_headers):
    payload = {
        "name": "Mesa duplicada",
        "slug": "ti-facultad",
        "description": "Otra mesa",
        "enable_ai": False
    }
    # First creation
    client.post("/api/desks/wizard", headers=auth_headers, json=payload)
    # Duplicate
    response = client.post("/api/desks/wizard", headers=auth_headers, json=payload)
    assert response.status_code == 400
    assert "ya se encuentra en uso" in response.json()["detail"]

def test_list_my_help_desks(client, auth_headers):
    # Create desk
    client.post("/api/desks/wizard", headers=auth_headers, json={
        "name": "Soporte Académico",
        "slug": "soporte-academico",
        "description": "Mesa de servicios",
        "enable_ai": False
    })
    response = client.get("/api/desks", headers=auth_headers)
    assert response.status_code == 200
    desks = response.json()
    assert len(desks) >= 1
    assert desks[0]["slug"] == "soporte-academico"
    assert desks[0]["role"] == "admin"

def test_get_help_desk_by_slug(client, auth_headers):
    client.post("/api/desks/wizard", headers=auth_headers, json={
        "name": "Help Desk Central",
        "slug": "central-help",
        "description": "Mesa central",
        "enable_ai": False
    })
    response = client.get("/api/desks/central-help", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Help Desk Central"
    assert len(data["categories"]) >= 1

def test_toggle_ai_help_desk(client, auth_headers):
    client.post("/api/desks/wizard", headers=auth_headers, json={
        "name": "Help Desk AI Test",
        "slug": "ai-test-desk",
        "enable_ai": False
    })
    # Toggle to ON
    response = client.patch("/api/desks/ai-test-desk/ai-toggle", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["is_ai_enabled"] is True

    # Toggle to OFF
    response2 = client.patch("/api/desks/ai-test-desk/ai-toggle", headers=auth_headers)
    assert response2.status_code == 200
    assert response2.json()["is_ai_enabled"] is False
