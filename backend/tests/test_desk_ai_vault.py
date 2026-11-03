import pytest
from app.models import User, HelpDesk

def test_desk_isolated_ai_vault(client, auth_headers, test_user, db_session):
    # 1. Create two separate help desks
    r1 = client.post("/api/desks/wizard", json={
        "name": "Mesa Alfa",
        "slug": "mesa-alfa",
        "description": "Tenant Alfa",
        "enable_ai": False,
        "categories": [],
        "priorities": []
    }, headers=auth_headers)
    assert r1.status_code == 201

    r2 = client.post("/api/desks/wizard", json={
        "name": "Mesa Beta",
        "slug": "mesa-beta",
        "description": "Tenant Beta",
        "enable_ai": False,
        "categories": [],
        "priorities": []
    }, headers=auth_headers)
    assert r2.status_code == 201

    # 2. Check initial AI status for both desks - both disconnected
    s1 = client.get("/api/ai/vault/status?desk_slug=mesa-alfa", headers=auth_headers)
    assert s1.status_code == 200
    assert s1.json()["is_connected"] is False

    s2 = client.get("/api/ai/vault/status?desk_slug=mesa-beta", headers=auth_headers)
    assert s2.status_code == 200
    assert s2.json()["is_connected"] is False

    # 3. Connect Gemini to Mesa Alfa
    conn1 = client.post("/api/ai/vault/connect", json={
        "provider": "gemini",
        "api_key": "test-gemini-mock-key-for-alfa-123456",
        "model_name": "gemini-2.0-flash",
        "desk_slug": "mesa-alfa"
    }, headers=auth_headers)
    assert conn1.status_code == 200
    assert conn1.json()["success"] is True
    assert conn1.json()["provider"] == "gemini"

    # 4. Connect OpenAI to Mesa Beta
    conn2 = client.post("/api/ai/vault/connect", json={
        "provider": "openai",
        "api_key": "test-openai-mock-key-for-beta-123456",
        "model_name": "gpt-4o-mini",
        "desk_slug": "mesa-beta"
    }, headers=auth_headers)
    assert conn2.status_code == 200
    assert conn2.json()["success"] is True
    assert conn2.json()["provider"] == "openai"

    # 5. Verify isolation: Mesa Alfa is Gemini, Mesa Beta is OpenAI!
    check_alfa = client.get("/api/ai/vault/status?desk_slug=mesa-alfa", headers=auth_headers)
    assert check_alfa.status_code == 200
    alfa_data = check_alfa.json()
    assert alfa_data["is_connected"] is True
    assert alfa_data["provider"] == "gemini"
    assert alfa_data["model_name"] == "gemini-2.0-flash"

    check_beta = client.get("/api/ai/vault/status?desk_slug=mesa-beta", headers=auth_headers)
    assert check_beta.status_code == 200
    beta_data = check_beta.json()
    assert beta_data["is_connected"] is True
    assert beta_data["provider"] == "openai"
    assert beta_data["model_name"] == "gpt-4o-mini"

    # 6. Disconnect Mesa Alfa only
    dis_alfa = client.delete("/api/ai/vault/disconnect?desk_slug=mesa-alfa", headers=auth_headers)
    assert dis_alfa.status_code == 200

    # Mesa Alfa is now disconnected, but Mesa Beta is STILL connected!
    check_alfa_after = client.get("/api/ai/vault/status?desk_slug=mesa-alfa", headers=auth_headers)
    assert check_alfa_after.json()["is_connected"] is False

    check_beta_after = client.get("/api/ai/vault/status?desk_slug=mesa-beta", headers=auth_headers)
    assert check_beta_after.json()["is_connected"] is True
    assert check_beta_after.json()["provider"] == "openai"
