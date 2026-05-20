import shutil
import sys
import uuid
from pathlib import Path
from PIL import Image, UnidentifiedImageError
from werkzeug.utils import secure_filename
from services.items import create_item_record

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
PROJECT_DIR = BACKEND_DIR.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.append(str(BACKEND_DIR))

PICTURES_DIR = PROJECT_DIR / "pictures"
INPUT_DIR = PICTURES_DIR / "input"
OUTPUT_DIR = PICTURES_DIR / "output"
FINAL_DIR = PICTURES_DIR / "final"

OUTPUT_FILENAME = "output.png"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP"}
MAX_IMAGE_PIXELS = 50_000_000


def ensure_picture_folders():
    for folder in (INPUT_DIR, OUTPUT_DIR, FINAL_DIR):
        folder.mkdir(parents=True, exist_ok=True)


def clear_folder(folder_path):
    folder = Path(folder_path)
    folder.mkdir(parents=True, exist_ok=True)

    for item in folder.iterdir():
        if item.is_file() or item.is_symlink():
            item.unlink()
        elif item.is_dir():
            shutil.rmtree(item)


def save_upload_to_input(file_storage):
    if file_storage is None or not file_storage.filename:
        raise ValueError("No image file was uploaded.")

    ensure_picture_folders()
    clear_folder(INPUT_DIR)
    clear_folder(OUTPUT_DIR)

    ext = _get_upload_extension(file_storage.filename)
    safe_name = secure_filename(file_storage.filename) or f"input{ext}"
    input_path = INPUT_DIR / f"input{Path(safe_name).suffix.lower()}"
    file_storage.save(input_path)

    try:
        _validate_saved_image(input_path)
    except Exception:
        input_path.unlink(missing_ok=True)
        raise

    return _to_project_relative_path(input_path)


def parse_current_input_image(mode="garment"):
    print("start parse")
    input_path = get_current_input_image()
    print("input_path:", input_path)
    print("before run_color_parsing")
    from color_parsing.app import run_color_parsing

    result = run_color_parsing(
        image_path=str(input_path),
        mode=mode,
        output_dir=str(OUTPUT_DIR),
        output_filename=OUTPUT_FILENAME,
    )

    output_path = Path(result["image_path"])

    return {
        "input_path": _to_project_relative_path(input_path),
        "preview_path": _to_project_relative_path(output_path),
        "preview_url": "/" + _to_project_relative_path(output_path),
        "colors": result["colors"],
    }


def preview_item_image(file_storage, mode="garment"):
    save_upload_to_input(file_storage)
    return parse_current_input_image(mode=mode)


def get_current_input_image():
    ensure_picture_folders()

    input_files = sorted(path for path in INPUT_DIR.iterdir() if path.is_file())
    if not input_files:
        raise FileNotFoundError("No image exists in pictures/input.")
    if len(input_files) > 1:
        raise RuntimeError("pictures/input should contain only one image.")

    return input_files[0]


def move_output_to_final():
    ensure_picture_folders()

    output_path = OUTPUT_DIR / OUTPUT_FILENAME
    if not output_path.exists():
        raise FileNotFoundError("No parsed output image exists. Please parse an image first.")

    final_path = FINAL_DIR / f"{uuid.uuid4().hex}.png"
    shutil.copy2(str(output_path), str(final_path))

    return final_path


def confirm_item_image(
    user_id,
    name,
    space_id,
    type_id,
    season_ids,
    color_ids=None,
    style_ids=None,
    notes=None,
):
    final_path = move_output_to_final()
    photo_path = _to_project_relative_path(final_path)

    try:
        success, result = create_item_record(
            user_id=user_id,
            name=name,
            space_id=space_id,
            type_id=type_id,
            season_ids=season_ids,
            color_ids=color_ids,
            style_ids=style_ids,
            photo_path=photo_path,
            notes=notes,
        )
    except Exception:
        if final_path.exists():
            final_path.unlink()
        raise

    if not success:
        if final_path.exists():
            final_path.unlink()
        raise RuntimeError(result)

    clear_folder(INPUT_DIR)
    clear_folder(OUTPUT_DIR)

    return {
        "item_id": result,
        "photo_path": photo_path,
        "photo_url": "/" + photo_path,
    }


def _get_upload_extension(filename):
    ext = Path(filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("Only jpg, jpeg, png, and webp images are supported.")
    return ext


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


def _to_project_relative_path(path):
    return Path(path).resolve().relative_to(PROJECT_DIR).as_posix()
