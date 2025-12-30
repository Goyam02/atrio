from fastapi import APIRouter, UploadFile, File, Query, Depends, HTTPException
from typing import List
from pathlib import Path
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.patient import Patient
from app.services.upload_service import create_study_and_images
from app.core.config import settings

router = APIRouter(tags=["Upload"])

@router.post("/upload-batch")
async def upload_dicom_batch(
    patient_id: str = Query(...),
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
):
    # 1️⃣ Validate patient
    patient = await db.get(Patient, uuid.UUID(patient_id))
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # 2️⃣ Save files to disk
    patient_dir = Path(settings.DICOM_STORAGE_PATH) / patient_id
    patient_dir.mkdir(parents=True, exist_ok=True)

    file_paths = []
    for file in files:
        file_path = patient_dir / f"{uuid.uuid4()}_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
        file_paths.append(str(file_path))

    # 3️⃣ Persist study + images in DB
    study, images = await create_study_and_images(
        db=db,
        patient_id=patient.id,
        file_paths=file_paths,
    )

    return {
        "patient_id": patient_id,
        "study_id": str(study.id),
        "uploaded": len(images),
        "images": [
            {
                "image_id": str(img.id),
                "file_path": img.file_path,
            }
            for img in images
        ],
    }
