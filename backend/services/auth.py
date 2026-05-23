import os
import sys
from datetime import datetime, timedelta, timezone

import jwt
from werkzeug.security import check_password_hash, generate_password_hash

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from database import db

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_HOURS = int(os.getenv("JWT_EXPIRES_HOURS", "12"))


def create_access_token(user_id):
    payload = {
        "user_id": int(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRES_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token):
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    user_id = payload.get("user_id")
    if not user_id:
        raise jwt.InvalidTokenError("Missing user_id in token.")
    return int(user_id)


def _password_matches(stored_password, plain_password):
    try:
        if check_password_hash(stored_password, plain_password):
            return True, False
    except ValueError:
        pass

    if stored_password == plain_password:
        return True, True

    return False, False


# Register a new user and store password as hash.
def register(name, account, password):
    existing_user = db.get_user_by_account(account)
    if existing_user is not None:
        return False, "Account already exists."

    password_hash = generate_password_hash(password)
    success = db.insert_new_user(name, account, password_hash)
    if success:
        return True, "Register success."
    return False, "Register failed."


# Login user and return JWT token.
def login(account, password):
    user = db.get_user_by_account(account)

    if user is None:
        return False, "Login failed."

    password_ok, needs_migration = _password_matches(user["Password"], password)
    if not password_ok:
        return False, "Login failed."

    if needs_migration:
        db.update_user_password(user["User_ID"], generate_password_hash(password))

    token = create_access_token(user["User_ID"])
    user.pop("Password", None)
    return True, {"user": user, "token": token}


# Change password after verifying the old password.
def changePassword(user_id, old_password, new_password):
    if not old_password:
        return False, "Old password is required."
    if not new_password:
        return False, "New password is required."
    if old_password == new_password:
        return False, "New password must be different."

    user = db.get_user_by_id(user_id)

    if not user:
        return False, "User not found."

    password_ok, _ = _password_matches(user["Password"], old_password)
    if not password_ok:
        return False, "Old password is incorrect."

    new_password_hash = generate_password_hash(new_password)
    success = db.update_user_password(user_id, new_password_hash)

    if success:
        return True, "Password changed."

    return False, "Password change failed."


# Get a user's display name by id.
def getUserName(user_id):
    user = db.get_user_by_id(user_id)

    if not user:
        return False, "User not found."

    return True, user["User_Name"]


# Get user profile by id. Password is never returned.
def getUserById(user_id):
    user = db.get_user_by_id(user_id)

    if user is None:
        return False, "User not found."

    user.pop("Password", None)
    return True, user


if __name__ == "__main__":
    print("=== auth.py local test ===")

    test_account = "test@example.com"
    test_password = "123456"

    print(f"Login test account: {test_account}")
    success, result = login(test_account, test_password)

    if success:
        print("Login success")
        print(f"User_ID: {result['user'].get('User_ID')}")
        print(f"User_Name: {result['user'].get('User_Name')}")
        print(f"Membership: {result['user'].get('Membership')}")
        print(f"Token exists: {bool(result.get('token'))}")
    else:
        print("Login failed")
        print(result)

    print("\nRegister test is intentionally not run to avoid creating duplicate users.")
    print("To test register manually, call: register('Test User', 'new@example.com', '123456')")
