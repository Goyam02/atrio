# app/api/router.py
from fastapi import APIRouter
from app.api import dashboard, upload, inference, findings, decision, report, patient

router = APIRouter()
router.include_router(patient.router)
router.include_router(dashboard.router)
router.include_router(upload.router)
router.include_router(inference.router)
router.include_router(findings.router)
router.include_router(decision.router)
router.include_router(report.router)