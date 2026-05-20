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

# Return backend health status for quick API availability checks.
@app.get("/")
def health_check():
    return jsonify({"status": "ok", "success": True})

# ==========================================
# Static image access
# ==========================================
# Serve static image files from the project pictures directory.
@app.get("/pictures/<path:filename>")
def serve_picture(filename):
    return send_from_directory(PICTURES_DIR, filename)

# Serve parsed output images for preview display.
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
# 註冊
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

# 登入
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

# 修改密碼
@app.patch("/api/auth/<int:user_id>/password")
def api_change_password(user_id):
    from services.auth import changePassword

    data = request.get_json(silent=True) or request.form.to_dict(flat=True)

    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")

    success, msg = changePassword(user_id, old_password, new_password)

    if success:
        return jsonify({"success": True, "status": "success"}), 200
    
    return jsonify({"success": False, "status": "error", "message": msg}), 400

# 取得用戶名稱(透過id)
@app.get("/api/user/<int:user_id>")
def api_get_user_name(user_id):
    from services.auth import getUserById

    success, result = getUserById(user_id)

    if success:
        return jsonify({"success": True, "status": "success", "data":result}), 200
    return jsonify({"success": False, "status": "error", "message": result}), 404

# ==========================================
# 2. Space
# ==========================================
# Return the supported storage space types.
@app.route("/api/space/predefined", methods=["GET"])
def api_get_predefined_space_types():
    from services.space import get_predefined_space_types

    types = get_predefined_space_types()
    return jsonify({"status": "success", "success": True, "data": types}), 200

# Create a new storage space with optional name and capacity.
@app.route("/api/space", methods=["POST"])
def api_add_space():
    from services.space import add_space

    data = request.get_json(silent=True) or request.form.to_dict(flat=True)
    user_id = data.get("user_id")
    space_type = data.get("space_type")
    space_name = data.get("space_name")
    capacity = _optional_int(data, "capacity") or 30

    success, space_id, msg = add_space(user_id, space_type, capacity, space_name)
    if success:
        return jsonify({
            "status": "success",
            "success": True,
            "spaceId": space_id,
            "message": msg
        }), 201
    return jsonify({
        "status": "error",
        "success": False,
        "message": msg
    }), 400

# Return all spaces for one user, optionally filtered by type.
@app.route("/api/space/user/<int:user_id>", methods=["GET"])
def api_get_user_all_spaces(user_id):
    from services.space import get_user_all_spaces
    space_type = request.args.get("type")
    spaces = get_user_all_spaces(user_id, space_type)
    return jsonify({"status": "success", "success": True, "data": spaces}), 200

# Return all formatted clothing items inside one space.
@app.route("/api/space/<int:space_id>/items", methods=["GET"])
def api_get_space_items(space_id):
    from services.space import get_formatted_items

    success, result = get_formatted_items(space_id)
    if success:
        return jsonify({"status": "success", "success": True, "data": result}), 200
    return jsonify({"status": "error", "success": False, "message": result}), 404

# Return capacity status for one storage space.
@app.get("/api/space/<int:space_id>/capacity")
def api_get_space_capacity(space_id):
    from services.space import get_capacity_status

    success, result = get_capacity_status(space_id)

    if success:
        return jsonify({"success": True, "status": "success", "data": result}), 200

    return jsonify({"success": False, "status": "error", "message": result}), 404

# Update one space capacity while preventing invalid capacity values.
@app.patch("/api/space/<int:space_id>/capacity")
def api_update_space_capacity(space_id):
    from services.space import update_capacity

    data = request.get_json(silent=True) or request.form.to_dict(flat=True)

    try:
        capacity = _required_int(data, "capacity")
    except ValueError as e:
        return jsonify({"success": False, "status": "error", "message": str(e)}), 400

    success, result = update_capacity(space_id, capacity)

    if success:
        return jsonify({"success": True, "status": "success", "message": result}), 200

    return jsonify({"success": False, "status": "error", "message": result}), 400

# Move one item to another space after capacity validation.
@app.patch("/api/items/<int:item_id>/space")
def api_move_item_space(item_id):
    from services.items import move_item_space

    data = request.get_json(silent=True) or request.form.to_dict(flat=True)

    try:
        target_space_id = _required_int(data, "space_id")
    except ValueError as e:
        return jsonify({"success": False, "status": "error", "message": str(e)}), 400

    success, result = move_item_space(item_id, target_space_id)

    if success:
        return jsonify({"success": True, "status": "success", "message": result}), 200

    return jsonify({"success": False, "status": "error", "message": result}), 400

