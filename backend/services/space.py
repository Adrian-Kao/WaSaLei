import sys
import os

# --- 尋路魔法：讓 Python 知道上一層資料夾 (backend) 的存在 ---
# 這行的意思是：找到目前這個檔案的「上一層的上一層」，把它加進系統路徑裡
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)
# --------------------------------------------------------
from database import db

VALID_SPACE_TYPES = ["衣櫃", "行李箱"]

# 新增儲衣空間
def add_space(user_id, space_type, capacity):
    if not isinstance(capacity, int) or capacity <= 0:
        return False, "容量必須是正整數"
    
    if not space_type.strip():
        return False, "空間類型不能為空"
    
    if space_type not in VALID_SPACE_TYPES:
        return False, f"無效的空間類型: {space_type}"
    
    success = db.create_new_space(user_id, space_type, capacity)
    if success:
        return True, f"成功建立儲衣空間 {space_type}，容量:{capacity}件"
    else:
        return False, "建立儲衣空間失敗"
    
# 取得該用戶的所有空間
def get_user_all_spaces(user_id):
    return db.get_spaces_by_user_id(user_id)

#給前端抓選項
def get_predefined_space_types():
    return VALID_SPACE_TYPES

# 獲取空間內的衣服並格式化
def get_formatted_items(space_id):
    # 回傳格式 : name, type, season, style, color1, color2, color3

    raw_items = db.fetch_raw_items_by_space(space_id)

    if not raw_items:
        return False, "這個空間沒有衣服"
    
    formatted_items = []
    for item in raw_items:
        # 顏色拆分
        color_list = item['Colors'].split(',') if item['Colors'] else []

        # 組成格式
        formatted_item = {
            "name" : item['Name'],
            "type": item['Type_Name'],
            "season": item['Season'],
            "style": item['Styles'],
            "color1": color_list[0] if len(color_list) > 0 else None,
            "color2": color_list[1] if len(color_list) > 1 else None,
            "color3": color_list[2] if len(color_list) > 2 else None
        }
        formatted_items.append(formatted_item)
    
    return True, formatted_items

# ==========================================
# 本機測試區塊
# ==========================================
if __name__ == "__main__":
    print("=== 測試 space.py (允許重複類型) ===")
    test_uid = 1 
    
    print(add_space(test_uid, "衣櫃", 20)[1])
    print(add_space(test_uid, "行李箱", 40)[1])
    print(add_space(test_uid, "你啊罵", 40)[1])
    
    all_s = get_user_all_spaces(test_uid)
    print(f"\n目前用戶 {test_uid} 的空間清單：")
    for s in all_s:
        # 這裡印出 Space_ID，用來區分不同的「宿舍」
        print(f"ID: {s['Space_ID']} | 類型: {s['Space_Type']} | 容量: {s['Capacity']}")

    print("\n--- 測試獲取空間內的衣服 ---")
    TEST_SPACE_ID = 1  # 假設測試查詢 Space_ID 為 1 的空間
    
    is_success, result = get_formatted_items(TEST_SPACE_ID)
    
    if is_success:
        print(f"成功撈到資料！共 {len(result)} 件衣服：")
        for item in result:
            print(f"衣服名稱: {item['name']}")
            print(f"   - 基本資訊: 類型({item['type']}) | 季節({item['season']}) | 風格({item['style']})")
            print(f"   - 顏色拆解: 1.{item['color1']} / 2.{item['color2']} / 3.{item['color3']}")
            print("-" * 30)
    else:
        # 如果空間裡沒衣服，或是資料庫還沒建資料，就會印出這裡的訊息
        print(f"{result}")