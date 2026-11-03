from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, init_db
from app.routers import auth, ai_vault, help_desks, tickets, ai_context

# Initialize tables & migrations
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend REST API para CaseFlow — Plataforma Inteligente Multi-Tenant de Mesas de Ayuda con Arquitectura BYOK.",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(ai_vault.router, prefix=settings.API_V1_STR)
app.include_router(help_desks.router, prefix=settings.API_V1_STR)
app.include_router(tickets.router, prefix=settings.API_V1_STR)
app.include_router(ai_context.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": "CaseFlow API",
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/api/docs",
        "byok_supported": ["gemini", "openai", "claude"]
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "timestamp": "2026-11-03T17:05:00Z",
        "service": "CaseFlow REST Engine",
        "version": "1.0.0"
    }
