from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.db.session import get_db
from app.models.study import Study
from app.services.inference_service import run_inference_for_study

router = APIRouter(tags=["Inference"])

@router.post("/studies/{study_id}/run-inference")
async def run_inference(
    study_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    study = await db.get(Study, study_id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    await run_inference_for_study(db, study_id)

    return {
        "study_id": str(study_id),
        "status": "inference completed",
    }
