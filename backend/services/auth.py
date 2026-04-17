import db

# 註冊
def register(name, account, password):
    # 1. 檢查帳號是否已存在
    existing_user = db.get_user_by_account(account)
    if existing_user is not None:
        return False, "帳號已經存在，無法重複註冊"
    
    # 2. 寫入新會員資料
    success = db.insert_new_user(name, account, password)
    if success:
        return True, "註冊成功"
    else:
        return False, "註冊失敗，請稍後再試"
    
# 登入
def login(account, password):
    user = db.get_user_by_account(account)

    if user is None:
        print("找不到此帳號")
        return False
    
    if user['Password'] == password:
        return True, user
    
    else:
        return False, "登入失敗"
    
# ==========================================
# 直接執行 python auth.py 來進行本機測試
# ==========================================
if __name__ == "__main__":
    print("=== 測試 auth.py 邏輯 ===")
    
    # 測試註冊
    is_success, msg = register("測試", "test@example.com", "123456")
    print(msg)
    
    # 測試登入
    is_success, result = login("test@example.com", "123456")
    if is_success:
        print(f"登入成功！歡迎 {result['User_Name']}")
    else:
        print(result)