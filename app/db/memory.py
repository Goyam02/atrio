# app/db/memory.py
import uuid

patients = {
    "p_001": {
        "patient_id": "p_001",
        "name": "John Doe",
        "scans": [],
        "inference_status": "not_started",
        "report_generated": False,
    }
}

images = {
    # image_id: {
    #   image_id,
    #   patient_id,
    #   file_path,
    #   findings,
    # }
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
