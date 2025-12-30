# app/api/listen.py
from fastapi import APIRouter

router = APIRouter(tags=["Speech"])

@router.post("/listen")
def listen_to_doctor(patient_id: str):
    """
    Streams speech → text → structured notes
    """
    return {"status": "listening"}
