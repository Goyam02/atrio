from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.db.session import get_db
from app.schemas.patient import CreatePatientRequest, PatientResponse
from app.services.patient_service import create_patient, get_patient

router = APIRouter(tags=["Patients"])

@router.post("/patients", response_model=PatientResponse)
async def add_patient(
    payload: CreatePatientRequest,
    db: AsyncSession = Depends(get_db),
):
    patient = await create_patient(db, payload.name)
    return PatientResponse(id=patient.id, name=patient.name)


@router.get("/patients/{patient_id}", response_model=PatientResponse)
async def fetch_patient(
    patient_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    patient = await get_patient(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientResponse(id=patient.id, name=patient.name)
