import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from database import db

# 複合條件搜尋衣服
def search_wardrobe(user_id, keyword=None, space_id=None, type_id=None, season=None, color_id=None, style_id=None):
    
    raw_items = db.search_items(user_id, keyword, space_id, type_id, season, color_id, style_id)

    if raw_items is None:
        return False, "搜尋時發生錯誤，請稍後再試"
    
    # 成功執行，但條件太嚴格，沒有找到衣服
    if len(raw_items) == 0:
        return True, [] 

    # 成功找到衣服，開始格式化
    formatted_items = []
    for item in raw_items:
        color_list = item['Colors'].split(',') if item['Colors'] else []

        photo_filename = item.get('Photo')
        photo_url = f"http://127.0.1:5000/images/{photo_filename}" if photo_filename else None

        formatted_item = {
            "item_id": item['Item_ID'],
            "name" : item['Name'],
            "type": item['Type'],
            "season": item['Season'],
            "style": item['Styles'],
            "color1": color_list[0] if len(color_list) > 0 else None,
            "color2": color_list[1] if len(color_list) > 1 else None,
            "color3": color_list[2] if len(color_list) > 2 else None,
            "photo_url": photo_url
        }
        formatted_items.append(formatted_item)
    
    return True, formatted_items

# ==========================================
# 本機測試區塊
# ==========================================
if __name__ == "__main__":
    print("=== 測試 search.py (多條件搜尋) ===")
    test_uid = 1 
    
    print("\n--- 1. 測試：搜尋名稱包含 '黑' 的衣服 ---")
    status, items = search_wardrobe(test_uid, keyword="黑")
    if status and items:
        for item in items:
            print(f"{item['name']} (類型: {item['type']}, 季節: {item['season']}, 顏色: {item['color1']})")
    else:
        print("沒有找到衣服或發生錯誤")

    print("\n--- 2. 測試：搜尋 '夏季' 且 包含 '藍色(Color_ID=2)' 的衣服 ---")
    status, items = search_wardrobe(test_uid, season="夏", color_id=2)
    if status and items:
        for item in items:
            print(f"{item['name']} (類型: {item['type']}, 季節: {item['season']}, 顏色: {item['color1']})")
    else:
        print("沒有找到衣服或發生錯誤")