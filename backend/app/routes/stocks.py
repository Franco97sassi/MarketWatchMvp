import httpx
from fastapi import APIRouter, HTTPException, Query, status

from app.models.stock_models import FavoriteStock, FavoritesResponse
from app.services.alpha_vantage_service import AlphaVantageError, alpha_vantage_service

router = APIRouter(prefix="/stocks", tags=["Stocks"])
favorites: list[str] = []


def upstream_error(error: Exception) -> HTTPException:
    if isinstance(error, AlphaVantageError):
        return HTTPException(status_code=error.status_code, detail=str(error))
    if isinstance(error, httpx.HTTPError):
        return HTTPException(status_code=502, detail="El proveedor de mercado no está disponible.")
    return HTTPException(status_code=500, detail="Ocurrió un error inesperado.")


@router.get("/search")
async def search_stocks(query: str = Query(min_length=1, max_length=80)):
    try:
        return await alpha_vantage_service.search_symbol(query.strip())
    except Exception as error:
        raise upstream_error(error) from error


@router.get("/favorites/list", response_model=list[str])
async def get_favorites() -> list[str]:
    return favorites.copy()


@router.post("/favorites", response_model=FavoritesResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(stock: FavoriteStock) -> FavoritesResponse:
    if stock.symbol not in favorites:
        favorites.append(stock.symbol)
    return FavoritesResponse(message="Agregado a favoritos", favorites=favorites.copy())


@router.delete("/favorites/{symbol}", response_model=FavoritesResponse)
async def remove_favorite(symbol: str) -> FavoritesResponse:
    normalized = symbol.upper()
    if normalized in favorites:
        favorites.remove(normalized)
    return FavoritesResponse(message="Eliminado de favoritos", favorites=favorites.copy())


@router.get("/{symbol}/quote")
async def get_stock_quote(symbol: str):
    try:
        return await alpha_vantage_service.get_quote(symbol)
    except Exception as error:
        raise upstream_error(error) from error


@router.get("/{symbol}/history")
async def get_stock_history(symbol: str):
    try:
        return await alpha_vantage_service.get_daily_history(symbol)
    except Exception as error:
        raise upstream_error(error) from error
