import {
  getWardrobeClothingItems,
  getWardrobeFilteredClothingItems,
  getUserRooms,
  requestDeleteSelectedItems,
  requestMoveSelectedItemsToRoom,
} from "@/lib/api/clothing";
import {
  createClothingFilters,
  type ClothingFilters,
  type ClothingItem,
} from "@/lib/types/clothing";

// 後端返回的 DTO 格式
interface LuggageDTO {
  id: number;
  name: string; // 後端直接回傳要顯示的名稱
}

export type LuggageSpaceItem = ClothingItem;
export type LuggageSpaceFilters = ClothingFilters;

export const createLuggageSpaceFilters = createClothingFilters;

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
  // const response = await fetch(`/api/users/${userId}/luggages`);
  // const data: LuggageDTO[] = await response.json();
  // return data;

  // 假資料（開發用）
  const mockLuggages: LuggageDTO[] = [
    { id: 1, name: "回家|三日|夏" },
    { id: 2, name: "日本|五日|秋冬" },
    { id: 3, name: "韓國|七日|春" },
  ];
  
  return Promise.resolve(mockLuggages);
}

// TODO: 接後端 API 建立新行李
// 注意：如果行李和衣柜是同一個實體，可以改為調用衣柜的 API 端點
// 例如：POST /api/wardrobes 或 POST /api/closets
export async function createLuggage(name: string): Promise<LuggageDTO> {
  try {
    const response = await fetch(`/api/luggages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data: LuggageDTO = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to create luggage:", error);
    throw error;
  }
}

// TODO: 接後端 API 刪除行李
export async function deleteLuggage(luggageId: number): Promise<void> {
  void luggageId;
}

export function getLuggageSpaceName(userId: string | number) {
  return getUserRooms(userId);
}

export function getLuggageSpaceItems() {
  return getWardrobeClothingItems();
}

export async function getLuggageFilteredItems(filters: LuggageSpaceFilters) {
  return getWardrobeFilteredClothingItems(filters);
}

type UserRoomDto = {
  Space_ID: number;
  Space_Name?: string | null;
  Space_Type?: string;
};

export async function getLuggageRoomOptions(userId: string | number): Promise<string[]> {
  const rooms = (await getUserRooms(userId)) as UserRoomDto[];
  return rooms.map((room) => String(room.Space_ID));
}

export async function requestMoveLuggageItemsToRoom(itemIds: number[], targetRoom: string) {
  return requestMoveSelectedItemsToRoom(itemIds, targetRoom);
}

export async function requestDeleteLuggageItems(itemIds: number[]) {
  return requestDeleteSelectedItems(itemIds);
}

// TODO: 接後端 API 取得所有房間的衣物（可篩選）
export async function getAllWardrobeItems(filters: LuggageSpaceFilters): Promise<LuggageSpaceItem[]> {
  // 臨時做法：復用現有的 getWardrobeFilteredClothingItems
  // 之後改為：GET /api/wardrobes/items?filters=...&includeAllRooms=true
  return getWardrobeFilteredClothingItems(filters);
}

// TODO: 接後端 API 新增衣物到行李
export async function addItemsToLuggage(luggageId: number, itemIds: number[]): Promise<void> {
  try {
    const response = await fetch(`/api/luggages/${luggageId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to add items to luggage:", error);
    throw error;
  }
}
