# app/api/dashboard.py
from fastapi import APIRouter
from app.db.memory import patients
from app.schemas.dashboard import DashboardResponse, DashboardPatient

router = APIRouter(tags=["Dashboard"])

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard():
    result = []

    for patient in patients.values():
        result.append(
            DashboardPatient(
                patient_id=patient["patient_id"],
                name=patient["name"],
                scans=len(patient["scans"]),
                inference_status=patient["inference_status"],
                report_generated=patient["report_generated"],
            )
        )

    return DashboardResponse(patients=result)
