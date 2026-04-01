"""這邊主要是做資料庫的連接，現在是測試版版的資料庫，但結構上大致一樣"""
import mysql.connector

def get_db_connection():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="akao0125",
        database="login_demo"
    )
    return conn