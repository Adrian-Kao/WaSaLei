import {
  getSpaceItems,
  requestDeleteSelectedItems,
  requestMoveSelectedItemsToRoom,
} from "@/lib/api/clothing";
import {
  createClothingFilters,
  type ClothingFilters,
  type ClothingItem,
} from "@/lib/types/clothing";
import { useUserStore } from "@/store/store";

// 後端返回的 DTO 格式
interface LuggageDTO {
  id: number;
  name: string; // 後端直接回傳要顯示的名
}

export type LuggageSpaceItem = ClothingItem;
export type LuggageSpaceFilters = ClothingFilters;

export const createLuggageSpaceFilters = createClothingFilters;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";

function getCurrentUserId() {
  return useUserStore.getState().userId;
}

function matchesLuggageFilters(item: LuggageSpaceItem, filters: LuggageSpaceFilters) {
  const itemStyles = Array.isArray(item.style) ? item.style : [item.style];
  const itemColors = item.color.filter((color) => color && color !== "none");

  if (filters.season.length > 0 && !filters.season.some((season) => item.season.includes(season))) {
    return false;
  }

  if (filters.style.length > 0 && !filters.style.some((style) => itemStyles.includes(style))) {
    return false;
  }

  if (filters.type.length > 0 && !filters.type.includes(item.type)) {
    return false;
  }

  if (filters.color.length > 0 && !filters.color.some((color) => itemColors.includes(color))) {
    return false;
  }

  return true;
}

async function getLuggageItemsByRoomIds(roomIds: string[]) {
  if (roomIds.length === 0) return [];

  const itemsByRoom = await Promise.all(roomIds.map((roomId) => getSpaceItems(roomId)));
  const merged = itemsByRoom.flat();
  const deduped = new Map<number, LuggageSpaceItem>();

  for (const item of merged) {
    deduped.set(item.id, item);
  }

  return Array.from(deduped.values());
}

/**
 * Format luggage name: { note, duration, season } → 單一 name 字串
 * 這裡只負責把前端輸入組成後端要的 name。
 */
export function formatLuggageName(note: string, duration: string, season: string | string[]): string {
  const seasonStr = Array.isArray(season) ? season.join("") : season;
  return `${note}|${duration}|${seasonStr}`;
}

// TODO: 接後端 API 取得使用者的行李清單
export async function getLuggageList(userId: string | number): Promise<LuggageDTO[]> {
  if (!userId) return [];

  const response = await fetch(
    `${API_BASE_URL}/api/space/user/${userId}?type=${"行李箱"}`
  );

  if (!response.ok) return [];

  const data = await response.json();
  if (!data.success || !Array.isArray(data.data)) return [];

  const spaces = data.data as Array<{ Space_ID: number; Space_Name?: string | null }>;

  return spaces.map((space) => ({
    id: space.Space_ID,
    name: space.Space_Name?.trim() || `行李 ${space.Space_ID}`,
  }));
}

// TODO: 接後端 API 建立新行李
// 注意：如果行李和衣柜是同一個實體，可以改為調用衣柜的 API 端點
// 例如：POST /api/wardrobes 或 POST /api/closets
export async function createLuggage(name: string): Promise<LuggageDTO> {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("缺少 userId，無法建立行李");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/space`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: Number(userId),
        space_type: "行李箱",
        space_name: name,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      id: Number(data.spaceId),
      name,
    };
  } catch (error) {
    console.error("Failed to create luggage:", error);
    throw error;
  }
}

// TODO: 接後端 API 刪除行李
export async function deleteLuggage(luggageId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/space/${luggageId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
}

export function getLuggageSpaceName(userId: string | number) {
  return getLuggageList(userId);
}

export async function getLuggageSpaceItems() {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const luggages = await getLuggageList(userId);
  const roomIds = luggages.map((luggage) => String(luggage.id));
  return getLuggageItemsByRoomIds(roomIds);
}

export async function getLuggageFilteredItems(filters: LuggageSpaceFilters) {
  const rooms = filters.room && filters.room.length > 0 ? filters.room : await getLuggageRoomOptions(getCurrentUserId() ?? "");
  const items = await getLuggageItemsByRoomIds(rooms);
  return items.filter((item) => matchesLuggageFilters(item, filters));
}

export async function getLuggageRoomOptions(userId: string | number): Promise<string[]> {
  const luggages = await getLuggageList(userId);
  return luggages.map((luggage) => String(luggage.id));
}

export async function requestMoveLuggageItemsToRoom(itemIds: number[], targetRoom: string) {
  return requestMoveSelectedItemsToRoom(itemIds, targetRoom);
}

export async function requestDeleteLuggageItems(itemIds: number[]) {
  return requestDeleteSelectedItems(itemIds);
}

// TODO: 接後端 API 取得所有房間的衣物（可篩選）
export async function getAllWardrobeItems(filters: LuggageSpaceFilters): Promise<LuggageSpaceItem[]> {
  const rooms = filters.room && filters.room.length > 0 ? filters.room : await getLuggageRoomOptions(getCurrentUserId() ?? "");
  const items = await getLuggageItemsByRoomIds(rooms);
  return items.filter((item) => matchesLuggageFilters(item, filters));
}

// TODO: 接後端 API 新增衣物到行李
export async function addItemsToLuggage(luggageId: number, itemIds: number[]): Promise<void> {
  if (itemIds.length === 0) return;

  const result = await requestMoveSelectedItemsToRoom(itemIds, String(luggageId));
  if (!result.success) {
    throw new Error("部分衣物移動失敗");
  }
}
