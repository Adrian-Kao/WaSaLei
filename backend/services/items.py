import sys
import os
import uuid

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from database import db

UPLOAD_FOLDER = os.path.join(parent_dir, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 將前端傳的圖片以二進位制方式儲存到本地，並回傳儲存的路徑
def save_photo_to_local(file_bytes, original_filename):
    if not file_bytes:
        return None, "沒有收到圖片檔案"
    
    # 取得副檔名
    ext = os.path.splitext(original_filename)[1]

    # 生成不重複的新檔名
    new_filename = f"{uuid.uuid4().hex}{ext}"

    save_path = os.path.join(UPLOAD_FOLDER, new_filename)

    # 寫入資料夾
    with open(save_path, 'wb') as f:
        f.write(file_bytes)

    return f"uploads/{new_filename}"

# 新增一件衣服
def add_new_item(user_id, name, space_id, type_id, season, color_ids = None, style_ids = None, photo_bytes = None, photo_filename = None):
    if color_ids is None: color_ids = []
    if style_ids is None: style_ids = []

    # 避免重複寫入重複的顏色和風格ID，
    color_ids = list(set(color_ids))  
    style_ids = list(set(style_ids))  

    if not name.strip():
        return False, "衣服名稱不能為空"
    
    print(f"準備寫入的顏色清單: {color_ids}, 風格清單: {style_ids}")
    
    # 處理圖片上傳
    photo_path = None
    if photo_bytes and photo_filename:
        photo_path = save_photo_to_local(photo_bytes, photo_filename)

    success , result = db.insert_new_item(user_id, name, space_id, type_id, season, color_ids, style_ids, photo_path)

    if success:
        return True, f"成功新增衣服: {name} (ID: {result})"
    else:
        return False, f"新增衣服失敗: {result}"
    
# ==========================================
# 本機測試區塊
# ==========================================
if __name__ == "__main__":
    print("=== 測試新增衣服功能 (含圖片上傳) ===")
    
    # 1. 準備測試資料
    test_uid = 1 
    test_name = "防潑水機能衝鋒衣"
    test_sid = 1  
    test_tid = 2  # 假設 2 是外套
    test_season = "秋"
    test_colors = [1, 3] # 假設 1:黑色, 3:灰色
    test_styles = [2, 4] # 假設 2:戶外, 4:運動
    
    # 2. 準備圖片資料
    # 為了避免絕對路徑在你換電腦時壞掉，這裡改抓「跟 items.py 同一個資料夾」底下的 test.jpg
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    test_image_path = os.path.join(current_dir, "test.jpg")
    
    photo_bytes = None
    photo_filename = None
    
    # 3. 嘗試讀取圖片
    if os.path.exists(test_image_path):
        with open(test_image_path, "rb") as f:
            photo_bytes = f.read()
        photo_filename = "test.jpg"
        print(f"成功讀取測試圖片：{test_image_path}\n")
    else:
        print(f"找不到測試圖片：{test_image_path}")
        print("提示：請隨便拿一張圖片，改名為 test.jpg，放在跟 items.py 同一個資料夾 (services) 裡面。")
        print("目前先以「無圖片」的狀態進行寫入測試...\n")

    # 4. 呼叫我們寫好的神聖函數
    status, msg = add_new_item(
        user_id=test_uid, 
        name=test_name, 
        space_id=test_sid, 
        type_id=test_tid, 
        season=test_season, 
        color_ids=test_colors, 
        style_ids=test_styles,
        photo_bytes=photo_bytes,       # 把圖片二進制檔案交給它
        photo_filename=photo_filename  # 把圖片名稱交給它
    )
    
    print("--- 執行結果 ---")
    print(msg)