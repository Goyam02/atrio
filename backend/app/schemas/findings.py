# app/schemas/findings.py
from pydantic import BaseModel
from typing import Optional, List

class ImageFinding(BaseModel):
    image_id: str
    artery: Optional[str]
    blockage_pct: Optional[int]
    confidence: Optional[float]

class FindingsSummaryResponse(BaseModel):
    patient_id: str
    images: List[ImageFinding]


class FindingDetailResponse(BaseModel):
    image_id: str
    artery: str
    blockage_pct: int
    confidence: float
    explanation: str
    heatmap_path: str
