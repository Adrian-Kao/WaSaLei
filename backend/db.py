import mysql.connector

def get_db_connection():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="akao0125",
        database="login_demo"
    )
    return conn