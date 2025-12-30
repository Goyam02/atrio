from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.db.session import get_db
from app.services.report_service import generate_report_for_study

router = APIRouter(tags=["Report"])

@router.post("/studies/{study_id}/report")
async def generate_report(
    study_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await generate_report_for_study(db, study_id)
        return {
            "study_id": result["study_id"],
            "status": "report generated",
            "summary": result["summary"],
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
