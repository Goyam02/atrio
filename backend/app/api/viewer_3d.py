# app/api/viewer_3d.py
from fastapi import APIRouter

router = APIRouter(tags=["3D Viewer"])

@router.get("/3d/{patient_id}/{image_id}")
def get_3d_view(patient_id: str, image_id: str):
    return {
        "mesh_url": f"/3d/{patient_id}/{image_id}.glb"
    }
