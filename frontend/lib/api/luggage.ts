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
    name: space.Space_Name?.trim() || `行李箱 ${space.Space_ID}`,
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

export async function getWardrobeRoomOptions(userId: string | number): Promise<string[]> {
  if (!userId) return [];

  const response = await fetch(
    `${API_BASE_URL}/api/space/user/${userId}?type=${"衣櫃"}`
  );

  if (!response.ok) return [];

  const data = await response.json();
  if (!data.success || !Array.isArray(data.data)) return [];

  const spaces = data.data as Array<{ Space_ID: number }>;
  return spaces.map((space) => String(space.Space_ID));
}

export async function getWardrobeFilteredItemsByUserId(
  userId: string | number,
  filters: LuggageSpaceFilters,
): Promise<LuggageSpaceItem[]> {
  if (!userId) return [];

  const rooms = filters.room && filters.room.length > 0
    ? filters.room
    : await getWardrobeRoomOptions(userId);
  const items = await getLuggageItemsByRoomIds(rooms);
  return items.filter((item) => matchesLuggageFilters(item, filters));
}

export async function requestMoveLuggageItemsToRoom(itemIds: number[], targetRoom: string) {
  return requestMoveSelectedItemsToRoom(itemIds, targetRoom);
}

export async function requestDeleteLuggageItems(itemIds: number[]) {
  return requestDeleteSelectedItems(itemIds);
}

/**
 * 複製衣物到行李箱（調用後端 /api/luggage/items/transfet 使用 mode=copy）
 * 支持批量複製，每個 item 會複製一份副本到目標行李箱
 */
async function requestCopyItemsToLuggage(
  itemIds: number[],
  toLuggageId: number
): Promise<{ success: boolean; failedIds: number[] }> {
  if (itemIds.length === 0) return { success: true, failedIds: [] };

  const failedIds: number[] = [];

  const results = await Promise.all(
    itemIds.map(async (itemId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/luggage/items/transfet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_id: itemId,
            to_space_id: toLuggageId,
            mode: "copy",
          }),
        });

        if (!response.ok) {
          failedIds.push(itemId);
        }
      } catch (error) {
        console.error(`Failed to copy item ${itemId}:`, error);
        failedIds.push(itemId);
      }
    })
  );

  return { success: failedIds.length === 0, failedIds };
}

// 複製衣物到行李（調用複製 API，不是移動）
export async function addItemsToLuggage(luggageId: number, itemIds: number[]): Promise<void> {
  if (itemIds.length === 0) return;

  const result = await requestCopyItemsToLuggage(itemIds, luggageId);
  if (!result.success) {
    if (result.failedIds.length === itemIds.length) {
      throw new Error("複製衣物失敗");
    } else {
      throw new Error(`部分衣物複製失敗，失敗項目: ${result.failedIds.join(", ")}`);
    }
  }
}
