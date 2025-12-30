from sqlalchemy import Column, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from db.base import Base

class Report(Base):
    __tablename__ = "reports"

    study_id = Column(
        UUID(as_uuid=True),
        ForeignKey("studies.id"),
        primary_key=True,
    )

    summary = Column(Text, nullable=False)
    generated_at = Column(DateTime, server_default=func.now())
