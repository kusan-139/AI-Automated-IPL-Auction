import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_api_v1_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_list_players(client: AsyncClient):
    response = await client.get("/api/v1/players/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_list_teams(client: AsyncClient):
    response = await client.get("/api/v1/teams/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_negotiate_endpoint(client: AsyncClient):
    payload = {
        "player": {"name": "Virat Kohli", "base_price": 20000000.0, "runs": 8004, "strike_rate": 131.9},
        "team": {"remaining_budget": 1200000000.0}
    }
    response = await client.post("/api/v1/auction/negotiate", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert "prediction" in res_data
    assert "explanation" in res_data
