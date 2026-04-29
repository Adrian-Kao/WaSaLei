import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from services.auth import register, login
from services.space import get_predefined_space_types, add_space, get_user_all_spaces, get_formatted_items
from services.items import add_new_item
from services.search import search_wardrobe

# ???
app = Flask(__name__)

# 目前允許所有來源的跨域請求
CORS(app, origins="*")

@app.route("/images/<path:filename>")
def serve_image(filename):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_dir = os.path.join(base_dir, "shared_data", "output")

    return send_from_directory(output_dir, filename)

# ==========================================
# 1. Auth
# ==========================================
@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.json
    name = data.get("name")
    account = data.get("account")
    password = data.get("password")

    success, message = register(name, account, password)

    # HTTP狀態碼 : 200 表示成功，400 表示失敗
    if success:
        return jsonify({"status": "success", "message": message}), 200
    return jsonify({"status": "error", "message": message}), 400

@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.json
    account = data.get("account")
    password = data.get("password")

    result = login(account, password)

    if isinstance(result, tuple):
        success, data_or_msg = result
    else:
        success = result
        data_or_msg = "登入失敗"

    if success:
        return jsonify({"status": "success", "data": data_or_msg}), 200
    return jsonify({"status": "error", "message": data_or_msg}), 401

# ==========================================
# 2. Space
# ==========================================
@app.route("/api/space/predefined", methods=["GET"])
def api_get_predefined_space_types():
    types = get_predefined_space_types()
    return jsonify({"status": "success", "data": types}), 200

@app.route("/api/space", methods=["POST"])
def api_add_space():
    data = request.json
    user_id = data.get("user_id")
    space_type = data.get("space_type")
    capacity = data.get("capacity")

    success, msg = add_space(user_id, space_type, capacity)

    if success:
        return jsonify({"status": "success", "message": msg}), 201
    return jsonify({"status": "error", "message": msg}), 400

@app.route("/api/space/user/<int:user_id>", methods=["GET"])
def api_get_user_all_spaces(user_id):
    spaces = get_user_all_spaces(user_id)
    return jsonify({"status": "success", "data": spaces}), 200

@app.route("/api/space/<int:space_id>/items", methods=["GET"])
def api_get_space_items(space_id):
    success, result = get_formatted_items(space_id)
    if success:
        return jsonify({"status": "success", "data": result}), 200
    return jsonify({"status": "error", "message": result}), 404

# ==========================================
# 3. Items
# ==========================================
@app.route("/api/items", methods=["POST"])
def api_add_item():
    data = request.json

    if not data:
        return jsonify({"status": "error", "message": "請提供有效的 JSON 資料"}), 400

    user_id = data.get("user_id")
    name = data.get("name")
    space_id = data.get("space_id")
    type_id = data.get("type_id")
    season = data.get("season")
    color_ids = data.get("color_ids")
    style_ids = data.get("style_ids")
    photo_filename = data.get("photo_filename")
    success, msg = add_new_item(
        user_id = user_id,
        name = name,
        space_id = space_id,
        type_id = type_id,
        season = season,
        color_ids = color_ids,
        style_ids = style_ids,
        photo_filename = photo_filename
    )

    if success:
        return jsonify({"status": "success", "message": msg}), 201
    return jsonify({"status": "error", "message": msg}), 400

# ==========================================
# 4. Search
# ==========================================
@app.route("/api/search", methods=["GET"])
def api_search_wardrobe():
    data = request.json
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"status": "error", "message": "缺少 user_id 參數"}), 400
    
    keyword = data.get("keyword")
    space_id = data.get("space_id")
    type_id = data.get("type_id")
    season = data.get("season")
    color_id = data.get("color_id")
    style_id = data.get("style_id")
    
    success, result = search_wardrobe(
        user_id, 
        keyword=keyword, 
        space_id=space_id, 
        type_id=type_id, 
        season=season, 
        color_id=color_id, 
        style_id=style_id
    )
    
    if success:
        return jsonify({"status": "success", "data": result}), 200
    return jsonify({"status": "error", "message": result}), 500

if __name__ == "__main__":
    print("API已啟動 (已開啟共享資料夾路徑)")
    app.run(host="0.0.0.0", port=5000, debug=True)