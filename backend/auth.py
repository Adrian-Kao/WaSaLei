"""這邊主要是做資料庫的連接，現在是測試版版的資料庫，但結構上大致一樣"""
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