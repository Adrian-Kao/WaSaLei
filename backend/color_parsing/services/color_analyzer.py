import cv2
import numpy as np
from sklearn.cluster import KMeans
from services.color_mapper import map_color


def analyze_colors(image, mask, k=3, min_ratio=0.05):
    # 1. 套 mask
    pixels = image[mask > 0]

    if len(pixels) == 0:
        return [None, None, None]

    # 2. reshape
    pixels = pixels.reshape(-1, 3)

    # 3. KMeans
    kmeans = KMeans(n_clusters=k, n_init=10)
    kmeans.fit(pixels)

    centers = kmeans.cluster_centers_
    labels = kmeans.labels_

    # 4. 統計比例
    counts = np.bincount(labels)
    total = len(labels)

    results = []
    for i in range(len(centers)):
        ratio = counts[i] / total
        if ratio < min_ratio:
            continue

        color_name = map_color(centers[i])
        results.append((color_name, ratio))

    # 5. 排序
    results = sorted(results, key=lambda x: x[1], reverse=True)

    # 6. 補 NULL
    final = []
    for i in range(3):
        if i < len(results):
            final.append({
                "color": results[i][0],
                "percent": round(results[i][1] * 100, 1)
            })
        else:
            final.append({
                "color": None,
                "percent": None
            })

    return final