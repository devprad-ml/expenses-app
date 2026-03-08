import pytest


EXPENSE_PAYLOAD = {
    "description": "Lunch at Subway",
    "amount": 12.50,
    "category": "food"
}


@pytest.mark.asyncio
async def test_create_expense(auth_client):
    """Authenticated user can create an expense."""
    response = await auth_client.post("/api/v1/expenses/", json=EXPENSE_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert data["description"] == "Lunch at Subway"
    assert data["amount"] == 12.50
    assert data["category"] == "food"
    assert "id" in data


@pytest.mark.asyncio
async def test_create_expense_unauthenticated(client):
    """Unauthenticated request to create expense returns 401."""
    response = await client.post("/api/v1/expenses/", json=EXPENSE_PAYLOAD)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_expenses(auth_client):
    """User can retrieve their list of expenses."""
    await auth_client.post("/api/v1/expenses/", json=EXPENSE_PAYLOAD)
    await auth_client.post("/api/v1/expenses/", json={
        "description": "Bus ticket",
        "amount": 3.00,
        "category": "transport"
    })

    response = await auth_client.get("/api/v1/expenses/")
    assert response.status_code == 200
    assert len(response.json()) == 2


@pytest.mark.asyncio
async def test_get_expenses_filter_by_category(auth_client):
    """Filtering expenses by category returns only matching expenses."""
    await auth_client.post("/api/v1/expenses/", json=EXPENSE_PAYLOAD)
    await auth_client.post("/api/v1/expenses/", json={
        "description": "Netflix",
        "amount": 15.00,
        "category": "entertainment"
    })

    response = await auth_client.get("/api/v1/expenses/?category=food")
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert results[0]["category"] == "food"


@pytest.mark.asyncio
async def test_delete_expense(auth_client):
    """User can delete their own expense."""
    create_response = await auth_client.post("/api/v1/expenses/", json=EXPENSE_PAYLOAD)
    expense_id = create_response.json()["id"]

    delete_response = await auth_client.delete(f"/api/v1/expenses/{expense_id}")
    assert delete_response.status_code == 204

    # Confirm it's gone
    list_response = await auth_client.get("/api/v1/expenses/")
    assert len(list_response.json()) == 0


@pytest.mark.asyncio
async def test_delete_expense_not_found(auth_client):
    """Deleting a non-existent expense returns 404."""
    response = await auth_client.delete("/api/v1/expenses/99999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_cannot_delete_another_users_expense(auth_client, client):
    """A user cannot delete an expense that belongs to someone else."""
    # Create expense as user 1 (auth_client)
    create_response = await auth_client.post("/api/v1/expenses/", json=EXPENSE_PAYLOAD)
    expense_id = create_response.json()["id"]

    # Register and log in as user 2
    await client.post("/api/v1/auth/register", json={
        "email": "other@example.com",
        "password": "otherpassword",
        "full_name": "Other User"
    })
    login = await client.post("/api/v1/auth/login", data={
        "username": "other@example.com",
        "password": "otherpassword"
    })
    client.headers.update({"Authorization": f"Bearer {login.json()['access_token']}"})

    # Try to delete user 1's expense as user 2
    response = await client.delete(f"/api/v1/expenses/{expense_id}")
    assert response.status_code == 404  # should not reveal it exists