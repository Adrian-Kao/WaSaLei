import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from database import db

VALID_SPACE_TYPES = ["衣櫃", "行李箱"]


def add_space(user_id, space_type, capacity):
    if not isinstance(capacity, int) or capacity <= 0:
        return False, "容量必須是正整數"

    if not str(space_type or "").strip():
        return False, "空間類型不能為空"

    if space_type not in VALID_SPACE_TYPES:
        return False, f"不支援的空間類型: {space_type}"

    success = db.create_new_space(user_id, space_type, capacity)
    if success:
        return True, f"成功新增空間: {space_type}, 容量: {capacity}"
    return False, "新增空間失敗"


def get_user_all_spaces(user_id, space_type=None):
    spaces = db.get_spaces_by_user_id(user_id)
    if space_type:
        spaces = [space for space in spaces if space.get("Space_Type") == space_type]
    return spaces


def get_predefined_space_types():
    return VALID_SPACE_TYPES


def get_formatted_items(space_id):
    raw_items = db.fetch_raw_items_by_space(space_id)

    if not raw_items:
        return True, []

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
            "colors": color_list,
            "color1": color_list[0] if len(color_list) > 0 else None,
            "color2": color_list[1] if len(color_list) > 1 else None,
            "color3": color_list[2] if len(color_list) > 2 else None,
            "photo_url": photo_url,
        })

    return True, formatted_items


if __name__ == "__main__":
    print("=== space.py local test ===")

    test_user_id = 1
    test_space_id = 1

    print("Predefined space types:")
    print(get_predefined_space_types())

    print(f"\nSpaces for user_id={test_user_id}:")
    spaces = get_user_all_spaces(test_user_id)
    print("count:", len(spaces))
    for space in spaces[:10]:
        print(space)

    print(f"\nItems in space_id={test_space_id}:")
    success, items = get_formatted_items(test_space_id)
    print("success:", success)
    print("count:", len(items) if success else 0)
    if success:
        for item in items[:10]:
            print(f"[{item['item_id']}] {item['name']} | type={item['type']} | seasons={item['seasons']} | colors={item['colors']}")
    else:
        print(items)

    print("\nAdd space test is intentionally not run to avoid creating duplicate spaces.")
    print("To test manually, call: add_space(1, '衣櫃', 20)")
