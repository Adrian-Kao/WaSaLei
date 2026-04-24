import sys
import os

# --- 尋路魔法：讓 Python 知道上一層資料夾 (backend) 的存在 ---
# 這行的意思是：找到目前這個檔案的「上一層的上一層」，把它加進系統路徑裡
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from database import db

# 新增一件衣服
def add_new_item(user_id, name, space_id, type_id, season, color_ids = None, style_ids = None):
    if color_ids is None: color_ids = []
    if style_ids is None: style_ids = []

    # 避免重複寫入重複的顏色和風格ID，
    color_ids = list(set(color_ids))  
    style_ids = list(set(style_ids))  

    if not name.strip():
        return False, "衣服名稱不能為空"
    
    print(f"準備寫入的顏色清單: {color_ids}, 風格清單: {style_ids}")
    
    success , result = db.insert_new_item(user_id, name, space_id, type_id, season, color_ids, style_ids)

    if success:
        return True, f"成功新增衣服: {name} (ID: {result})"
    else:
        return False, f"新增衣服失敗: {result}"
    
# ==========================================
# 本機測試區塊
# ==========================================
if __name__ == "__main__":
    print("=== 測試新增衣服功能 ===")
    
    test_uid = 1 
    test_name = "我的測試大衣"
    test_sid = 1  
    test_tid = 1  
    test_season = "冬季"
    test_colors = [1, 2] 
    test_styles = [1]    

    # 記得第一個參數要傳入 test_uid
    status, msg = add_new_item(test_uid, test_name, test_sid, test_tid, test_season, test_colors, test_styles)
    print(msg)