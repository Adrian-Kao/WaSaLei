"""這邊專門處理前後端的api串聯，讓前端能夠透過這些api來與後端進行資料操作"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from auth import check_login

app = Flask(__name__)
CORS(app)

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required"
        }), 400

    user = check_login(username, password)

    if user:
        return jsonify({
            "success": True,
            "message": "Login successful"
        })
    else:
        return jsonify({
            "success": False,
            "message": "Invalid username or password"
        }), 401

if __name__ == "__main__":
    app.run(debug=True)