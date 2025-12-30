# app/api/router.py
from fastapi import APIRouter
from app.api import dashboard, upload

router = APIRouter()
router.include_router(dashboard.router)
router.include_router(upload.router)
