import pytest


@pytest.mark.asyncio
async def test_register_success(client):
    """A new user can register with valid details."""
    response = await client.post("/api/v1/auth/register", json={
        "email": "newuser@example.com",
        "password": "securepassword",
        "full_name": "New User"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "New User"
    assert "hashed_password" not in data  # password must never be returned


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    """Registering with an already-used email returns 400."""
    payload = {"email": "dupe@example.com", "password": "pass123", "full_name": "User"}
    await client.post("/api/v1/auth/register", json=payload)

    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_success(client):
    """A registered user can log in and receives a token."""
    await client.post("/api/v1/auth/register", json={
        "email": "login@example.com",
        "password": "mypassword",
        "full_name": "Login User"
    })
    response = await client.post("/api/v1/auth/login", data={
        "username": "login@example.com",
        "password": "mypassword"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    """Logging in with wrong password returns 401."""
    await client.post("/api/v1/auth/register", json={
        "email": "user@example.com",
        "password": "correctpassword",
        "full_name": "User"
    })
    response = await client.post("/api/v1/auth/login", data={
        "username": "user@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(auth_client):
    """Authenticated user can fetch their own profile."""
    response = await auth_client.get("/api/v1/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client):
    """Unauthenticated request to /me returns 401."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401