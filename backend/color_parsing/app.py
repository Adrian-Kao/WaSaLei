import os
import sys

import cv2
import numpy as np

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# 讓 color_parsing 內部的 models/services 優先被找到，避免撞到 backend/services。
if CURRENT_DIR in sys.path:
    sys.path.remove(CURRENT_DIR)
sys.path.insert(0, CURRENT_DIR)

from color_parsing.models.router import route
from color_parsing.services.garment_pipeline import process_garment
from color_parsing.services.person_pipline import process_person

DEFAULT_OUTPUT_DIR = os.path.join(CURRENT_DIR, "outputs")
DEFAULT_OUTPUT_FILENAME = "output.png"


def run_color_parsing(
    image_path,
    mode="garment",
    output_dir=DEFAULT_OUTPUT_DIR,
    output_filename=DEFAULT_OUTPUT_FILENAME,
):
    """
    讀取圖片，執行去背與顏色辨識，並把去背結果存到 output_dir。
    """
    image = read_image(image_path)
    if image is None:
        raise FileNotFoundError(f"Image not found or unreadable: {image_path}")

    # 目前 MVP 預設走 garment；保留 route 方便之後擴充 person 模式。
    task = route(image, mode)

    if task == "garment":
        result = process_garment(
            image,
            output_filename,
            output_dir=output_dir,
        )
    else:
        # person 模式目前只回傳上下身顏色，尚未輸出去背預覽圖。
        result = {
            "image_path": None,
            "colors": process_person(image),
        }

    return {
        "task": task,
        **result,
    }


def get_color_values(
    image_path,
    mode="garment",
    output_dir=DEFAULT_OUTPUT_DIR,
    output_filename=DEFAULT_OUTPUT_FILENAME,
):
    # 給只需要顏色資料的後端流程使用。
    result = run_color_parsing(
        image_path=image_path,
        mode=mode,
        output_dir=output_dir,
        output_filename=output_filename,
    )
    return result["colors"]


def read_image(image_path):
    # cv2.imread 在 Windows 中文路徑可能讀不到，改用 imdecode 支援 Unicode 路徑。
    image_bytes = np.fromfile(image_path, dtype=np.uint8)
    if len(image_bytes) == 0:
        return None
    return cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)


def main(image_path="test_images/test.jpg", mode="garment"):
    result = run_color_parsing(image_path, mode=mode)

    print(result)
    return result


if __name__ == "__main__":
    main()
