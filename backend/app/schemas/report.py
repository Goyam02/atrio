# app/schemas/report.py
from pydantic import BaseModel
from typing import List

class ReportFinding(BaseModel):
    image_id: str
    artery: str
    blockage_pct: int
    confidence: float


class ReportResponse(BaseModel):
    patient_id: str
    summary: str
    findings: List[ReportFinding]
    generated: bool
