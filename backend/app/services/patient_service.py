import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.patient import Patient

async def create_patient(db: AsyncSession, name: str) -> Patient:
    patient = Patient(
        id=uuid.uuid4(),
        name=name,
    )
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient


async def get_patient(db: AsyncSession, patient_id: uuid.UUID) -> Patient | None:
    return await db.get(Patient, patient_id)
