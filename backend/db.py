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
def insert_new_user(name, account, password):
    """(內部工具) 純粹把新資料寫進資料庫"""
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO `User` (`User_Name`, `User_Account`, `Password`, `Membership`) 
                VALUES (%s, %s, %s, 'free')
            """
            cursor.execute(sql, (name, account, password))
            connection.commit()
            return True
    except Exception as e:
        print(f"❌ 寫入發生錯誤: {e}")
        connection.rollback()
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