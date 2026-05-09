import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from database import db


# Create an item record after normalizing attributes and checking capacity.
def create_item_record(user_id, name, space_id, type_id, season_ids, color_ids=None, style_ids=None, photo_path=None):
    color_ids = _normalize_id_list(color_ids)
    style_ids = _normalize_id_list(style_ids)
    season_ids = _normalize_id_list(season_ids)

    if not str(name or "").strip():
        return False, "衣服名稱不能為空"
    if space_id is not None:
        status = db.get_space_capacity_status(space_id)

        if status is None:
            return False, "找不到指定空間"

        if status["Is_Full"]:
            return False, "此空間容量已滿，無法新增衣物"

    return db.insert_new_item(
        user_id,
        name,
        space_id,
        type_id,
        season_ids,
        color_ids,
        style_ids,
        photo_path,
    )

# Get one item detail and format it for API responses.
def get_item_detail(item_id):
    item = db.get_item_by_id(item_id)

    if not item:
        return False, "找不到指定衣服"

    return True, _format_item_detail(item)

# Update one item and replace provided multi-select relation groups.
def update_item_record(item_id, data):
    season_ids = _normalize_id_list(data.get("season_ids")) if "season_ids" in data else None
    color_ids = _normalize_id_list(data.get("color_ids")) if "color_ids" in data else None
    style_ids = _normalize_id_list(data.get("style_ids")) if "style_ids" in data else None

    success, result = db.update_item(
        item_id=item_id,
        name=data.get("name") if "name" in data else None,
        notes=data.get("notes") if "notes" in data else None,
        space_id=data.get("space_id") if "space_id" in data else None,
        type_id=data.get("type_id") if "type_id" in data else None,
        season_ids=season_ids,
        color_ids=color_ids,
        style_ids=style_ids,
    )

    if not success:
        return False, result

    return get_item_detail(item_id)

# Delete one item; relation rows are removed by database cascades.
def delete_item_record(item_id):
    return db.delete_item(item_id)

# Move one item to a target space with capacity validation in db layer.
def move_item_space(item_id, target_space_id):
    return db.move_item_to_space(item_id, target_space_id)

# 查詢與該item有關的歷史穿搭
def getOutfitsByItem(item_id):
    rows = db.get_outfits_by_item(item_id)

    result = []

    for row in rows:
        photo = row.get("Photo")

        result.append({
            "imageUrl": f"/{photo}" if photo else None,
            "wornDate": str(row.get("Worn_Date")) if row.get("Worn_Date") else None,
            "occasion": row.get("Occasion")
        })

    return True, result

# ==========================================
# Helper
# ==========================================
# Convert one database item row into frontend-friendly JSON.
def _format_item_detail(item):
    photo = item.get("Photo")
    return {
        "item_id": item.get("Item_ID"),
        "name": item.get("Name"),
        "notes": item.get("Notes"),
        "photo": photo,
        "photo_url": f"/{photo}" if photo else None,
        "user_id": item.get("User_ID"),
        "space_id": item.get("Space_ID"),
        "type_id": item.get("Type_ID"),
        "type": item.get("Type"),
        "season_ids": _split_ints(item.get("Season_IDs")),
        "seasons": _split_text(item.get("Seasons"), "、"),
        "style_ids": _split_ints(item.get("Style_IDs")),
        "styles": _split_text(item.get("Styles"), "、"),
        "color_ids": _split_ints(item.get("Color_IDs")),
        "colors": _split_text(item.get("Colors"), ","),
    }

# Normalize None, scalar, comma string, or list into unique int IDs.
def _normalize_id_list(value):
    if value is None or value == "":
        return []

    if isinstance(value, list):
        return list({int(item) for item in value if item != "" and item is not None})

    if isinstance(value, str):
        return list({int(item.strip()) for item in value.split(",") if item.strip()})

    return [int(value)]

# Split a GROUP_CONCAT text field into a list.
def _split_text(value, separator):
    if not value:
        return []
    return value.split(separator)

# Split a GROUP_CONCAT ID field into a list of integers.
def _split_ints(value):
    if not value:
        return []
    return [int(item) for item in value.split(",") if item]

if __name__ == "__main__":
    print("=== items.py local test ===")

    test_item_id = 1

    print(f"Get item detail: item_id={test_item_id}")
    success, result = get_item_detail(test_item_id)
    print("success:", success)
    print("result:", result)

    RUN_WRITE_TESTS = False

    if RUN_WRITE_TESTS:
        print("\nUpdate item test")
        success, result = update_item_record(
            test_item_id,
            {
                "name": "本機測試衣物名稱",
                "notes": "本機測試備註",
                "season_ids": [1, 2],
                "color_ids": [1],
                "style_ids": [1],
            },
        )
        print("success:", success)
        print("result:", result)

        print("\nDelete item test is not recommended on seed data.")
        print("Call delete_item_record(item_id) manually only for disposable test data.")
    else:
        print("\nWrite tests are disabled. Set RUN_WRITE_TESTS = True to test update manually.")
