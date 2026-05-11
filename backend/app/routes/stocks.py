from fastapi import APIRouter, HTTPException

from app.services.alpha_vantage_service import alpha_vantage_service
from app.models.stock_models import FavoriteStock

router = APIRouter(
    prefix="/stocks",
    tags=["Stocks"]
)

favorites: list[str] = []


@router.get("/search")
async def search_stocks(query: str):
    try:
        return await alpha_vantage_service.search_symbol(query)
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))


@router.get("/{symbol}/quote")
async def get_stock_quote(symbol: str):
    try:
        return await alpha_vantage_service.get_quote(symbol)
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))


@router.get("/{symbol}/history")
async def get_stock_history(symbol: str):
    try:
        return await alpha_vantage_service.get_daily_history(symbol)
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))


@router.get("/favorites/list")
async def get_favorites():
    return favorites


@router.post("/favorites")
async def add_favorite(stock: FavoriteStock):
    symbol = stock.symbol.upper()

    if symbol not in favorites:
        favorites.append(symbol)

    return {
        "message": "Agregado a favoritos",
        "favorites": favorites
    }


@router.delete("/favorites/{symbol}")
async def remove_favorite(symbol: str):
    symbol = symbol.upper()

    if symbol in favorites:
        favorites.remove(symbol)

    return {
        "message": "Eliminado de favoritos",
        "favorites": favorites
    }