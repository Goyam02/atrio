from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from app.models.decision import Decision
from app.models.finding import Finding
from app.models.image import Image
from app.models.report import Report


async def generate_report_for_study(db: AsyncSession, study_id):
    # 1️⃣ Ensure study is accepted
    result = await db.execute(
        select(Decision).where(Decision.study_id == study_id)
    )
    decision = result.scalar_one_or_none()

    if not decision:
        raise ValueError("No decision found for study")

    if decision.status != "accepted":
        raise ValueError(f"Study not accepted (status={decision.status})")

    # 2️⃣ Fetch findings for THIS study (CORRECT JOIN)
    result = await db.execute(
        select(Finding)
        .join(Image, Finding.image_id == Image.id)
        .where(Image.study_id == study_id)
    )
    findings = result.scalars().all()

    if not findings:
        raise ValueError("No findings available")

    # 3️⃣ Deterministic summary
    max_blockage = max(f.blockage_pct for f in findings)
    summary = f"Maximum detected coronary stenosis: {max_blockage}%."

    # 4️⃣ UPSERT report (idempotent)
    stmt = (
        insert(Report)
        .values(
            study_id=study_id,
            summary=summary,
        )
        .on_conflict_do_update(
            index_elements=[Report.study_id],
            set_={"summary": summary},
        )
    )

    await db.execute(stmt)
    await db.commit()

    return {
        "study_id": str(study_id),
        "summary": summary,
    }
