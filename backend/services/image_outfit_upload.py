import shutil
import sys
import uuid
from pathlib import Path
from werkzeug.utils import secure_filename

# 專案結構
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
PROJECT_DIR = BACKEND_DIR.parent

# pictures/Outfits/prepare, pictures/Outfits/final
OUTFITS_PREPARE_DIR = PROJECT_DIR / "pictures" / "Outfits" / "prepare"
OUTFITS_FINAL_DIR = PROJECT_DIR / "pictures" / "Outfits" / "final"

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

def ensure_outfit_folders():
    for folder in (OUTFITS_PREPARE_DIR, OUTFITS_FINAL_DIR):
        folder.mkdir(parents=True, exist_ok=True)

def move_outfit_to_final(filename: str) -> Path:
    ensure_outfit_folders()
    src = OUTFITS_PREPARE_DIR / filename
    dst = OUTFITS_FINAL_DIR / filename
    shutil.move(str(src), str(dst))
    return dst

def save_outfit_upload_to_prepare(file_storage):
    if file_storage is None or not file_storage.filename:
        raise ValueError("No image file was uploaded.")
    ensure_outfit_folders()
    ext = Path(file_storage.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("Only jpg, jpeg, png, and webp images are supported.")
    filename = f"{uuid.uuid4().hex}{ext}"
    save_path = OUTFITS_PREPARE_DIR / filename
    file_storage.save(save_path)
    return save_path
