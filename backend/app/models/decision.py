from sqlalchemy import Column, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from db.base import Base

class Decision(Base):
    __tablename__ = "decisions"

    study_id = Column(
        UUID(as_uuid=True),
        ForeignKey("studies.id"),
        primary_key=True,
    )

    status = Column(Text, nullable=False)  # pending | accepted | rejected
    feedback = Column(Text, nullable=True)
    decided_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'accepted', 'rejected')",
            name="decision_status_check",
        ),
    )
