import cv2
import numpy as np


def map_color(rgb):
    rgb = np.uint8([[rgb]])
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)[0][0]

    h, s, v = hsv

    # 黑白灰
    if v < 50:
        return "black"
    if s < 40 and v > 200:
        return "white"
    if s < 40:
        return "gray"

    # 顏色（Hue）
    if h < 10 or h > 170:
        return "red"
    elif h < 25:
        return "orange"
    elif h < 35:
        return "yellow"
    elif h < 85:
        return "green"
    elif h < 130:
        return "blue"
    elif h < 160:
        return "purple"
    else:
        return "pink"