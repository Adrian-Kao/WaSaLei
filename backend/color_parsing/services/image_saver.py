import cv2
import os

OUTPUT_DIR = "outputs"


def save_image(image, filename):
    path = os.path.join(OUTPUT_DIR, filename)

    cv2.imwrite(path, image)

    return path