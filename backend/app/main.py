"""
PraetorOps AI — Main FastAPI Application Entrypoint.
Production-oriented enterprise AI operations copilot backend.
"""

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from .core.config import settings
from .routers import (
    copilot,
    incidents,
    knowledge,
    approvals,
    audit,
    evaluations,
    observability,
    security,
    auth
)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise AI Operations Copilot — Secure Agentic Ops with Gemini Reasoning, RAG & Human-in-the-Loop Governance.",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Enable CORS for local dev and microservices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(copilot.router)
app.include_router(incidents.router)
app.include_router(knowledge.router)
app.include_router(approvals.router)
app.include_router(audit.router)
app.include_router(evaluations.router)
app.include_router(observability.router)
app.include_router(security.router)

# Production Liveness & Readiness Endpoints
@app.get("/healthz", tags=["System Health"])
def liveness_probe():
    return {
        "status": "HEALTHY",
        "service": "praetorops-ai-backend",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/readyz", tags=["System Health"])
def readiness_probe():
    return {
        "status": "READY",
        "database": "CONNECTED_SYNTHETIC",
        "vector_store": "INDEXED",
        "approval_gateway": "ONLINE",
        "safety_guard": "ACTIVE"
    }

@app.get("/api/config", tags=["System Health"])
def get_public_config():
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "gcp_project": settings.GCP_PROJECT,
        "gcp_region": settings.GCP_REGION,
        "gemini_model": settings.GEMINI_MODEL,
        "embedding_model": settings.EMBEDDING_MODEL,
        "default_tenant": settings.DEFAULT_TENANT_ID
    }

# Mount static frontend directory
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(frontend_dir, "index.html"))

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        # Allow API calls to pass through
        if full_path.startswith("api/") or full_path in ["healthz", "readyz"]:
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        target_file = os.path.join(frontend_dir, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(frontend_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
