from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from db.session import get_db
from models.image import Image
from models.finding import Finding

router = APIRouter(tags=["Findings"])

@router.get("/studies/{study_id}/findings-view")
async def findings_summary(
    study_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(
            Image.id,
            Image.file_path,
            Finding.artery,
            Finding.blockage_pct,
            Finding.confidence,
            Finding.heatmap_path,
        )
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

                # 👇 THIS is the key part
                "image_path": f"/{r.file_path}",
                "heatmap_path": f"/{r.heatmap_path}" if r.heatmap_path else None,
            }
            for r in rows
        ],
    }
