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

    # 顏色（Hue），OpenCV HSV: h ∈ [0, 179]
    if h < 10 or h > 160:
        return "red"
    elif h < 15:
        return "orange"
    elif h < 22:
        return "yellow"
    elif h < 28:
        return "yellow-green"
    elif h < 35:
        return "lime"
    elif h < 65:
        return "green"
    elif h < 80:
        return "teal"
    elif h < 92:
        return "cyan"
    elif h < 100:
        return "sky blue"
    elif h < 115:
        return "blue"
    elif h < 130:
        return "navy"       # 也可叫 indigo
    elif h < 148:
        return "purple"
    elif h < 155:
        return "magenta"
    else:                   # 155–160
        return "pink"