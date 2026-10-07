"""
PraetorOps AI — Core Configuration Module.
Follows 12-factor application design, reading settings from environment variables.
Never hardcodes sensitive keys or credentials.
"""

import os
from pydantic import BaseModel, Field

class Settings(BaseModel):
    APP_NAME: str = "PraetorOps AI — Enterprise AI Operations Copilot"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "demo")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Google Cloud & Model Architecture Settings
    GCP_PROJECT: str = os.getenv("GCP_PROJECT", "prj-praetorops-ai-demo")
    GCP_REGION: str = os.getenv("GCP_REGION", "us-central1")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-004")
    
    # Server-side boundary protection (API key never passed to client)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    USE_SYNTHETIC_REASONING: bool = os.getenv("USE_SYNTHETIC_REASONING", "true").lower() == "true"

    # Multi-tenant and Security Settings
    DEFAULT_TENANT_ID: str = os.getenv("DEFAULT_TENANT_ID", "tenant_acme")
    ENABLE_PROMPT_INJECTION_SHIELD: bool = True
    MAX_EVAL_CASES: int = 15

    # Safety Thresholds
    GROUNDING_THRESHOLD: float = 0.85
    SAFETY_BLOCK_ON_SUSPICIOUS: bool = True

settings = Settings()
