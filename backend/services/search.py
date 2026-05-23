import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from database import db
# 搜尋衣櫃衣物。
def search_wardrobe(user_id, keyword=None, space_id=None, type_id=None, season_ids=None, color_ids=None, style_ids=None):
    if season_ids is None:
        season_ids = []
    if color_ids is None:
        color_ids = []
    if style_ids is None:
        style_ids = []

    raw_items = db.search_items(
        user_id,
        keyword=keyword,
        space_id=space_id,
        type_id=type_id,
        season_ids=season_ids,
        color_ids=color_ids,
        style_ids=style_ids,
    )

    if raw_items is None:
        return False, "搜尋時發生錯誤，請稍後再試"

    formatted_items = []
    for item in raw_items:
        color_list = item["Colors"].split(",") if item["Colors"] else []
        style_list = item["Styles"].split("、") if item["Styles"] else []
        season_list = item["Seasons"].split("、") if item["Seasons"] else []

        photo_filename = item.get("Photo")
        photo_url = f"/{photo_filename}" if photo_filename else None

        formatted_items.append({
            "item_id": item["Item_ID"],
            "name": item["Name"],
            "type": item["Type"],
            "seasons": season_list,
            "styles": style_list,
            "color1": color_list[0] if len(color_list) > 0 else None,
            "color2": color_list[1] if len(color_list) > 1 else None,
            "color3": color_list[2] if len(color_list) > 2 else None,
            "colors": color_list,
            "photo_url": photo_url,
        })

    return True, formatted_items


if __name__ == "__main__":
    print("=== search.py local test ===")

    test_user_id = 1

    cases = [
        ("All user items", {"user_id": test_user_id}),
        ("Keyword search", {"user_id": test_user_id, "keyword": "黑"}),
        ("Filter by space", {"user_id": test_user_id, "space_id": 1}),
        ("Filter by type", {"user_id": test_user_id, "type_id": 1}),
        ("Filter by multi-select ids", {"user_id": test_user_id, "season_ids": [1, 2], "color_ids": [1, 3], "style_ids": [1]}),
    ]

    for title, kwargs in cases:
        print(f"\n--- {title} ---")
        success, items = search_wardrobe(**kwargs)
        print("success:", success)
        print("count:", len(items) if success else 0)
        if success:
            for item in items[:5]:
                print(f"[{item['item_id']}] {item['name']} | type={item['type']} | seasons={item['seasons']} | colors={item['colors']}")
        else:
            print(items)
