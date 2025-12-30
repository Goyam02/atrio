import os
import cv2
import uuid
import numpy as np
from .yolo_service import detect_stenosis
from .roi_service import extract_roi
from .mask_service import segment_lumen
from .stenosis_service import compute_stenosis

RESULTS_DIR = "storage/results/visuals"
os.makedirs("storage/results/yolo_detections", exist_ok=True)


def run_stenosis_pipeline(image_bytes: bytes, image_name: str):
    yolo_out = detect_stenosis(image_bytes)
    # Decode original image
    full_img = cv2.imdecode(
        np.frombuffer(image_bytes, np.uint8),
        cv2.IMREAD_COLOR
    )

    yolo_vis_name = None

    if yolo_out["detected"]:
        x1, y1, x2, y2 = map(int, yolo_out["box"])
        cv2.rectangle(full_img, (x1, y1), (x2, y2), (0, 0, 255), 3)

        yolo_vis_name = f"{uuid.uuid4()}_yolo.png"
        yolo_vis_path = f"storage/results/yolo_detections/{yolo_vis_name}"
        cv2.imwrite(yolo_vis_path, full_img)


    if not yolo_out["detected"]:
        return None

    roi, meta = extract_roi(image_bytes, yolo_out, image_name)
    mask = segment_lumen(roi, image_name)
    result = compute_stenosis(roi, mask, meta)

    os.makedirs(RESULTS_DIR, exist_ok=True)

    visual_name = f"{uuid.uuid4()}_visual.png"
    visual_path = os.path.join(RESULTS_DIR, visual_name)
    cv2.imwrite(visual_path, result["visual"])

    return {
        "artery": result["artery"],
        "stenosis_percent": result["percent"],
        "severity": result["severity"],
        "confidence": yolo_out["confidence"],
        "visual_path": visual_path,
        "yolo_visual_path": yolo_vis_path
    }