# Delete one space; related items are kept with Space_ID set to NULL.
@app.delete("/api/space/<int:space_id>")
def api_delete_space(space_id):
    from services.space import remove_space

    success, result = remove_space(space_id)

    if success:
        return jsonify({"success": True, "status": "success", "message": result}), 200

    return jsonify({"success": False, "status": "error", "message": result}), 404

# ==========================================
# 3. Items
# ==========================================
# Return full detail for one clothing item.
@app.get("/api/items/<int:item_id>")
def api_get_item_detail(item_id):
    from services.items import get_item_detail

    success, result = get_item_detail(item_id)

    if success:
        return jsonify({"success": True, "status": "success", "data": result}), 200

    return jsonify({"success": False, "status": "error", "message": result}), 404

# Update one clothing item and its multi-select attributes.
@app.patch("/api/items/<int:item_id>")
def api_update_item(item_id):
    from services.items import update_item_record

    data = request.get_json(silent=True) or request.form.to_dict(flat=True)

    success, result = update_item_record(item_id, data)

    if success:
        return jsonify({"success": True, "status": "success", "data": result}), 200

    return jsonify({"success": False, "status": "error", "message": result}), 400

# Delete one clothing item and its relation rows.
@app.delete("/api/items/<int:item_id>")
def api_delete_item(item_id):
    from services.items import delete_item_record

    success, result = delete_item_record(item_id)

    if success:
        return jsonify({"success": True, "status": "success", "message": result}), 200

    return jsonify({"success": False, "status": "error", "message": result}), 404

# Upload and parse one image in a backward-compatible single step.
@app.post("/api/items/preview-image")
def preview_image():
    file_storage = request.files.get("file") or request.files.get("image")
    mode = request.form.get("mode", "garment")

    try:
        result = preview_item_image(file_storage, mode=mode)
        return jsonify({"success": True, "status": "success", **result})
    except Exception as exc:
        return jsonify({"success": False, "status": "error", "message": str(exc)}), 400

# Confirm parsed image output and create the item record.
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
            notes=data.get("notes") or None,
        )
        return jsonify({"success": True, "status": "success", **result})
    except Exception as exc:
        return jsonify({"success": False, "status": "error", "message": str(exc)}), 400

@app.get("/api/items/<int:item_id>/outfits")
def api_get_outfits_by_item(item_id):
    from services.items import getOutfitsByItem

    success, result = getOutfitsByItem(item_id)

    if success:
        return jsonify({"success": True, "status": "success", "data": result}), 200
    
    return jsonify({"success": False, "status": "error", "message": result}), 404

# 移動或複製衣物到行李箱
@app.post("/api/luggage/items/transfet")
def api_move_or_copy_item_to_luggage():
    from services.items import move_or_copy_item_to_luggage

    data = request.get_json(silent=True) or request.form.to_dict(flat=True)

    try:
        item_id = _required_int(data, "item_id")
        to_space_id = _required_int(data, "to_space_id")
        mode = _required_value(data, "mode").strip().lower()

        from_space_id = data.get("from_space_id")
        if from_space_id is not None and from_space_id != "":
            from_space_id = int(from_space_id)
        else:
            from_space_id = None

    except ValueError as e:
        return jsonify({"success": False, "status": "error", "message": str(e)}), 400
    
    success, result = move_or_copy_item_to_luggage(
        item_id=item_id,
        from_space_id=from_space_id,
        to_space_id=to_space_id,
        mode=mode
    )

    if success:
        return jsonify({"success": True, "status": "success", "date": result}), 200
    
    return jsonify({"success": False, "status": "error", "message": result}), 400

# ==========================================
# 4. Outfits / History
# ==========================================
# Return occasion options for outfit filter dropdown.
@app.get("/api/outfits/occasion-options")
def api_get_outfit_occasion_options():
    from services.outfits import get_occasion_options

    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "status": "error",
            "message": "Missing user_id."
        }), 400

    options = get_occasion_options(user_id)

    return jsonify({
        "success": True,
        "status": "success",
        "data": options
    }), 200

# Return all outfit history records for one user.
@app.get("/api/outfits")
def api_get_outfits():
    from services.outfits import get_user_outfits

    user_id = request.args.get("user_id")
    occasion = request.args.get("occasion")

    if not user_id:
        return jsonify({
            "success": False,
            "status": "error",
            "message": "Missing user_id."
        }), 400

    outfits = get_user_outfits(user_id, occasion)

    return jsonify({
        "success": True,
        "status": "success",
        "data": outfits
    }), 200

