from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from app.models.image import Image
from app.models.finding import Finding
from app.services.stenosis_pipeline.pipeline import run_stenosis_pipeline
import os


async def run_inference_for_study(db, study_id):
    images = (
        await db.execute(
            select(Image).where(Image.study_id == study_id)
        )
    ).scalars().all()

    for img in images:
        with open(img.file_path, "rb") as f:
            image_bytes = f.read()

        result = run_stenosis_pipeline(
            image_bytes=image_bytes,
            image_name=os.path.basename(img.file_path),
        )

        if not result:
            continue

        # ✅ Fallback rule applied HERE
        blockage_pct = result["stenosis_percent"]
        if blockage_pct is None:
            blockage_pct = 0

        stmt = (
            insert(Finding)
            .values(
                image_id=img.id,
                artery=result["artery"] or "Unknown",
                blockage_pct=blockage_pct,
                confidence=result["confidence"],
                explanation="YOLO + segmentation pipeline",
                heatmap_path=result["yolo_visual_path"],
            )
            .on_conflict_do_update(
                index_elements=[Finding.image_id],
                set_={
                    "artery": result["artery"] or "Unknown",
                    "blockage_pct": blockage_pct,
                    "confidence": result["confidence"],
                    "heatmap_path": result["yolo_visual_path"],
                },
            )
        )
        await db.execute(stmt)

    await db.commit()
