import httpx

from app.core.config import settings
from app.cache.memory_cache import memory_cache


class AlphaVantageService:
    async def _get(self, params: dict):
        params["apikey"] = settings.alpha_vantage_api_key

        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                settings.alpha_vantage_base_url,
                params=params
            )

        response.raise_for_status()
        data = response.json()

        if "Note" in data:
            raise Exception("Límite de requests alcanzado en Alpha Vantage.")

        if "Error Message" in data:
            raise Exception("Símbolo inválido o error en Alpha Vantage.")

        return data

    async def search_symbol(self, keywords: str):
        cache_key = f"search:{keywords.upper()}"
        cached = memory_cache.get(cache_key)

        if cached:
            return cached

        data = await self._get({
            "function": "SYMBOL_SEARCH",
            "keywords": keywords
        })

        matches = data.get("bestMatches", [])

        result = [
            {
                "symbol": item.get("1. symbol"),
                "name": item.get("2. name"),
                "type": item.get("3. type"),
                "region": item.get("4. region"),
                "currency": item.get("8. currency"),
            }
            for item in matches
        ]

        memory_cache.set(
            cache_key,
            result,
            settings.cache_ttl_seconds
        )

        return result

    async def get_quote(self, symbol: str):
        symbol = symbol.upper()
        cache_key = f"quote:{symbol}"
        cached = memory_cache.get(cache_key)

        if cached:
            return cached

        data = await self._get({
            "function": "GLOBAL_QUOTE",
            "symbol": symbol
        })

        quote = data.get("Global Quote")

        if not quote:
            raise Exception("No se encontró cotización para ese símbolo.")

        result = {
            "symbol": quote.get("01. symbol"),
            "price": float(quote.get("05. price")),
            "change": float(quote.get("09. change")),
            "change_percent": quote.get("10. change percent"),
            "open": float(quote.get("02. open")),
            "high": float(quote.get("03. high")),
            "low": float(quote.get("04. low")),
            "volume": int(quote.get("06. volume")),
        }

        memory_cache.set(
            cache_key,
            result,
            settings.cache_ttl_seconds
        )

        return result

    async def get_daily_history(self, symbol: str):
        symbol = symbol.upper()
        cache_key = f"history:{symbol}"
        cached = memory_cache.get(cache_key)

        if cached:
            return cached

        data = await self._get({
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "outputsize": "compact"
        })

        time_series = data.get("Time Series (Daily)")

        if not time_series:
            raise Exception("No se encontró historial para ese símbolo.")

        result = []

        for date, values in time_series.items():
            result.append({
                "date": date,
                "open": float(values.get("1. open")),
                "high": float(values.get("2. high")),
                "low": float(values.get("3. low")),
                "close": float(values.get("4. close")),
                "volume": int(values.get("5. volume")),
            })

        result = result[:30]
        result.reverse()

        memory_cache.set(
            cache_key,
            result,
            settings.cache_ttl_seconds
        )

        return result


alpha_vantage_service = AlphaVantageService()