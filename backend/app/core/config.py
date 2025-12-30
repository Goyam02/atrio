# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENV: str = "dev"
    PROJECT_NAME: str = "Angio AI"
    DATABASE_URL: str

    DICOM_STORAGE_PATH: str = "storage/dicom"
    REPORT_STORAGE_PATH: str = "storage/reports"

    model_config = {
        "env_file": ".env"
    }

settings = Settings()
