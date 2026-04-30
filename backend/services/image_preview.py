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

# pictures 放在專案根目錄，與 frontend、backend 同一層。
PICTURES_DIR = PROJECT_DIR / "pictures"
INPUT_DIR = PICTURES_DIR / "input"
OUTPUT_DIR = PICTURES_DIR / "output"
FINAL_DIR = PICTURES_DIR / "final"

# input/output 是暫存區，所以固定使用 input.* 和 output.png。
OUTPUT_FILENAME = "output.png"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def ensure_picture_folders():
    # 確保圖片流程需要的三個資料夾都存在。
    for folder in (INPUT_DIR, OUTPUT_DIR, FINAL_DIR):
        folder.mkdir(parents=True, exist_ok=True)


def clear_folder(folder_path):
    # input 和 output 最多只保留一張圖，新流程開始前會先清空。
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

    return input_path


def preview_item_image(file_storage, mode="garment"):
    # 儲存原圖到 pictures/input，再呼叫 color_parsing 產生 pictures/output/output.png。
    input_path = save_upload_to_input(file_storage)

    # rembg/onnxruntime 載入較重，所以延後到真正需要去背時才 import。
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


def move_output_to_final():
    ensure_picture_folders()

    # 使用者確認後，才把暫存 output 搬進 final 長期保存。
    output_path = OUTPUT_DIR / OUTPUT_FILENAME
    if not output_path.exists():
        raise FileNotFoundError("No parsed output image exists. Please preview an image first.")

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
    # 確認階段：搬移圖片、寫入資料庫，成功後清空 input/output。
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
        # 資料庫寫入失敗時，避免留下沒有資料庫紀錄的 final 圖片。
        if final_path.exists():
            final_path.unlink()
        raise

    if not success:
        # 資料庫寫入失敗時，避免留下沒有資料庫紀錄的 final 圖片。
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
    # 回傳給前端和資料庫使用的路徑，以專案根目錄為基準。
    return Path(path).resolve().relative_to(PROJECT_DIR).as_posix()
