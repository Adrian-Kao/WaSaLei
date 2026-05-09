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
# 2. 會員系統功能 (User) (對應auth.py)
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

# 透過ID尋找user
def get_user_by_id(user_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT User_ID, User_Name, User_Account, Password, Membership, Member_Date
                FROM `User`
                WHERE User_ID = %s
            """
            cursor.execute(sql, (user_id,))
            return cursor.fetchone()
    
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
        print(f"寫入發生錯誤: {e}")
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
    
# 更新密碼
def update_user_password(user_id, new_password):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                UPDATE `User`
                SET `Password` = %s
                WHERE `User_ID` = %s 
            """
            cursor.execute(sql, (new_password, user_id))
            connection.commit()
            return cursor.rowcount > 0
    
    finally:
        connection.close()

# ==========================================
# 3. 儲存空間功能 (Space) (對應space.py)
# ==========================================
# 為該使用者建立一個新空間
def create_new_space(user_id, space_type, capacity=30, space_name=None):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO `Space` 
                (`Space_Type`, `Capacity`, `Used_Capacity`, `User_ID`, `Space_Name`) 
                VALUES (%s, %s, 0, %s, %s)
            """
            cursor.execute(sql, (space_type, capacity, user_id, space_name))
            connection.commit()
            return True
        
    except Exception as e:
        print(f"建立空間SQL錯誤: {e}")
        connection.rollback()
        return False
    
    finally:
        connection.close()

# 撈出該使用者的所有空間
def get_spaces_by_user_id(user_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT `Space_ID`, `Space_Type`, `Space_Name`, `Capacity`, `User_ID` FROM `Space` WHERE `User_ID` = %s"
            cursor.execute(sql, (user_id,))
            return cursor.fetchall()
    except Exception as e:
        print(f"查詢空間時發生錯誤: {e}")
        return []
    finally:
        connection.close()

# 查空間容量狀態
def get_space_capacity_status(space_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT
                    s.Space_ID,
                    s.Space_Type,
                    s.Space_Name,
                    s.User_ID,
                    s.Capacity,
                    COUNT(i.Item_ID) AS Used_Capacity,
                    GREATEST(s.Capacity - COUNT(i.Item_ID), 0) AS Remaining_Capacity,
                    CASE
                        WHEN COUNT(i.Item_ID) >= s.Capacity THEN 1
                        ELSE 0
                    END AS Is_Full
                FROM `Space` s
                LEFT JOIN `Item` i ON s.Space_ID = i.Space_ID
                WHERE s.Space_ID = %s
                GROUP BY 
                    s.Space_ID,
                    s.Space_Type,
                    s.Space_Name,
                    s.User_ID,
                    s.Capacity
            """
            cursor.execute(sql, (space_id,))
            return cursor.fetchone()
    except Exception as e:
        print(f"查詢空間容量狀態時發生錯誤: {e}")
        return None
    finally:
        connection.close()

# 撈取空間內衣服的原始資料
def fetch_raw_items_by_space(space_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT
                    i.Item_ID,
                    i.Name,
                    i.Photo,
                    t.Type_Name as Type,
                    GROUP_CONCAT(DISTINCT se.Season_Name SEPARATOR '、') as Seasons,
                    GROUP_CONCAT(DISTINCT st.Style_Name SEPARATOR '、') as Styles, 
                    GROUP_CONCAT(DISTINCT c.Color_Name ORDER BY c.Color_ID SEPARATOR ',') as Colors
                FROM Item i
                LEFT JOIN Type t ON i.Type_ID = t.Type_ID
                LEFT JOIN Item_Season ise ON i.Item_ID = ise.Item_ID
                LEFT JOIN Season se ON ise.Season_ID = se.Season_ID
                LEFT JOIN Item_Style isty ON i.Item_ID = isty.Item_ID
                LEFT JOIN Style st ON isty.Style_ID = st.Style_ID
                LEFT JOIN Item_Color ic ON i.Item_ID = ic.Item_ID
                LEFT JOIN Color c ON ic.Color_ID = c.Color_ID
                WHERE i.Space_ID = %s
                GROUP BY i.Item_ID
            """

            cursor.execute(sql, (space_id,))
            return cursor.fetchall()
    except Exception as e:
        print(f"查詢空間衣服的屬性時發生錯誤: {e}")
        return []
    finally:
        connection.close()

# 更新空間容量
def update_space_capacity(space_id, new_capacity):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            status = get_space_capacity_status(space_id)

            if status is None:
                return False, "找不到指定空間"
            if new_capacity < status["Used_Capacity"]:
                return False, f"新容量不能小於已使用容量 ({status['Used_Capacity']})"
            
            sql = """
                UPDATE `Space` 
                SET `Capacity` = %s 
                WHERE `Space_ID` = %s
            """

            cursor.execute(sql, (new_capacity, space_id))
            connection.commit()
            return True, "空間容量更新成功"
        
    except Exception as e:
        print(f"更新空間容量時發生錯誤: {e}")
        connection.rollback()
        return False, str(e)
    finally:
        connection.close()

# 移動Item到另一個space
def move_item_to_space(item_id, new_space_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            status = get_space_capacity_status(new_space_id)
            
            if status is None:
                return False, "找不到目標空間"
            if status["Is_Full"]:
                return False, "目標空間已滿，無法移動衣服"

            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE" "`Item` SET `Space_ID` = %s WHERE `Item_ID` = %s",
                    (new_space_id, item_id)
                )

                if cursor.rowcount == 0:
                    connection.rollback()
                    return False, "找不到指定衣服，無法移動"
            
            connection.commit()
            return True, "衣服移動成功"
        
    except Exception as e:
        print(f"移動衣服時發生錯誤: {e}")
        connection.rollback()
        return False, str(e)
    
    finally:
        connection.close()

# 刪除空間
def delete_space(space_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM `Space` WHERE `Space_ID` = %s", (space_id,))
            affected_rows = cursor.rowcount

        connection.commit()

        if affected_rows == 0:
            return False, "找不到指定空間"

        return True, "刪除空間成功"

    except Exception as e:
        print(f"刪除空間時發生錯誤: {e}")
        connection.rollback()
        return False, str(e)

    finally:
        connection.close()
    
# ==========================================
# 4. 衣服管理功能 (Item) (對應item.py)
# ==========================================
# 同時寫入Item及相關聯的表
def insert_new_item(user_id, name, space_id, type_id, season_ids, color_ids, style_ids, photo_path=None):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            # 寫入Item表
            sql_item = """
                INSERT INTO `Item` (`User_id`, `Name`, `Space_ID`, `Type_ID`, `Photo`) 
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql_item, (user_id, name, space_id, type_id, photo_path))

            # 取得剛剛新增的Item的ID
            new_item_id = cursor.lastrowid

            # 寫入Item_Season表
            if season_ids:
                sql_season = "INSERT INTO `Item_Season` (`Item_ID`, `Season_ID`) VALUES (%s, %s)"
                cursor.executemany(sql_season, [(new_item_id, season_id) for season_id in season_ids])

            # 寫入Item_Color表
            if color_ids:
                sql_color = "INSERT INTO `Item_Color` (`Item_ID`, `Color_ID`) VALUES (%s, %s)"
                cursor.executemany(sql_color, [(new_item_id, color_id) for color_id in color_ids])
                
            # 寫入Item_Style表
            if style_ids:
                sql_style = "INSERT INTO `Item_Style` (`Item_ID`, `Style_ID`) VALUES (%s, %s)"
                cursor.executemany(sql_style, [(new_item_id, style_id) for style_id in style_ids])

        connection.commit()
        return True, new_item_id
    except Exception as e:
        print(f"新增衣服時發生錯誤: {e}")
        connection.rollback()
        return False, str(e)
    finally:
        connection.close()

# 查詢Item
def get_item_by_id(item_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT
                    i.Item_ID, 
                    i.Name,
                    i.Notes,
                    i.Photo,
                    i.User_ID,
                    i.Space_ID,
                    i.Type_ID,
                    t.Type_Name as Type,
                    GROUP_CONCAT(DISTINCT se.Season_ID ORDER BY se.Season_ID SEPARATOR ',') as Season_IDs,
                    GROUP_CONCAT(DISTINCT se.Season_Name ORDER BY se.Season_ID SEPARATOR '、') as Seasons,
                    GROUP_CONCAT(DISTINCT st.Style_ID ORDER BY st.Style_ID SEPARATOR ',') as Style_IDs,
                    GROUP_CONCAT(DISTINCT st.Style_Name ORDER BY st.Style_ID SEPARATOR '、') as Styles,
                    GROUP_CONCAT(DISTINCT c.Color_ID ORDER BY c.Color_ID SEPARATOR ',') as Color_IDs,
                    GROUP_CONCAT(DISTINCT c.Color_Name ORDER BY c.Color_ID SEPARATOR ',') as Colors
                FROM Item i
                LEFT JOIN Type t ON i.Type_ID = t.Type_ID
                LEFT JOIN Item_Season ise ON i.Item_ID = ise.Item_ID
                LEFT JOIN Season se ON ise.Season_ID = se.Season_ID
                LEFT JOIN Item_Style isty ON i.Item_ID = isty.Item_ID
                LEFT JOIN Style st ON isty.Style_ID = st.Style_ID
                LEFT JOIN Item_Color ic ON i.Item_ID = ic.Item_ID
                LEFT JOIN Color c ON ic.Color_ID = c.Color_ID
                WHERE i.Item_ID = %s
                GROUP BY i.Item_ID
                """
            cursor.execute(sql, (item_id,))
            return cursor.fetchone()
        
    except Exception as e:
        print(f"查詢衣服詳細資料時發生錯誤: {e}")
        return None
    finally:        
        connection.close()

# 更新Item
def update_item(item_id, name=None, space_id=None, type_id=None, season_ids=None, color_ids=None, style_ids=None, notes=None, photo_path=None):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            fields = []
            params = []

            if name is not None:
                fields.append("Name = %s")
                params.append(name)
            if notes is not None:
                fields.append("Notes = %s")
                params.append(notes)
            if space_id is not None:
                fields.append("Space_ID = %s")
                params.append(space_id)
            if type_id is not None:
                fields.append("Type_ID = %s")
                params.append(type_id)
            
            if fields:
                sql = f"UPDATE `Item` SET {', '.join(fields)} WHERE Item_ID = %s"
                cursor.execute(sql, tuple(params + [item_id]))

            if season_ids is not None:
                cursor.execute("DELETE FROM `Item_Season` WHERE Item_ID = %s", (item_id,))
                if season_ids:
                    sql_season = "INSERT INTO `Item_Season` (`Item_ID`, `Season_ID`) VALUES (%s, %s)"
                    cursor.executemany(sql_season, [(item_id, season_id) for season_id in season_ids])
                
            if color_ids is not None:
                cursor.execute("DELETE FROM `Item_Color` WHERE Item_ID = %s", (item_id,))
                if color_ids:
                    sql_color = "INSERT INTO `Item_Color` (`Item_ID`, `Color_ID`) VALUES (%s, %s)"
                    cursor.executemany(sql_color, [(item_id, color_id) for color_id in color_ids])

            if style_ids is not None:
                cursor.execute("DELETE FROM `Item_Style` WHERE Item_ID = %s", (item_id,))
                if style_ids:
                    sql_style = "INSERT INTO `Item_Style` (`Item_ID`, `Style_ID`) VALUES (%s, %s)"
                    cursor.executemany(sql_style, [(item_id, style_id) for style_id in style_ids])
            
        connection.commit()
        return True, "更新成功"
    
    except Exception as e:
        print(f"更新衣服時發生錯誤: {e}")
        connection.rollback()
        return False, str(e)
    
    finally:
        connection.close()

# 刪除Item
def delete_item(item_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM `Item` WHERE `Item_ID` = %s", (item_id,))
            affected_rows = cursor.rowcount

        connection.commit()

        if affected_rows == 0:
            return False, "找不到指定衣服"

        return True, "刪除衣服成功"

    except Exception as e:
        print(f"刪除衣服時發生錯誤: {e}")
        connection.rollback()
        return False, str(e)

    finally:
        connection.close()

# ==========================================
# 5. 搜尋與篩選 (對應search.py)
# ==========================================
def search_items(user_id, keyword=None, space_id=None, type_id=None, season_ids=None, color_ids=None, style_ids=None):
    connection = get_connection()

    if season_ids is None:
        season_ids = []
    if color_ids is None:
        color_ids = []
    if style_ids is None:
        style_ids = []

    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT 
                    i.Item_ID,
                    i.Name,
                    i.Photo,
                    t.Type_Name as Type,
                    GROUP_CONCAT(DISTINCT se.Season_Name SEPARATOR '、') as Seasons,
                    GROUP_CONCAT(DISTINCT st.Style_Name SEPARATOR '、') as Styles,
                    GROUP_CONCAT(DISTINCT c.Color_Name ORDER BY c.Color_ID SEPARATOR ',') as Colors
                FROM Item i
                LEFT JOIN Type t ON i.Type_ID = t.Type_ID
                LEFT JOIN Item_Season ise ON i.Item_ID = ise.Item_ID
                LEFT JOIN Season se ON ise.Season_ID = se.Season_ID
                LEFT JOIN Item_Style isty ON i.Item_ID = isty.Item_ID
                LEFT JOIN Style st ON isty.Style_ID = st.Style_ID
                LEFT JOIN Item_Color ic ON i.Item_ID = ic.Item_ID
                LEFT JOIN Color c ON ic.Color_ID = c.Color_ID
                WHERE i.User_ID = %s
            """
            # 裝著準備塞入SQL的變數，一開始先放user_id
            params = [user_id]

            #  如果有傳入條件，就把SQL往後加
            if keyword:
                sql += " AND i.Name LIKE %s"
                # 模糊搜尋
                params.append(f"%{keyword}%") 
            if space_id:
                sql += " AND i.Space_ID = %s"
                params.append(space_id)
            if type_id:
                sql += " AND i.Type_ID = %s"
                params.append(type_id)
            
            # 針對多對多
            if season_ids:
                placeholders = ",".join(["%s"] * len(season_ids))
                sql += f"""
                    AND EXISTS (
                        SELECT 1
                        FROM Item_Season sub_ise
                        WHERE sub_ise.Item_ID = i.Item_ID
                        AND sub_ise.Season_ID IN ({placeholders})
                    )
                """
                params.extend(season_ids)

            if color_ids:
                placeholders = ",".join(["%s"] * len(color_ids))
                sql += f"""
                    AND EXISTS (
                        SELECT 1
                        FROM Item_Color sub_ic
                        WHERE sub_ic.Item_ID = i.Item_ID
                        AND sub_ic.Color_ID IN ({placeholders})
                    )
                """
                params.extend(color_ids)

            if style_ids:
                placeholders = ",".join(["%s"] * len(style_ids))
                sql += f"""
                    AND EXISTS (
                        SELECT 1
                        FROM Item_Style sub_is
                        WHERE sub_is.Item_ID = i.Item_ID
                        AND sub_is.Style_ID IN ({placeholders})
                    )
                """
                params.extend(style_ids)


            sql += " GROUP BY i.Item_ID;"

            cursor.execute(sql, tuple(params))
            return cursor.fetchall()
            
    except Exception as e:
        print(f"搜尋衣服時發生資料庫錯誤: {e}")
        return None
    finally:
        connection.close()

# ==========================================
# 6. 搜尋與篩選 (對應Outfits.py)
# ==========================================
# 查詢某個使用者的所有歷史穿搭(可用長和過濾)
def get_outfits_by_user_id(user_id, occasion=None):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT
                    h.History_ID,
                    h.Occasion,
                    h.Photo,
                    h.User_ID,
                    h.Note,
                    h.Time,
                    GROUP_CONCAT(DISTINCT ho.Item_ID ORDER BY ho.Item_ID SEPARATOR ',') AS Item_IDs
                FROM `History` h
                LEFT JOIN `History_Outfit` ho ON h.History_ID = ho.History_ID
                WHERE h.User_ID = %s
            """
            params = [user_id]

            if occasion and occasion != "all":
                sql += " AND h.Occasion = %s"
                params.append(occasion)

            sql += """
                GROUP BY h.History_ID
                ORDER BY h.History_ID DESC
            """

            cursor.execute(sql, tuple(params))
            return cursor.fetchall()

    except Exception as e:
        print(f"Get outfits error: {e}")
        return []

    finally:
        connection.close()

# 查詢某個歷史穿搭的詳細資料
def get_outfit_by_id(history_id):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT
                    h.History_ID,
                    h.Occasion,
                    h.Photo,
                    h.User_ID,
                    h.Note,
                    h.Time,
                    i.Item_ID,
                    i.Name,
                    i.Photo AS Item_Photo,
                    i.Type_ID,
                    t.Type_Name AS Type,
                    GROUP_CONCAT(DISTINCT se.Season_ID ORDER BY se.Season_ID SEPARATOR ',') AS Season_IDs,
                    GROUP_CONCAT(DISTINCT se.Season_Name ORDER BY se.Season_ID SEPARATOR ',') AS Seasons,
                    GROUP_CONCAT(DISTINCT st.Style_ID ORDER BY st.Style_ID SEPARATOR ',') AS Style_IDs,
                    GROUP_CONCAT(DISTINCT st.Style_Name ORDER BY st.Style_ID SEPARATOR ',') AS Styles,
                    GROUP_CONCAT(DISTINCT c.Color_ID ORDER BY c.Color_ID SEPARATOR ',') AS Color_IDs,
                    GROUP_CONCAT(DISTINCT c.Color_Name ORDER BY c.Color_ID SEPARATOR ',') AS Colors
                FROM `History` h
                LEFT JOIN `History_Outfit` ho ON h.History_ID = ho.History_ID
                LEFT JOIN `Item` i ON ho.Item_ID = i.Item_ID
                LEFT JOIN `Type` t ON i.Type_ID = t.Type_ID
                LEFT JOIN `Item_Season` ise ON i.Item_ID = ise.Item_ID
                LEFT JOIN `Season` se ON ise.Season_ID = se.Season_ID
                LEFT JOIN `Item_Style` isty ON i.Item_ID = isty.Item_ID
                LEFT JOIN `Style` st ON isty.Style_ID = st.Style_ID
                LEFT JOIN `Item_Color` ic ON i.Item_ID = ic.Item_ID
                LEFT JOIN `Color` c ON ic.Color_ID = c.Color_ID
                WHERE h.History_ID = %s
                GROUP BY h.History_ID, i.Item_ID
            """

            cursor.execute(sql, (history_id,))
            rows = cursor.fetchall()

            if not rows:
                return None

            return rows

    except Exception as e:
        print(f"Get outfit detail error: {e}")
        return None

    finally:
        connection.close()

# 新增outfit
def create_outfit(user_id, occasion=None, photo=None, note=None, time=None, item_ids=None):
    connection = get_connection()

    if item_ids is None:
        item_ids = []

    try:
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO `History` (`Occasion`, `Photo`, `User_ID`, `Note`, `Time`)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (occasion, photo, user_id, note, time))
            history_id = cursor.lastrowid

            if item_ids:
                sql_items = """
                    INSERT INTO `History_Outfit` (`History_ID`, `Item_ID`)
                    VALUES (%s, %s)
                """
                cursor.executemany(sql_items, [(history_id, item_id) for item_id in item_ids])

        connection.commit()
        return True, history_id

    except Exception as e:
        print(f"Create outfit error: {e}")
        connection.rollback()
        return False, str(e)

    finally:
        connection.close()

# 更新outfit
def update_outfit(history_id, occasion=None, photo=None, note=None, time=None, item_ids=None):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            fields = []
            params = []

            if occasion is not None:
                fields.append("Occasion = %s")
                params.append(occasion)

            if photo is not None:
                fields.append("Photo = %s")
                params.append(photo)

            if note is not None:
                fields.append("Note = %s")
                params.append(note)

            if time is not None:
                fields.append("Time = %s")
                params.append(time)

            if fields:
                sql = f"""
                    UPDATE `History`
                    SET {", ".join(fields)}
                    WHERE `History_ID` = %s
                """
                params.append(history_id)
                cursor.execute(sql, tuple(params))

            if item_ids is not None:
                cursor.execute(
                    "DELETE FROM `History_Outfit` WHERE `History_ID` = %s",
                    (history_id,)
                )

                if item_ids:
                    sql_items = """
                        INSERT INTO `History_Outfit` (`History_ID`, `Item_ID`)
                        VALUES (%s, %s)
                    """
                    cursor.executemany(sql_items, [(history_id, item_id) for item_id in item_ids])

        connection.commit()
        return True, "更新穿搭紀錄成功"

    except Exception as e:
        print(f"Update outfit error: {e}")
        connection.rollback()
        return False, str(e)

    finally:
        connection.close()

# 刪除outfit
def delete_outfit(history_id):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "DELETE FROM `History` WHERE `History_ID` = %s",
                (history_id,)
            )
            affected_rows = cursor.rowcount

        connection.commit()

        if affected_rows == 0:
            return False, "找不到指定穿搭紀錄"

        return True, "刪除穿搭紀錄成功"

    except Exception as e:
        print(f"Delete outfit error: {e}")
        connection.rollback()
        return False, str(e)

    finally:
        connection.close()

# 取得使用者的場合選項
def get_outfit_occasion_options(user_id):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT DISTINCT Occasion
                FROM `History`
                WHERE `User_ID` = %s
                  AND Occasion IS NOT NULL
                  AND Occasion != ''
                ORDER BY Occasion
            """
            cursor.execute(sql, (user_id,))
            rows = cursor.fetchall()

            return [row["Occasion"] for row in rows]

    except Exception as e:
        print(f"Get occasion options error: {e}")
        return []

    finally:
        connection.close()























