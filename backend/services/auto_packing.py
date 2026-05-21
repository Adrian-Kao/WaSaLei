import re
import sys
from pathlib import Path

current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
sys.path.append(str(parent_dir))

from database import db


def generate_auto_outfit_selection(luggage_id, candidate_items):
    """Generate selected item IDs for auto packing from frontend-filtered candidates."""
    luggage = db.get_space_capacity_status(luggage_id)
    if luggage is None:
        return False, "找不到指定行李箱"

    if luggage.get("Space_Type") != "行李箱":
        return False, "指定空間不是行李箱"

    normalized_items = [_normalize_candidate_item(item) for item in candidate_items or []]
    normalized_items = [item for item in normalized_items if item is not None]

    if not normalized_items:
        return False, "目前篩選條件下沒有可用衣服"

    days = _parse_packing_days(luggage.get("Space_Name") or "")
    result = _generate_selection(normalized_items, days)

    return True, {
        "days": days,
        "luggage_name": luggage.get("Space_Name"),
        "selected_item_ids": result["selected_item_ids"],
        "warnings": result["warnings"],
    }


def _normalize_candidate_item(item):
    try:
        item_id = int(item.get("id") or item.get("item_id"))
    except (TypeError, ValueError):
        return None

    return {
        "id": item_id,
        "name": str(item.get("name") or ""),
        "type": str(item.get("type") or ""),
    }


def _parse_packing_days(luggage_name):
    parts = [part.strip() for part in str(luggage_name or "").split("|")]
    if len(parts) > 1:
        try:
            explicit_days = int(float(parts[1]))
            if explicit_days > 0:
                return explicit_days
        except (TypeError, ValueError):
            pass

    matched_days = re.search(r"(\d+)\s*(日|天)", str(luggage_name or ""))
    if matched_days:
        return max(1, int(matched_days.group(1)))

    first_number = re.search(r"\d+", str(luggage_name or ""))
    if first_number:
        return max(1, int(first_number.group(0)))

    return 1


def _classify_packing_category(type_name):
    value = str(type_name or "")
    if re.search(r"鞋|靴|球鞋|拖鞋|涼鞋|鞋類", value):
        return "shoes"
    if re.search(r"褲|裙|短褲|長褲|下身", value):
        return "bottom"
    if re.search(r"帽|包|襪|飾|項鍊|戒指|手錶|皮帶|圍巾|領帶|配件", value):
        return "accessory"
    if re.search(r"衣|上衣|外套|襯衫|毛衣|背心|洋裝|連身|T|tee|衫|上身", value, re.IGNORECASE):
        return "top"
    return "other"


def _pick_by_day(items, day_index, repeat_every=1):
    if not items:
        return None
    return items[(day_index // repeat_every) % len(items)]


def _generate_selection(items, days):
    grouped = {
        "top": [],
        "bottom": [],
        "shoes": [],
        "accessory": [],
        "other": [],
    }

    for item in items:
        grouped[_classify_packing_category(item.get("type"))].append(item)

    selected_ids = []
    selected_seen = set()
    warnings = []
    target_days = max(1, int(days or 1))

    if not grouped["top"] and not grouped["bottom"]:
        for item in items[:target_days]:
            _add_selected(selected_ids, selected_seen, item)
        warnings.append("目前篩選結果無法分辨上身或下身，已先選擇可用衣服。")
        return {"selected_item_ids": selected_ids, "warnings": warnings}

    if len(grouped["top"]) < target_days:
        warnings.append("上身衣物少於天數，部分天數會重複搭配。")

    if not grouped["bottom"]:
        warnings.append("沒有可用下身衣物，穿搭可能不完整。")

    if not grouped["shoes"]:
        warnings.append("沒有可用鞋類，穿搭未包含鞋子。")

    for day in range(target_days):
        top = _pick_by_day(grouped["top"], day)
        bottom = _pick_by_day(grouped["bottom"], day, 2)
        shoes = _pick_by_day(grouped["shoes"], day, target_days)
        accessory = _pick_by_day(grouped["accessory"], day, 2)

        for item in [top, bottom, shoes, accessory]:
            _add_selected(selected_ids, selected_seen, item)

    return {"selected_item_ids": selected_ids, "warnings": warnings}


def _add_selected(selected_ids, selected_seen, item):
    if not item:
        return
    item_id = item.get("id")
    if item_id in selected_seen:
        return
    selected_seen.add(item_id)
    selected_ids.append(item_id)
