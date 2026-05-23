import shutil
import uuid
from pathlib import Path
from PIL import Image, UnidentifiedImageError
from werkzeug.utils import secure_filename

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
PROJECT_DIR = BACKEND_DIR.parent

OUTFITS_PREPARE_DIR = PROJECT_DIR / "pictures" / "Outfits" / "prepare"
OUTFITS_FINAL_DIR = PROJECT_DIR / "pictures" / "Outfits" / "final"

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP"}
MAX_IMAGE_PIXELS = 50_000_000
# 建立穿搭圖片資料夾。
def ensure_outfit_folders():
    for folder in (OUTFITS_PREPARE_DIR, OUTFITS_FINAL_DIR):
        folder.mkdir(parents=True, exist_ok=True)
# 移動穿搭圖片到正式區。
def move_outfit_to_final(filename: str) -> Path:
    ensure_outfit_folders()
    safe_filename = secure_filename(filename)
    if not safe_filename or safe_filename != filename:
        raise ValueError("Invalid outfit image filename.")
    src = OUTFITS_PREPARE_DIR / safe_filename
    dst = OUTFITS_FINAL_DIR / safe_filename
    shutil.move(str(src), str(dst))
    return dst
# 儲存穿搭暫存圖片。
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

    try:
        _validate_saved_image(save_path)
    except Exception:
        save_path.unlink(missing_ok=True)
        raise

    return save_path
# 驗證圖片檔案。
def _validate_saved_image(path):
    try:
        with Image.open(path) as image:
            if image.format not in ALLOWED_IMAGE_FORMATS:
                raise ValueError("Only real jpg, png, and webp images are supported.")
            width, height = image.size
            if width <= 0 or height <= 0:
                raise ValueError("Invalid image dimensions.")
            if width * height > MAX_IMAGE_PIXELS:
                raise ValueError("Image dimensions are too large.")
            image.verify()
    except UnidentifiedImageError as exc:
        raise ValueError("Uploaded file is not a valid image.") from exc
