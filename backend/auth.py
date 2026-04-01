"""這邊是用來比對登入的帳密是否正確，會從資料庫撈出來比對，如果正確就回傳使用者的 id 和 username，否則回傳 None。"""

#叫出db.py的connection function 才可以用sql的語法
from db import get_db_connection

def check_login(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = "SELECT id, username FROM users WHERE username = %s AND password = %s"
    cursor.execute(sql, (username, password))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    return user