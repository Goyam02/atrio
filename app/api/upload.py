# app/api/upload.py
from fastapi import APIRouter, UploadFile, File, Query, HTTPException
from typing import List
from pathlib import Path
from app.db.memory import patients, create_image
from app.core.config import settings

router = APIRouter(tags=["Upload"])

@router.post("/upload-batch")
async def upload_dicom_batch(
    patient_id: str = Query(...),
    files: List[UploadFile] = File(...)
):
    if patient_id not in patients:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient_dir = Path(settings.DICOM_STORAGE_PATH) / patient_id
    patient_dir.mkdir(parents=True, exist_ok=True)

    uploaded_images = []

    for file in files:
        file_path = patient_dir / file.filename

        with open(file_path, "wb") as f:
            f.write(await file.read())

        image_id = create_image(
            patient_id=patient_id,
            file_path=str(file_path)
        )

        uploaded_images.append({
            "image_id": image_id,
            "filename": file.filename
        })

    return {
        "patient_id": patient_id,
        "uploaded": len(uploaded_images),
        "images": uploaded_images
    }
