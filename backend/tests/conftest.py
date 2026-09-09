import os


# Configuration is instantiated while application modules are imported during
# collection, so tests provide a deterministic key before those imports occur.
os.environ.setdefault("ALPHA_VANTAGE_API_KEY", "test-key")
