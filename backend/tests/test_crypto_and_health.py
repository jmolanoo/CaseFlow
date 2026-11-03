from app.services.crypto_service import encrypt_key, decrypt_key

def test_crypto_roundtrip():
    secret = "AIzaSyD-my-super-secret-api-key-gemini"
    encrypted = encrypt_key(secret)
    assert encrypted != secret
    decrypted = decrypt_key(encrypted)
    assert decrypted == secret

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "operational"
