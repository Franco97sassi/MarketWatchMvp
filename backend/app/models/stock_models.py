from pydantic import BaseModel
from typing import List


class StockQuote(BaseModel):
    symbol: str
    price: float
    change: float
    change_percent: str
    open: float
    high: float
    low: float
    volume: int


class StockHistoryItem(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class StockSearchItem(BaseModel):
    symbol: str
    name: str
    type: str
    region: str
    currency: str


class FavoriteStock(BaseModel):
    symbol: str