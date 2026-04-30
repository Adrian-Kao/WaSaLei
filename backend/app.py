from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from services.image_preview import (
    PICTURES_DIR,
    confirm_item_image,
    ensure_picture_folders,
    parse_current_input_image,
    preview_item_image,
    save_upload_to_input,
)

# Main Flask API for the frontend image workflow.
app = Flask(__name__)
CORS(app)

# Make sure WaSaLei/pictures/input|output|final exist when the server starts.
ensure_picture_folders()


@app.get("/")
def health_check():
    return jsonify({"status": "ok"})


@app.get("/pictures/<path:filename>")
def serve_picture(filename):
    # Exposes WaSaLei/pictures so the frontend can preview output/final images.
    return send_from_directory(PICTURES_DIR, filename)


@app.post("/api/images/upload-input")
def upload_input_image():
    # Stage 1: frontend uploads an image and backend stores it in pictures/input.
    file_storage = request.files.get("file") or request.files.get("image")

    try:
        input_path = save_upload_to_input(file_storage)
        return jsonify({
            "success": True,
            "input_path": input_path,
        })
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 400


@app.post("/api/images/parse-input")
def parse_input_image():
    # Stage 2: frontend asks backend to parse the current picture in input.
    data = request.get_json(silent=True) or request.form.to_dict(flat=True)
    mode = data.get("mode", "garment")

    try:
        result = parse_current_input_image(mode=mode)
        return jsonify({"success": True, **result})
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 400


@app.post("/api/items/preview-image")
def preview_image():
    # Backward-compatible one-step endpoint: upload to input and parse immediately.
    file_storage = request.files.get("file") or request.files.get("image")
    mode = request.form.get("mode", "garment")

    try:
        result = preview_item_image(file_storage, mode=mode)
        return jsonify({"success": True, **result})
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 400


@app.post("/api/items/confirm-image")
def confirm_image():
    # Final stage: copy output image to final, write DB record, then clear input/output.
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
    if value is None or value == "":
        return []
    if isinstance(value, list):
        return [int(item) for item in value]
    if isinstance(value, str):
        return [int(item.strip()) for item in value.split(",") if item.strip()]
    return [int(value)]


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
