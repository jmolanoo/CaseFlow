def test_get_vault_status_empty(client, auth_headers):
    response = client.get("/api/ai/vault/status", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["is_connected"] is False
    assert data["provider"] is None

def test_ai_test_mock_key(client, auth_headers):
    response = client.post("/api/ai/vault/test", headers=auth_headers, json={
        "provider": "gemini",
        "api_key": "test-mock-key-for-unit-test",
        "model_name": "gemini-2.0-flash"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["provider"] == "gemini"
    assert data["latency_ms"] > 0
    assert len(data["models"]) > 0

def test_connect_ai_key(client, auth_headers):
    response = client.post("/api/ai/vault/connect", headers=auth_headers, json={
        "provider": "gemini",
        "api_key": "test-gemini-secure-key-12345",
        "model_name": "gemini-2.0-flash"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

    # Now verify status shows connected
    status_resp = client.get("/api/ai/vault/status", headers=auth_headers)
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert status_data["is_connected"] is True
    assert status_data["provider"] == "gemini"
    assert status_data["model_name"] == "gemini-2.0-flash"

def test_disconnect_ai_key(client, auth_headers):
    # Connect first
    client.post("/api/ai/vault/connect", headers=auth_headers, json={
        "provider": "openai",
        "api_key": "test-openai-secret-key-12345",
        "model_name": "gpt-4o-mini"
    })
    # Disconnect
    disconn_resp = client.delete("/api/ai/vault/disconnect", headers=auth_headers)
    assert disconn_resp.status_code == 200

    # Status should now be disconnected
    status_resp = client.get("/api/ai/vault/status", headers=auth_headers)
    assert status_resp.json()["is_connected"] is False
