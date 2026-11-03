def test_register_success(client):
    response = client.post("/api/auth/register", json={
        "email": "danna.palencia@usco.edu.co",
        "full_name": "Danna Nerieth Palencia",
        "password": "securepassword123"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "danna.palencia@usco.edu.co"
    assert data["user"]["full_name"] == "Danna Nerieth Palencia"

def test_register_duplicate_email(client, test_user):
    response = client.post("/api/auth/register", json={
        "email": test_user.email,
        "full_name": "Otro Usuario",
        "password": "password123"
    })
    assert response.status_code == 400
    assert "Ya existe un usuario registrado" in response.json()["detail"]

def test_login_success(client, test_user):
    response = client.post("/api/auth/login", json={
        "email": test_user.email,
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["id"] == test_user.id

def test_login_wrong_password(client, test_user):
    response = client.post("/api/auth/login", json={
        "email": test_user.email,
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Credenciales inválidas" in response.json()["detail"]

def test_get_me_authenticated(client, auth_headers, test_user):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["full_name"] == test_user.full_name

def test_get_me_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
