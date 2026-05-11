import time
from typing import Any


class MemoryCache:
    def __init__(self):
        self.cache: dict[str, dict[str, Any]] = {}

    def get(self, key: str):
        item = self.cache.get(key)

        if not item:
            return None

        expires_at = item["expires_at"]

        if time.time() > expires_at:
            del self.cache[key]
            return None

        return item["value"]

    def set(self, key: str, value: Any, ttl_seconds: int):
        self.cache[key] = {
            "value": value,
            "expires_at": time.time() + ttl_seconds
        }


memory_cache = MemoryCache()