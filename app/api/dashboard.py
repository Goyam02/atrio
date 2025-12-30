# app/api/dashboard.py
from fastapi import APIRouter

router = APIRouter(tags=["Dashboard"])

@router.get("/")
def dashboard():
    """
    Returns:
    - patients
    - uploaded scans
    - inference status
    - reports
    """
    return {"patients": [], "reports": []}
