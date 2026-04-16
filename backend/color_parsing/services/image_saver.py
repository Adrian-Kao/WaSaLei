import cv2
import os

OUTPUT_DIR = "outputs"


def save_image(image, filename):
    path = os.path.join(OUTPUT_DIR, filename)
    image_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    cv2.imwrite(path, image_bgr)

    return path