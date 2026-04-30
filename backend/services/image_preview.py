import shutil
import sys
import uuid
from pathlib import Path

from werkzeug.utils import secure_filename

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
PROJECT_DIR = BACKEND_DIR.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.append(str(BACKEND_DIR))

from database import db

# pictures is at the project root, next to frontend and backend.
PICTURES_DIR = PROJECT_DIR / "pictures"
INPUT_DIR = PICTURES_DIR / "input"
OUTPUT_DIR = PICTURES_DIR / "output"
FINAL_DIR = PICTURES_DIR / "final"

OUTPUT_FILENAME = "output.png"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


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

    return _to_project_relative_path(input_path)


def parse_current_input_image(mode="garment"):
    input_path = get_current_input_image()

    # rembg/onnxruntime is heavy, so import only when parsing is requested.
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
    season,
    color_ids=None,
    style_ids=None,
):
    if color_ids is None:
        color_ids = []
    if style_ids is None:
        style_ids = []
    if not str(name or "").strip():
        raise ValueError("Item name is required.")

    final_path = move_output_to_final()
    photo_path = _to_project_relative_path(final_path)

    try:
        success, result = db.insert_new_item(
            user_id=user_id,
            name=name,
            space_id=space_id,
            type_id=type_id,
            season=season,
            color_ids=color_ids,
            style_ids=style_ids,
            photo_path=photo_path,
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


def _to_project_relative_path(path):
    return Path(path).resolve().relative_to(PROJECT_DIR).as_posix()
