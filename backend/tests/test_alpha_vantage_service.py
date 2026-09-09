import asyncio
from unittest.mock import AsyncMock

import httpx
import pytest

from app.cache.memory_cache import memory_cache
from app.services.alpha_vantage_service import AlphaVantageError, AlphaVantageService


def run(coroutine):
    return asyncio.run(coroutine)


@pytest.fixture(autouse=True)
def empty_cache() -> None:
    memory_cache.clear()


def test_search_maps_provider_fields_and_uses_cache(monkeypatch: pytest.MonkeyPatch) -> None:
    service = AlphaVantageService()
    provider = AsyncMock(return_value={"bestMatches": [{
        "1. symbol": "AAPL", "2. name": "Apple Inc", "3. type": "Equity",
        "4. region": "United States", "8. currency": "USD",
    }]})
    monkeypatch.setattr(service, "_get", provider)

    first = run(service.search_symbol("aapl"))
    second = run(service.search_symbol("AAPL"))

    assert first == second == [{
        "symbol": "AAPL", "name": "Apple Inc", "type": "Equity",
        "region": "United States", "currency": "USD",
    }]
    provider.assert_awaited_once()


def test_quote_maps_numeric_values(monkeypatch: pytest.MonkeyPatch) -> None:
    service = AlphaVantageService()
    monkeypatch.setattr(service, "_get", AsyncMock(return_value={"Global Quote": {
        "01. symbol": "MSFT", "02. open": "420.00", "03. high": "425.50",
        "04. low": "418.25", "05. price": "424.10", "06. volume": "123456",
        "09. change": "4.10", "10. change percent": "0.9762%",
    }}))

    quote = run(service.get_quote("msft"))

    assert quote["symbol"] == "MSFT"
    assert quote["price"] == 424.10
    assert quote["volume"] == 123456


def test_history_returns_oldest_to_newest_last_30(monkeypatch: pytest.MonkeyPatch) -> None:
    service = AlphaVantageService()
    series = {
        f"2026-08-{day:02d}": {
            "1. open": "10", "2. high": "12", "3. low": "9",
            "4. close": str(day), "5. volume": "1000",
        }
        for day in range(31, 0, -1)
    }
    monkeypatch.setattr(service, "_get", AsyncMock(return_value={"Time Series (Daily)": series}))

    history = run(service.get_daily_history("ibm"))

    assert len(history) == 30
    assert history[0]["date"] == "2026-08-02"
    assert history[-1]["date"] == "2026-08-31"


@pytest.mark.parametrize(
    ("payload", "status_code"),
    [
        ({"Note": "rate limit"}, 429),
        ({"Information": "frequency"}, 429),
        ({"Error Message": "invalid symbol"}, 422),
    ],
)
def test_provider_business_errors_are_translated(
    payload: dict[str, str], status_code: int, monkeypatch: pytest.MonkeyPatch
) -> None:
    service = AlphaVantageService()

    async def fake_get(*args, **kwargs):
        return httpx.Response(200, json=payload, request=httpx.Request("GET", "https://example.test"))

    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)

    with pytest.raises(AlphaVantageError) as error:
        run(service._get({"function": "GLOBAL_QUOTE", "symbol": "TEST"}))
    assert error.value.status_code == status_code


def test_http_failure_reaches_route_as_bad_gateway(monkeypatch: pytest.MonkeyPatch) -> None:
    from app.main import app
    from app.services.alpha_vantage_service import alpha_vantage_service
    from fastapi.testclient import TestClient

    monkeypatch.setattr(
        alpha_vantage_service,
        "get_quote",
        AsyncMock(side_effect=httpx.ConnectError("offline")),
    )
    response = TestClient(app).get("/stocks/AAPL/quote")

    assert response.status_code == 502
    assert response.json()["detail"] == "El proveedor de mercado no está disponible."
