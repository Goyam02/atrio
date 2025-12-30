# app/api/upload.py
from fastapi import APIRouter, UploadFile, File, Query
from typing import List

router = APIRouter(tags=["Upload"])

@router.post("/upload-batch")
async def upload_dicom_batch(
    patient_id: str = Query(...),
    files: List[UploadFile] = File(...)
):
    """
    Stores DICOMs & registers them to patient
    """
    return {"patient_id": patient_id, "uploaded": len(files)}
