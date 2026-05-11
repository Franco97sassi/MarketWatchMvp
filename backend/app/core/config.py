from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    alpha_vantage_api_key: str
    alpha_vantage_base_url: str = "https://www.alphavantage.co/query"
    cache_ttl_seconds: int = 300

    class Config:
        env_file = ".env"


settings = Settings()