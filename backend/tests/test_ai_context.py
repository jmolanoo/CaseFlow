import pytest

def test_context_and_retrospective_ingest(client, auth_headers):
    # 1. Create Desk with tickets
    desk_payload = {
        "name": "Mesa Central de Operaciones",
        "slug": "mesa-central-ops",
        "description": "Prueba de ingesta y contexto vivo",
        "enable_ai": True
    }
    res = client.post("/api/desks/wizard", json=desk_payload, headers=auth_headers)
    assert res.status_code == 201

    # 2. Get initial context
    ctx_res = client.get("/api/desks/mesa-central-ops/context", headers=auth_headers)
    assert ctx_res.status_code == 200
    assert ctx_res.json()["version"] >= 1

    # 3. Create tickets in this desk
    t_res = client.post(
        "/api/desks/mesa-central-ops/tickets",
        json={"title": "Error 500 en portal de notas", "description": "Falla general al cargar actas finales de calificaciones."},
        headers=auth_headers
    )
    assert t_res.status_code == 201

    # 4. Run Retrospective Ingestion
    ingest_payload = {
        "guidelines": "Horario prioritario: 8am a 6pm. Todo caso de actas de notas se escala a Vicerrectoría Académica."
    }
    ingest_res = client.post(
        "/api/desks/mesa-central-ops/context/ingest",
        json=ingest_payload,
        headers=auth_headers
    )
    assert ingest_res.status_code == 200
    ingest_data = ingest_res.json()
    assert ingest_data["success"] is True
    assert ingest_data["processed_tickets"] >= 1
    assert ingest_data["version"] >= 2

    # Verify context content updated
    updated_ctx = client.get("/api/desks/mesa-central-ops/context", headers=auth_headers).json()
    assert "Horario prioritario" in updated_ctx["content"]
    assert "Error 500" in updated_ctx["content"]

    # 5. Test AI Ticket Refinement
    refine_res = client.post(
        "/api/desks/mesa-central-ops/ai/refine-ticket",
        json={"description": "No funciona la conexion a internet ni la VPN en el edificio central"},
        headers=auth_headers
    )
    assert refine_res.status_code == 200
    refine_data = refine_res.json()
    assert "suggested_title" in refine_data
    assert refine_data["suggested_title"].startswith("Incidencia:")
    assert "suggested_category_id" in refine_data
    assert "analysis" in refine_data
