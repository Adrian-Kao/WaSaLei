import os
from dotenv import load_dotenv
import pymysql

# 讀 .env
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "dbms-example")
DB_PORT = int(os.getenv("DB_PORT", 3306))

# 測試連線
def test_connection():
    print("=== 系統環境變數檢查 ===")
    print(f"嘗試連線至主機: {DB_HOST}")
    print(f"使用者帳號: {DB_USER}")
    print(f"目標資料庫: {DB_NAME}")
    print("密碼狀態: ", "已設定" if DB_PASSWORD else "未設定 (空白)")
    print("========================")

    # 變數存取
    if not DB_USER:
        print("無法讀取資料庫帳號，請檢查 .env 檔案")
        return
    print("成功讀取 .env 變數")

    try:
        # 嘗試連線 MySQL
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            port=DB_PORT,
            cursorclass=pymysql.cursors.DictCursor
        )
        print("成功連線到 MySQL 資料庫")

        # 嘗試執行
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION() AS version")
            result = cursor.fetchone()
            print(f"成功執行 SQL(你的 MySQL 版本為: {result['version']})")

        # 測試完畢後關閉連線
        connection.close()
        print("測試完成，已關閉資料庫連線")

    except pymysql.err.OperationalError as e:
        print("\n資料庫連線被拒絕。")
    except Exception as e:
        print(f"\n未知的錯誤: {e}")

# 直接執行這個檔案的時候才會跑測試
if __name__ == "__main__":
    test_connection()