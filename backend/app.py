from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from services.image_preview import (
    PICTURES_DIR,
    confirm_item_image,
    ensure_picture_folders,
    preview_item_image,
)

# Flask 後端主入口，提供前端圖片預覽與確認存檔 API。
app = Flask(__name__)
CORS(app)

# 啟動時確認 pictures/input、pictures/output、pictures/final 都存在。
ensure_picture_folders()


@app.get("/")
def health_check():
    return jsonify({"status": "ok"})


@app.get("/pictures/<path:filename>")
def serve_picture(filename):
    # 讓前端可以透過 /pictures/... 讀取 output 預覽圖和 final 正式圖。
    return send_from_directory(PICTURES_DIR, filename)


@app.post("/api/items/preview-image")
def preview_image():
    # 第一階段：前端上傳圖片，後端放入 input，呼叫 color_parsing 後輸出到 output。
    file_storage = request.files.get("file") or request.files.get("image")
    mode = request.form.get("mode", "garment")

    try:
        result = preview_item_image(file_storage, mode=mode)
        return jsonify({"success": True, **result})
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 400


@app.post("/api/items/confirm-image")
def confirm_image():
    # 第二階段：前端確認後，把 output 圖片搬到 final 並寫入資料庫。
    data = request.get_json(silent=True) or request.form.to_dict(flat=True)

    try:
        result = confirm_item_image(
            user_id=_required_int(data, "user_id"),
            name=_required_value(data, "name"),
            space_id=_optional_int(data, "space_id"),
            type_id=_optional_int(data, "type_id"),
            season=data.get("season"),
            color_ids=_int_list(data.get("color_ids")),
            style_ids=_int_list(data.get("style_ids")),
        )
        return jsonify({"success": True, **result})
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 400


def _required_value(data, key):
    value = data.get(key)
    if value is None or value == "":
        raise ValueError(f"{key} is required.")
    return value


def _required_int(data, key):
    return int(_required_value(data, key))


def _optional_int(data, key):
    value = data.get(key)
    if value is None or value == "":
        return None
    return int(value)


def _int_list(value):
    # 支援 JSON array，例如 [1, 2]，也支援表單字串，例如 "1,2"。
    if value is None or value == "":
        return []
    if isinstance(value, list):
        return [int(item) for item in value]
    if isinstance(value, str):
        return [int(item.strip()) for item in value.split(",") if item.strip()]
    return [int(value)]


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
