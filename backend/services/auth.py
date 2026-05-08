import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from database import db


def register(name, account, password):
    existing_user = db.get_user_by_account(account)
    if existing_user is not None:
        return False, "帳號已經存在，無法重複註冊"

    success = db.insert_new_user(name, account, password)
    if success:
        return True, "註冊成功"
    return False, "註冊失敗，請稍後再試"


def login(account, password):
    user = db.get_user_by_account(account)

    if user is None:
        return False, "找不到此帳號"

    if user["Password"] == password:
        return True, user

    return False, "登入失敗"


if __name__ == "__main__":
    print("=== auth.py local test ===")

    test_account = "test@example.com"
    test_password = "123456"

    print(f"Login test account: {test_account}")
    success, result = login(test_account, test_password)

    if success:
        print("Login success")
        print(f"User_ID: {result.get('User_ID')}")
        print(f"User_Name: {result.get('User_Name')}")
        print(f"Membership: {result.get('Membership')}")
    else:
        print("Login failed")
        print(result)

    print("\nRegister test is intentionally not run to avoid creating duplicate users.")
    print("To test register manually, call: register('測試2', 'new@example.com', '123456')")
