import cv2
import numpy as np

def map_color_lab(rgb):
    min_dist = float('inf')
    best_name = "未知"
    
    rgb_pixel = np.float32([[rgb]]) / 255.0
    lab_pixel = cv2.cvtColor(rgb_pixel, cv2.COLOR_RGB2Lab)[0][0]

    # 3. 調整權重 (加強對色調 a, b 的敏感度)
    # 人眼對顏色的「種類」比「明暗」敏感，所以我們把 a, b 的權重調高
    weight = np.array([1.0, 1.8, 1.8]) # L 權重 1, a 權重 1.8, b 權重 1.8

    for name, lab_val in COLOR_LIBRARY_LAB.items():
        # 計算歐幾里德距離 (Delta E)
        dist = np.linalg.norm((lab_pixel - np.array(lab_val)) * weight)
        if dist < min_dist:
            min_dist = dist
            best_name = name
            
    return best_name

COLOR_LIBRARY_LAB = {
    "白色": [100, 0, 0],
    "灰色": [50, 0, 0],
    "黑色": [0, 0, 0],
    "紅色": [50, 75, 60],
    "粉紅色": [80, 25, 10],
    "橘色": [65, 45, 70],
    "黃色": [90, -5, 85],
    "米色": [90, 2, 15],
    "卡其色": [75, 5, 25],
    "棕色": [30, 20, 30],
    "綠色": [50, -60, 45],
    "藍綠色": [50, -40, -15],
    "藍色": [30, 15, -60],
    "紫色": [35, 65, -55]
}