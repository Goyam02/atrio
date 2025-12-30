from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

async def fetch_dashboard(db: AsyncSession):
    query = text("""
        SELECT
            p.id AS patient_id,
            p.name AS name,
            COUNT(i.id) AS scans,

            CASE
                WHEN COUNT(f.image_id) > 0 THEN 'completed'
                ELSE 'not_started'
            END AS inference_status,

            COALESCE(d.status, 'pending') AS decision_status,

            CASE
                WHEN r.study_id IS NOT NULL THEN true
                ELSE false
            END AS report_generated

        FROM patients p
        LEFT JOIN studies s ON s.patient_id = p.id
        LEFT JOIN images i ON i.study_id = s.id
        LEFT JOIN findings f ON f.image_id = i.id
        LEFT JOIN decisions d ON d.study_id = s.id
        LEFT JOIN reports r ON r.study_id = s.id

        GROUP BY p.id, p.name, d.status, r.study_id
        ORDER BY p.created_at DESC
    """)

    result = await db.execute(query)
    return result.fetchall()
