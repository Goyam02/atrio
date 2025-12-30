# app/api/inference.py
from fastapi import APIRouter

router = APIRouter(tags=["Inference"])

@router.post("/{patient_id}/run-inference")
def run_inference(patient_id: str):
    """
    - vessel segmentation
    - blockage detection
    - artery classification
    - explainability
    """
    return {"status": "inference started"}
