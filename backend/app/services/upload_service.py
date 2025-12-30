import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.study import Study
from app.models.image import Image


async def create_study_and_images(
    db: AsyncSession,
    patient_id: uuid.UUID,
    file_paths: list[str],
):
    study = Study(
        id=uuid.uuid4(),
        patient_id=patient_id,
    )
    db.add(study)
    await db.flush()  # ensures study.id exists

    images = []
    for path in file_paths:
        img = Image(
            id=uuid.uuid4(),
            study_id=study.id,
            file_path=path,
        )
        db.add(img)
        images.append(img)

    await db.commit()
    return study, images
