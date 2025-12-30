from sqlalchemy import Column, Integer, Float, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Finding(Base):
    __tablename__ = "findings"

    image_id = Column(
        UUID(as_uuid=True),
        ForeignKey("images.id"),
        primary_key=True,
    )

    artery = Column(Text, nullable=False)
    blockage_pct = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=False)

    explanation = Column(Text, nullable=True)
    heatmap_path = Column(Text, nullable=True)
