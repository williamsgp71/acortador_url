import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    response = await client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    await client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser1",
            "password": "securepassword123",
        },
    )
    response = await client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser2",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    await client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "username": "loginuser",
            "password": "securepassword123",
        },
    )
    response = await client.post(
        "/auth/login",
        json={"username": "loginuser", "password": "securepassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post(
        "/auth/register",
        json={
            "email": "wrong@example.com",
            "username": "wronguser",
            "password": "securepassword123",
        },
    )
    response = await client.post(
        "/auth/login",
        json={"username": "wronguser", "password": "wrongpassword"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_protected(client: AsyncClient):
    register_response = await client.post(
        "/auth/register",
        json={
            "email": "me@example.com",
            "username": "meuser",
            "password": "securepassword123",
        },
    )
    access_token = register_response.json()["access_token"]

    response = await client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "meuser"
    assert data["email"] == "me@example.com"


@pytest.mark.asyncio
async def test_get_me_no_token(client: AsyncClient):
    response = await client.get("/auth/me")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient):
    register_response = await client.post(
        "/auth/register",
        json={
            "email": "refresh@example.com",
            "username": "refreshuser",
            "password": "securepassword123",
        },
    )
    refresh_token = register_response.json()["refresh_token"]

    response = await client.post(
        "/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_refresh_token_revoked(client: AsyncClient):
    register_response = await client.post(
        "/auth/register",
        json={
            "email": "revoked@example.com",
            "username": "revokeduser",
            "password": "securepassword123",
        },
    )
    refresh_token = register_response.json()["refresh_token"]

    await client.post(
        "/auth/refresh",
        json={"refresh_token": refresh_token},
    )

    response = await client.post(
        "/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_logout(client: AsyncClient):
    register_response = await client.post(
        "/auth/register",
        json={
            "email": "logout@example.com",
            "username": "logoutuser",
            "password": "securepassword123",
        },
    )
    access_token = register_response.json()["access_token"]
    refresh_token = register_response.json()["refresh_token"]

    response = await client.post(
        "/auth/logout",
        json={"refresh_token": refresh_token},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200

    refresh_response = await client.post(
        "/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_response.status_code == 401