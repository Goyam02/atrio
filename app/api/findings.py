from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.db.session import get_db
from app.models.image import Image
from app.models.finding import Finding

router = APIRouter(tags=["Findings"])

@router.get("/studies/{study_id}/findings-view")
async def findings_summary(
    study_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Image.id, Finding.artery, Finding.blockage_pct, Finding.confidence)
        .join(Finding, Finding.image_id == Image.id)
        .where(Image.study_id == study_id)
    )

    rows = (await db.execute(stmt)).all()

    return {
        "study_id": str(study_id),
        "images": [
            {
                "image_id": str(r.id),
                "artery": r.artery,
                "blockage_pct": r.blockage_pct,
                "confidence": r.confidence,
            }
            for r in rows
        ],
    }
