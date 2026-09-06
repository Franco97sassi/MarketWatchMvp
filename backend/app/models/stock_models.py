from pydantic import BaseModel, ConfigDict, Field, field_validator


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
    model_config = ConfigDict(str_strip_whitespace=True)
    symbol: str = Field(min_length=1, max_length=15, pattern=r"^[A-Za-z0-9.\-]+$")

    @field_validator("symbol")
    @classmethod
    def normalize_symbol(cls, value: str) -> str:
        return value.upper()


class FavoritesResponse(BaseModel):
    message: str
    favorites: list[str]
