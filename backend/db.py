import pymysql
import config

# ==========================================
# 1. 連線資料庫 (Database Connection)
# ==========================================
def get_connection():
    return pymysql.connect(
        host=config.DB_HOST,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_NAME,
        port=config.DB_PORT,
        cursorclass=pymysql.cursors.DictCursor
    )

# ==========================================
# 2. 會員系統功能 (User)
# ==========================================
# 透過Email尋找user
def get_user_by_account(account):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM `User` WHERE `User_Account` = %s"
            cursor.execute(sql, (account,))
            return cursor.fetchone()
    except Exception as e:
        print("查詢使用者時發生錯誤")
        return None
    finally:
        connection.close()

# 建立user
def create_user(name, account, password):
    if get_user_by_account(account) is not None:
        print("帳號已存在, 無法重複註冊")
        return False
    
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO `User` (`User_Name`, `User_Account`, `Password`, `Membership`) 
                VALUES (%s, %s, %s, 'free')
            """
            cursor.execute(sql, (name, account, password))
            connection.commit() # 存進資料庫
            print(f"成功註冊新會員:{name}")
            return True
    except Exception as e:
        print(f"註冊失敗: {e}")
        return False
    finally:
        connection.close()

# user登入
def verify_login(account, password):
    user = get_user_by_account(account)
    if user is None:
        print("找不到此帳號")
        return None
    # 核對密碼 (目前是明文)
    if user['Password'] == password:
        print(f"登入成功！歡迎回來，{user['User_Name']}")
        return user
    else:
        print("密碼錯誤")
        return None
    
# ==========================================
# 3. 本機測試
# ==========================================
if __name__ == "__main__":
    print("=== 正在測試 db.py 功能 ===")
    
    # 1. 測試註冊功能
    print("\n--- 測試註冊 ---")
    create_user("測試", "test@example.com", "123456")
    
    # 2. 測試重複註冊
    print("\n--- 測試重複註冊防呆 ---")
    create_user("小明", "test@example.com", "654321")

    # 3. 測試登入功能 (成功)
    print("\n--- 測試登入 (成功案例) ---")
    verify_login("test@example.com", "123456")

    # 4. 測試登入功能 (密碼錯誤)
    print("\n--- 測試登入 (失敗案例) ---")
    verify_login("test@example.com", "wrongpassword")
