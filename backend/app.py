import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from services.auth import login, register
from services.image_preview import (
    PICTURES_DIR,
    confirm_item_image,
    ensure_picture_folders,
    parse_current_input_image,
    preview_item_image,
    save_upload_to_input,
)

app = Flask(__name__)
CORS(app, origins="*")

# Make sure WaSaLei/pictures/input|output|final exist when the server starts.
ensure_picture_folders()

@app.get("/")
def health_check():
    return jsonify({"status": "ok", "success": True})

# ==========================================
# Static image access
# ==========================================
@app.get("/pictures/<path:filename>")
def serve_picture(filename):
    return send_from_directory(PICTURES_DIR, filename)


@app.route("/images/<path:filename>")
def serve_image(filename):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pictures_dir = os.path.join(base_dir, "pictures", "output")

    if os.path.exists(os.path.join(pictures_dir, filename)):
        return send_from_directory(pictures_dir, filename)

    # Fallback for the current project structure.
    return send_from_directory(PICTURES_DIR / "output", filename)


# ==========================================
# 1. Auth
# ==========================================
@app.post("/api/auth/register")
def register_user():
    # silent = True : 預設情況下，如果前端傳過來的不是json會報錯，加上silent = True就只會回傳None
    # 若左邊失敗了，就會嘗試讀傳統的Form data
    data = request.get_json(silent=True) or request.form.to_dict(flat=True)

    try:
        success, msg = register(
            name = _required_value(data, "name"),
            account = _required_value(data, "account"),
            password = _required_value(data, "password")
        )

        if success:
            return jsonify({"success": True, "status": "success", "message": msg}), 201
        
        return jsonify({"success": False, "status": "error", "message": msg}), 400

    except ValueError as e:
        return jsonify({"success": False, "status": "error", "message": str(e)}), 400
    except Exception as exc:
        return jsonify({"success": False, "status": "error", "message": "伺服器內部錯誤"}), 500

@app.post("/api/auth/login")
def login_user():
    data = request.get_json(silent=True) or request.form.to_dict(flat=True)

    try:
        success, result = login(
            account = _required_value(data, "account"),
            password = _required_value(data, "password")
        )

        if success:
            return jsonify({"success": True, "status": "success", "data": result}), 200
        
        return jsonify({"success": False, "status": "error", "message": result}), 201

    except ValueError as e:
        return jsonify({"success": False, "status": "error", "message": str(e)}), 400
    except Exception as exc:
        return jsonify({"success": False, "status": "error", "message": "伺服器內部錯誤"}), 500

# ==========================================
# 2. Space
# ==========================================
@app.route("/api/space/predefined", methods=["GET"])
def api_get_predefined_space_types():
    from services.space import get_predefined_space_types

    types = get_predefined_space_types()
    return jsonify({"status": "success", "success": True, "data": types}), 200

@app.route("/api/space", methods=["POST"])
def api_add_space():
    from services.space import add_space

    data = request.get_json(silent=True) or request.form.to_dict(flat=True)
    user_id = data.get("user_id")
    space_type = data.get("space_type")
    capacity = _optional_int(data, "capacity")

    success, msg = add_space(user_id, space_type, capacity)
    if success:
        return jsonify({"status": "success", "success": True, "message": msg}), 201
    return jsonify({"status": "error", "success": False, "message": msg}), 400

@app.route("/api/space/user/<int:user_id>", methods=["GET"])
def api_get_user_all_spaces(user_id):
    from services.space import get_user_all_spaces

    spaces = get_user_all_spaces(user_id)
    return jsonify({"status": "success", "success": True, "data": spaces}), 200

@app.route("/api/space/<int:space_id>/items", methods=["GET"])
def api_get_space_items(space_id):
    from services.space import get_formatted_items

    success, result = get_formatted_items(space_id)
    if success:
        return jsonify({"status": "success", "success": True, "data": result}), 200
    return jsonify({"status": "error", "success": False, "message": result}), 404

# ==========================================
# 3. Items
# ==========================================
@app.post("/api/items/preview-image")
def preview_image():
    file_storage = request.files.get("file") or request.files.get("image")
    mode = request.form.get("mode", "garment")

    try:
        result = preview_item_image(file_storage, mode=mode)
        return jsonify({"success": True, "status": "success", **result})
    except Exception as exc:
        return jsonify({"success": False, "status": "error", "message": str(exc)}), 400

@app.post("/api/items/confirm-image")
def confirm_image():
    data = request.get_json(silent=True) or request.form.to_dict(flat=True)

    try:
        result = confirm_item_image(
            user_id=_required_int(data, "user_id"),
            name=_required_value(data, "name"),
            space_id=_optional_int(data, "space_id"),
            type_id=_optional_int(data, "type_id"),
            season_ids=_int_list(data.get("season_ids")) or data.get("season"),
            color_ids=_int_list(data.get("color_ids")),
            style_ids=_int_list(data.get("style_ids")),
        )
        return jsonify({"success": True, "status": "success", **result})
    except Exception as exc:
        return jsonify({"success": False, "status": "error", "message": str(exc)}), 400

# ==========================================
# 4. Search
# ==========================================
@app.route("/api/search", methods=["GET", "POST"])
def api_search_wardrobe():
    from services.search import search_wardrobe

    data = request.get_json(silent=True) or request.args.to_dict(flat=True)
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"status": "error", "success": False, "message": "Missing user_id."}), 400

    success, result = search_wardrobe(
        user_id,
        keyword=data.get("keyword"),
        space_id=data.get("space_id"),
        type_id=data.get("type_id"),
        season_ids=_int_list(data.get("season_ids") or data.get("season_id")),
        color_ids=_int_list(data.get("color_ids") or data.get("color_id")),
        style_ids=_int_list(data.get("style_ids") or data.get("style_id")),
    )

    if success:
        return jsonify({"status": "success", "success": True, "data": result}), 200
    return jsonify({"status": "error", "success": False, "message": result}), 500

# ==========================================
# 5. Current image input/output pipeline
# ==========================================
@app.post("/api/images/upload-input")
def upload_input_image():
    file_storage = request.files.get("file") or request.files.get("image")

    try:
        input_path = save_upload_to_input(file_storage)
        return jsonify({"success": True, "status": "success", "input_path": input_path})
    except Exception as exc:
        return jsonify({"success": False, "status": "error", "message": str(exc)}), 400

@app.post("/api/images/parse-input")
def parse_input_image():
    data = request.get_json(silent=True) or request.form.to_dict(flat=True)
    mode = data.get("mode", "garment")

    try:
        result = parse_current_input_image(mode=mode)
        return jsonify({"success": True, "status": "success", **result})
    except Exception as exc:
        return jsonify({"success": False, "status": "error", "message": str(exc)}), 400

# ==========================================
# Helpers
# ==========================================
def _status(success):
    return "success" if success else "error"

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
    print("API started")
    app.run(host="0.0.0.0", port=5000, debug=True)