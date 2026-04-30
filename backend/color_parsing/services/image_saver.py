import cv2
import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "outputs")


def save_image(image, filename, output_dir=OUTPUT_DIR):
    # output_dir 可由後端指定；未指定時使用 color_parsing 自己的 outputs 資料夾。
    if output_dir is None:
        output_dir = OUTPUT_DIR

    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, filename)

    # OpenCV 寫檔使用 BGR，這裡把 RGB 圖片轉成 BGR 後再儲存。
    image_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    # cv2.imwrite 在 Windows 中文路徑可能失敗，改用 imencode + tofile。
    ext = os.path.splitext(filename)[1] or ".png"
    success, encoded_image = cv2.imencode(ext, image_bgr)
    if not success:
        raise ValueError(f"Failed to encode image: {filename}")
    encoded_image.tofile(path)

    return path
