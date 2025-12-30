# app/api/findings.py
from fastapi import APIRouter

router = APIRouter(tags=["Findings"])

@router.get("/{patient_id}/findings-view")
def list_findings(patient_id: str):
    return {
        "images": [
            {
                "image_id": "img_01",
                "blockage_pct": 72,
                "artery": "LAD"
            }
        ]
    }

@router.get("/{patient_id}/findings-view/{image_id}")
def view_finding(patient_id: str, image_id: str):
    return {
        "image_id": image_id,
        "artery": "RCA",
        "blockage_pct": 65,
        "heatmap_url": "/static/heatmaps/img_01.png",
        "explanation": "Model focused on proximal stenosis"
    }
