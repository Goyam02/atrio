from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db
from schemas.dashboard import DashboardResponse, DashboardPatient
from services.dashboard_service import fetch_dashboard

router = APIRouter(tags=["Dashboard"])

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    rows = await fetch_dashboard(db)

    patients = [
        DashboardPatient(
            patient_id=str(row.patient_id),
            name=row.name,
            scans=row.scans,
            inference_status=row.inference_status,   # ✅ REAL
            decision_status=row.decision_status,     # ✅ REAL
            report_generated=row.report_generated,   # ✅ REAL
        )
        for row in rows
    ]

    return DashboardResponse(patients=patients)
