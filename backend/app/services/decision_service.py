from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.decision import Decision

async def accept_study(db: AsyncSession, study_id):
    result = await db.execute(
        select(Decision).where(Decision.study_id == study_id)
    )
    decision = result.scalar_one_or_none()

    if decision:
        # UPDATE
        decision.status = "accepted"
        decision.feedback = None
    else:
        # INSERT
        decision = Decision(
            study_id=study_id,
            status="accepted",
            feedback=None,
        )
        db.add(decision)

    await db.commit()


async def reject_study(db: AsyncSession, study_id, reason: str):
    result = await db.execute(
        select(Decision).where(Decision.study_id == study_id)
    )
    decision = result.scalar_one_or_none()

    if decision:
        decision.status = "rejected"
        decision.feedback = reason
    else:
        decision = Decision(
            study_id=study_id,
            status="rejected",
            feedback=reason,
        )
        db.add(decision)

    await db.commit()