# Return one outfit history record with item details.
@app.get("/api/outfits/<int:history_id>")
def api_get_outfit_detail(history_id):
    from services.outfits import get_outfit_detail

    success, result = get_outfit_detail(history_id)

    if success:
        return jsonify({
            "success": True,
            "status": "success",
            "data": result
        }), 200

    return jsonify({
        "success": False,
        "status": "error",
        "message": result
    }), 404

# 新增outfits
@app.post("/api/outfits")
def api_create_outfit():
    from services.outfits import create_outfit_record
    from services.image_outfit_upload import move_outfit_to_final

    data = request.get_json(silent=True) or request.form.to_dict(flat=True)

    success, result = create_outfit_record(data)

    if success:
        photo = data.get("photo") or ""
        # plain filename (no path separator) → move from prepare to final
        if photo and "/" not in str(photo) and "\\" not in str(photo):
            try:
                move_outfit_to_final(photo)
            except Exception:
                pass
        return jsonify({
            "success": True,
            "status": "success",
            "data": result
        }), 201

    return jsonify({
        "success": False,
        "status": "error",
        "message": result
    }), 400

# Update one outfit history record.
@app.patch("/api/outfits/<int:history_id>")
def api_update_outfit(history_id):
    from services.outfits import update_outfit_record

    data = request.get_json(silent=True) or request.form.to_dict(flat=True)

    success, result = update_outfit_record(history_id, data)

    if success:
        return jsonify({
            "success": True,
            "status": "success",
            "data": result
        }), 200

    return jsonify({
        "success": False,
        "status": "error",
        "message": result
    }), 400

# Delete one outfit history record.
@app.delete("/api/outfits/<int:history_id>")
def api_delete_outfit(history_id):
    from services.outfits import delete_outfit_record

    success, result = delete_outfit_record(history_id)

    if success:
        return jsonify({
            "success": True,
            "status": "success",
            "message": result
        }), 200

    return jsonify({
        "success": False,
        "status": "error",
        "message": result
    }), 404

# ==========================================
# 5. Search
# ==========================================
# Search wardrobe items with optional keyword and filter groups.
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
# 6. Current image input/output pipeline
# ==========================================
# Upload the current source image to pictures/input.
@app.post("/api/images/upload-input")
def upload_input_image():
    file_storage = request.files.get("file") or request.files.get("image")

    try:
        input_path = save_upload_to_input(file_storage)
        return jsonify({"success": True, "status": "success", "input_path": input_path})
    except Exception as exc:
        return jsonify({"success": False, "status": "error", "message": str(exc)}), 400

# Parse the current input image and write preview output.
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
# Convert a boolean success flag into a response status string.
def _status(success):
    return "success" if success else "error"

# Read a required request field or raise ValueError.
def _required_value(data, key):
    value = data.get(key)
    if value is None or value == "":
        raise ValueError(f"{key} is required.")
    return value

# Read a required request field and convert it to int.
def _required_int(data, key):
    return int(_required_value(data, key))

# Read an optional request field and convert it to int when present.
def _optional_int(data, key):
    value = data.get(key)
    if value is None or value == "":
        return None
    return int(value)

# Normalize a scalar, comma-separated string, or list into int list.
def _int_list(value):
    if value is None or value == "":
        return []
    if isinstance(value, list):
        return [int(item) for item in value]
    if isinstance(value, str):
        return [int(item.strip()) for item in value.split(",") if item.strip()]
    return [int(value)]

# ==========================================
# 7. Outfits image upload
# ==========================================
@app.post("/api/outfits/upload-image")
def api_upload_outfit_image():
    from services.image_outfit_upload import save_outfit_upload_to_prepare
    file_storage = request.files.get("file") or request.files.get("image")
    try:
        save_path = save_outfit_upload_to_prepare(file_storage)
        # Return relative path for frontend reference
        rel_path = save_path.relative_to(save_path.parents[3])  # project root
        return jsonify({
            "success": True,
            "status": "success",
            "path": rel_path.as_posix(),
            "url": f"/pictures/Outfits/prepare/{save_path.name}"
        }), 201
    except Exception as exc:
        return jsonify({
            "success": False,
            "status": "error",
            "message": str(exc)
        }), 400

if __name__ == "__main__":
    print("API started")
    app.run(host="0.0.0.0", port=5000, debug=True)
