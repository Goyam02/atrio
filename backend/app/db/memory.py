# app/db/memory.py
import uuid
import random

patients = {
    "p_001": {
        "patient_id": "p_001",
        "name": "John Doe",
        "scans": [],
        "inference_status": "not_started",
        "decision_status": "pending",  # NEW
        "decision_feedback": None,     # NEW
        "report_generated": False,
    }
}


images = {
    # image_id -> image metadata
}

def create_image(patient_id: str, file_path: str):
    image_id = str(uuid.uuid4())

    images[image_id] = {
        "image_id": image_id,
        "patient_id": patient_id,
        "file_path": file_path,
        "findings": None,
    }

    patients[patient_id]["scans"].append(image_id)
    return image_id


def generate_mock_findings():
    return {
        "artery": random.choice(["LAD", "RCA", "LCX"]),
        "blockage_pct": random.randint(20, 90),
        "confidence": round(random.uniform(0.7, 0.99), 2),
        "explanation": "Model focused on proximal vessel narrowing",
        "heatmap_path": "/static/mock_heatmap.png",
    }


decisions = {
    # patient_id: {
    #   status: "accepted" | "rejected",
    #   feedback: Optional[str]
    # }
}
