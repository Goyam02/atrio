# app/api/report.py
from fastapi import APIRouter

router = APIRouter(tags=["Report"])

@router.get("/report")
def generate_report(patient_id: str):
    return {
        "report_url": f"/reports/{patient_id}.pdf"
    }
