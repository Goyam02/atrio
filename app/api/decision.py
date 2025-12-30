# app/api/decision.py
from fastapi import APIRouter
from app.schemas.findings import AcceptRequest
from app.schemas.feedback import RejectRequest


router = APIRouter(tags=["Decision"])

@router.post("/accept")
def accept_findings(payload: AcceptRequest):
    """
    Locks findings & generates report draft
    """
    return {"status": "accepted"}

@router.post("/reject")
def reject_findings(payload: RejectRequest):
    """
    Payload:
    - reason (text)
    - optional audio
    """
    return {"status": "rejected", "action": "re-evaluate"}
