import db

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