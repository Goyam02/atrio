# app/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from api.router import router
from core.config import settings

app = FastAPI(
    title="Angio AI Platform",
    description="AI-assisted angiography analysis & reporting",
    version="0.1.0"
)

# Register routes
app.include_router(router)

app.mount("/storage", StaticFiles(directory="storage"), name="storage")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","*"],  # or ["*"] for dev
    allow_credentials=True,
    allow_methods=["*"],   # VERY IMPORTANT
    allow_headers=["*"],
)
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "angio-ai",
        "env": settings.ENV
    }
