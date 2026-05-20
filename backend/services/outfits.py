import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from database import db


OCCASION_OPTIONS = ["日常", "上班", "正式", "社交", "運動", "旅行", "其他"]


# Get all outfit records for one user.
def get_user_outfits(user_id, occasion=None):
    if occasion == "all":
        occasion = None
    if occasion and occasion not in OCCASION_OPTIONS:
        return []

    rows = db.get_outfits_by_user_id(user_id, occasion)

    return [
        {
            "id": row.get("History_ID"),
            "wornDate": _format_date(row.get("Worn_Date")),
            "photo": _to_photo_url(row.get("Photo")),
            "note": row.get("Note") or "",
            "occasion": row.get("Occasion") or "",
            "item_ids": _split_ints(row.get("Item_IDs")),
        }
        for row in rows
    ]


# Get one outfit detail with item cards.
def get_outfit_detail(history_id):
    rows = db.get_outfit_by_id(history_id)

    if not rows:
        return False, "找不到指定穿搭歷史"

    first = rows[0]

    outfit = {
        "id": first.get("History_ID"),
        "wornDate": _format_date(first.get("Worn_Date")),
        "photo": _to_photo_url(first.get("Photo")),
        "note": first.get("Note") or "",
        "occasion": first.get("Occasion") or "",
        "items": [],
    }

    for row in rows:
        if row.get("Item_ID") is None:
            continue

        outfit["items"].append({
            "id": row.get("Item_ID"),
            "name": row.get("Name"),
            "color": _to_three_colors(_split_text(row.get("Colors"))),
            "season": _split_text(row.get("Seasons")),
            "type": row.get("Type"),
            "style": _split_text(row.get("Styles")),
            "imageUrl": _to_photo_url(row.get("Item_Photo")),
        })

    return True, outfit


# Create one outfit record.
def create_outfit_record(data):
    user_id = data.get("user_id")
    if not user_id:
        return False, "user_id is required"

    success, occasion_or_message = _validate_occasion(data.get("occasion") or "其他")
    if not success:
        return False, occasion_or_message

    item_ids = _normalize_id_list(data.get("item_ids"))

    success, result = db.create_outfit(
        user_id=user_id,
        occasion=occasion_or_message,
        photo=data.get("photo"),
        note=data.get("note"),
        worn_date=data.get("wornDate") or data.get("worn_date") or data.get("date"),
        item_ids=item_ids,
    )

    if not success:
        return False, result

    return get_outfit_detail(result)


# Update one outfit record.
def update_outfit_record(history_id, data):
    item_ids = None
    if "item_ids" in data:
        item_ids = _normalize_id_list(data.get("item_ids"))

    occasion = None
    if "occasion" in data:
        success, occasion_or_message = _validate_occasion(data.get("occasion"))
        if not success:
            return False, occasion_or_message
        occasion = occasion_or_message

    success, result = db.update_outfit(
        history_id=history_id,
        occasion=occasion,
        photo=data.get("photo") if "photo" in data else None,
        note=data.get("note") if "note" in data else None,
        worn_date=(data.get("wornDate") or data.get("worn_date") or data.get("date")) if ("wornDate" in data or "worn_date" in data or "date" in data) else None,
        item_ids=item_ids,
    )

    if not success:
        return False, result

    return get_outfit_detail(history_id)


# Delete one outfit record.
def delete_outfit_record(history_id):
    return db.delete_outfit(history_id)


# Get fixed occasion filter options.
def get_occasion_options(user_id):
    return ["all"] + OCCASION_OPTIONS


# Validate occasion against the fixed backend option list.
def _validate_occasion(value):
    if value not in OCCASION_OPTIONS:
        return False, f"occasion must be one of: {', '.join(OCCASION_OPTIONS)}"
    return True, value


# Normalize None, scalar, comma string, or list into int list.
def _normalize_id_list(value):
    if value is None or value == "":
        return []

    if isinstance(value, list):
        return list({int(item) for item in value if item != "" and item is not None})

    if isinstance(value, str):
        return list({int(item.strip()) for item in value.split(",") if item.strip()})

    return [int(value)]


# Split comma-separated text into list.
def _split_text(value):
    if not value:
        return []
    return [item for item in str(value).split(",") if item]


# Split comma-separated ids into integer list.
def _split_ints(value):
    if not value:
        return []
    return [int(item) for item in str(value).split(",") if item]


# Make item color array fit frontend ItemCard shape.
def _to_three_colors(colors):
    return [
        colors[0] if len(colors) > 0 else "none",
        colors[1] if len(colors) > 1 else "none",
        colors[2] if len(colors) > 2 else "none",
    ]


# Convert stored photo path into frontend-friendly URL.
def _to_photo_url(photo):
    if not photo:
        return "/1.webp"

    if str(photo).startswith("http"):
        return photo

    if str(photo).startswith("/"):
        return photo

    if "/" not in str(photo) and "\\" not in str(photo):
        return f"/pictures/Outfits/final/{photo}"

    return f"/{photo}"


# Format a database DATE value for frontend wornDate display.
def _format_date(value):
    if value is None:
        return ""

    return str(value)


if __name__ == "__main__":
    print("=== outfits.py local test ===")

    test_user_id = 1
    test_history_id = 1

    print(f"\nGet user outfits: user_id={test_user_id}")
    outfits = get_user_outfits(test_user_id)
    print("count:", len(outfits))
    print("result:", outfits)

    print(f"\nGet occasion options: user_id={test_user_id}")
    options = get_occasion_options(test_user_id)
    print("result:", options)

    print(f"\nGet outfit detail: history_id={test_history_id}")
    success, result = get_outfit_detail(test_history_id)
    print("success:", success)
    print("result:", result)

    RUN_WRITE_TESTS = True

    if RUN_WRITE_TESTS:
        print("\nCreate outfit test")
        success, result = create_outfit_record({
            "user_id": test_user_id,
            "occasion": "日常",
            "note": "Created by outfits.py local test.",
            "wornDate": "2026-05-09",
            "item_ids": [1, 2],
        })
        print("success:", success)
        print("result:", result)

        if success:
            created_id = result.get("id")

            print("\nUpdate outfit test")
            success, result = update_outfit_record(created_id, {
                "occasion": "上班",
                "note": "Updated by outfits.py local test.",
                "item_ids": [1],
            })
            print("success:", success)
            print("result:", result)

            print("\nDelete outfit test")
            success, result = delete_outfit_record(created_id)
            print("success:", success)
            print("result:", result)
    else:
        print("\nWrite tests are disabled. Set RUN_WRITE_TESTS = True to test create/update/delete manually.")