import os

os.environ.setdefault("ALPHA_VANTAGE_API_KEY", "test-key")

from fastapi.testclient import TestClient

from app.main import app
from app.routes.stocks import favorites

client = TestClient(app)


def setup_function() -> None:
    favorites.clear()


def test_health_exposes_status_and_version() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "1.1.0"}


def test_favorites_crud_normalizes_and_avoids_duplicates() -> None:
    first = client.post("/stocks/favorites", json={"symbol": " aapl "})
    duplicate = client.post("/stocks/favorites", json={"symbol": "AAPL"})
    listed = client.get("/stocks/favorites/list")
    removed = client.delete("/stocks/favorites/aapl")

    assert first.status_code == 201
    assert duplicate.json()["favorites"] == ["AAPL"]
    assert listed.json() == ["AAPL"]
    assert removed.json()["favorites"] == []


def test_invalid_favorite_is_rejected() -> None:
    response = client.post("/stocks/favorites", json={"symbol": "bad symbol!"})
    assert response.status_code == 422


def test_search_query_is_validated() -> None:
    assert client.get("/stocks/search", params={"query": ""}).status_code == 422
