from pydantic import BaseModel
from uuid import UUID

class CreatePatientRequest(BaseModel):
    name: str


class PatientResponse(BaseModel):
    id: UUID
    name: str
