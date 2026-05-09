import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from database import db


# 註冊
def register(name, account, password):
    existing_user = db.get_user_by_account(account)
    if existing_user is not None:
        return False, "帳號已經存在，無法重複註冊"

    success = db.insert_new_user(name, account, password)
    if success:
        return True, "註冊成功"
    return False, "註冊失敗，請稍後再試"

# 登入
def login(account, password):
    user = db.get_user_by_account(account)

    if user is None:
        return False, "找不到此帳號"

    if user["Password"] == password:
        return True, user

    return False, "登入失敗"

# 修改密碼
def changePassword(user_id, oldPassword, newPassword):
    if not oldPassword:
        return False, "舊密碼不能為空"
    if not newPassword:
        return False, "新密碼不能為空"
    if oldPassword == newPassword:
        return False, "新舊密碼不能相同"

    user = db.get_user_by_id(user_id)

    if not user:
        return False, "找不到使用者"
    if user["Password"] != oldPassword:
        return False, "舊密碼輸入錯誤"
    
    success = db.update_user_password(user_id, newPassword)

    if success:
        return True, "密碼修改成功"
    
    return False, "密碼修改失敗"

# 透過id找使用者
def getUserName(user_id):
    user = db.get_user_by_id(user_id)

    if not user:
        return False, "找不到使用者"
    
    return True, user["User_Name"]

# ==========================================
# 本機測試
# ==========================================
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
