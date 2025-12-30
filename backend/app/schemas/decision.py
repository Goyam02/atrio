# app/schemas/decision.py
from pydantic import BaseModel
from typing import Optional

class AcceptRequest(BaseModel):
    patient_id: str


class RejectRequest(BaseModel):
    patient_id: str
    reason: str
