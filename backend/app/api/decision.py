from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from db.session import get_db
from models.study import Study
from services.decision_service import accept_study, reject_study

router = APIRouter(tags=["Decision"])

@router.post("/studies/{study_id}/accept")
async def accept(
    study_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    study = await db.get(Study, study_id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    await accept_study(db, study_id)
    return {"study_id": str(study_id), "status": "accepted"}


@router.post("/studies/{study_id}/reject")
async def reject(
    study_id: UUID,
    reason: str,
    db: AsyncSession = Depends(get_db),
):
    study = await db.get(Study, study_id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    await reject_study(db, study_id, reason)
    return {"study_id": str(study_id), "status": "rejected", "reason": reason}
