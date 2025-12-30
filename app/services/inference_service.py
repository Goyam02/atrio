import random
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from app.models.image import Image
from app.models.finding import Finding

ARTERIES = ["LAD", "RCA", "LCX"]

async def run_inference_for_study(
    db: AsyncSession,
    study_id,
):
    result = await db.execute(
        select(Image).where(Image.study_id == study_id)
    )
    images = result.scalars().all()

    for image in images:
        stmt = (
            insert(Finding)
            .values(
                image_id=image.id,
                artery=random.choice(ARTERIES),
                blockage_pct=random.randint(20, 90),
                confidence=round(random.uniform(0.7, 0.99), 2),
                explanation="Model focused on proximal vessel narrowing",
                heatmap_path="/static/mock_heatmap.png",
            )
            .on_conflict_do_update(
                index_elements=[Finding.image_id],
                set_={
                    "artery": random.choice(ARTERIES),
                    "blockage_pct": random.randint(20, 90),
                    "confidence": round(random.uniform(0.7, 0.99), 2),
                    "explanation": "Model focused on proximal vessel narrowing",
                    "heatmap_path": "/static/mock_heatmap.png",
                },
            )
        )

        await db.execute(stmt)

    await db.commit()
