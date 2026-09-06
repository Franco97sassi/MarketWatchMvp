from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.stocks import router as stocks_router

app = FastAPI(
    title="MarketWatch API",
    description="API REST para consultar el mercado y administrar una watchlist.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)


@app.get("/health", tags=["Observability"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "version": app.version}


app.include_router(stocks_router)
