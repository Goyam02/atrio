# app/schemas/dashboard.py
from pydantic import BaseModel
from typing import List

class DashboardPatient(BaseModel):
    patient_id: str
    name: str
    scans: int
    inference_status: str
    decision_status: str       # NEW
    report_generated: bool


class DashboardResponse(BaseModel):
    patients: List[DashboardPatient]
