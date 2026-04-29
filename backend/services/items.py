import sys
import os

def configure_console_encoding():
    """Force UTF-8 output to avoid garbled Chinese text in terminal/output panel."""
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        # Keep execution unaffected even if stream reconfiguration is unsupported.
        pass


configure_console_encoding()

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from database import db

# 新增一件衣服
def add_new_item(user_id, name, space_id, type_id, season, color_ids = None, style_ids = None, photo_filename = None):
    if color_ids is None: color_ids = []
    if style_ids is None: style_ids = []

    # 避免重複寫入重複的顏色和風格ID，
    color_ids = list(set(color_ids))  
    style_ids = list(set(style_ids))  

    if not name.strip():
        return False, "衣服名稱不能為空"
    
    print(f"準備寫入的顏色清單: {color_ids}, 風格清單: {style_ids}")
    
    success , result = db.insert_new_item(user_id, name, space_id, type_id, season, color_ids, style_ids, photo_filename)

    if success:
        return True, f"成功新增衣服: {name} (ID: {result})"
    else:
        return False, f"新增衣服失敗: {result}"
    
# ==========================================
# 本機測試區塊
# ==========================================
if __name__ == "__main__":
    print("=== 測試新增衣服功能 (共用儲存區架構) ===")
    
    # 1. 準備測試資料
    test_uid = 1 
    test_name = "防潑水機能衝鋒衣"
    test_sid = 1  
    test_tid = 2  # 假設 2 是外套
    test_season = "秋"
    test_colors = [1, 3] # 假設 1:黑色, 3:灰色
    test_styles = [2, 4] # 假設 2:戶外, 4:運動
    
    # 2. 模擬前端傳來的去背完成檔名 (不用再真的去讀取硬碟裡的圖片了)
    mock_photo_filename = "preview_abcd1234.png"
    
    # 3. 呼叫我們改好的單純函數
    status, msg = add_new_item(
        user_id=test_uid, 
        name=test_name, 
        space_id=test_sid, 
        type_id=test_tid, 
        season=test_season, 
        color_ids=test_colors, 
        style_ids=test_styles,
        photo_filename=mock_photo_filename  # 只傳純文字字串！
    )
    
    print("--- 執行結果 ---")
    print(msg)