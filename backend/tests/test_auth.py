from fastapi.testclient import TestClient


def test_register_success(client: TestClient):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "strongpassword123",
            "full_name": "New User",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["full_name"] == "New User"


def test_register_duplicate_email(client: TestClient, user_a):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": user_a.email,
            "password": "anotherpassword",
            "full_name": "Duplicate User",
        },
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_success(client: TestClient, user_a):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": user_a.email,
            "password": "password123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["id"] == user_a.id


def test_login_wrong_password(client: TestClient, user_a):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": user_a.email,
            "password": "wrongpassword",
        },
    )
    assert response.status_code == 401


def test_get_me_authenticated(client: TestClient, user_a, auth_headers_user_a):
    response = client.get("/api/v1/auth/me", headers=auth_headers_user_a)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_a.id
    assert data["email"] == user_a.email


def test_get_me_unauthenticated(client: TestClient):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
