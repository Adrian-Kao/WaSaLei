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

interface LuggageDTO {
  id: number;
  name: string;
}

export type LuggageSpaceItem = ClothingItem;
export type LuggageSpaceFilters = ClothingFilters;
export type SpaceFilterOption = { value: string; label: string };

export const createLuggageSpaceFilters = createClothingFilters;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";

function getCurrentUserId() {
  return useUserStore.getState().userId;
}

export function filterLuggageItems(items: LuggageSpaceItem[], filters: LuggageSpaceFilters) {
  return items.filter((item) => matchesLuggageFilters(item, filters));
}

function matchesLuggageFilters(item: LuggageSpaceItem, filters: LuggageSpaceFilters) {
  const itemStyles = Array.isArray(item.style) ? item.style : [item.style];
  const itemColors = item.color.filter((color) => color && color !== "none");

  if ((filters.room?.length ?? 0) > 0 && !filters.room?.includes(String(item.roomId ?? ""))) {
    return false;
  }


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

async function getLuggageItemsByRoomIds(roomIds: string[], roomNamesById: Record<string, string> = {}) {
  if (roomIds.length === 0) return [];

  const itemsByRoom = await Promise.all(
    roomIds.map(async (roomId) => {
      const items = await getSpaceItems(roomId);
      return items.map((item) => ({
        ...item,
        roomId,
        roomName: roomNamesById[roomId] ?? `衣櫃 ${roomId}`,
      }));
    })
  );

  const merged = itemsByRoom.flat();
  const deduped = new Map<number, LuggageSpaceItem>();

  for (const item of merged) {
    deduped.set(item.id, item);
  }

  return Array.from(deduped.values());
}

export function formatLuggageName(note: string, duration: string, season: string | string[]): string {
  const seasonStr = Array.isArray(season) ? season.join("") : season;
  return `${note}|${duration}|${seasonStr}`;
}

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
  const roomNamesById = Object.fromEntries(luggages.map((luggage) => [String(luggage.id), luggage.name]));
  return getLuggageItemsByRoomIds(roomIds, roomNamesById);
}

export async function getLuggageFilteredItems(filters: LuggageSpaceFilters) {
  const rooms = filters.room && filters.room.length > 0 ? filters.room : await getLuggageRoomOptions(getCurrentUserId() ?? "");
  const items = await getLuggageItemsByRoomIds(rooms);
  return filterLuggageItems(items, filters);
}

export async function getLuggageRoomOptions(userId: string | number): Promise<string[]> {
  const luggages = await getLuggageList(userId);
  return luggages.map((luggage) => String(luggage.id));
}

export async function getWardrobeRoomSelectOptions(userId: string | number): Promise<SpaceFilterOption[]> {
  if (!userId) return [];

  const response = await fetch(
    `${API_BASE_URL}/api/space/user/${userId}?type=${"衣櫃"}`
  );

  if (!response.ok) return [];

  const data = await response.json();
  if (!data.success || !Array.isArray(data.data)) return [];

  const spaces = data.data as Array<{ Space_ID: number; Space_Name?: string | null }>;
  return spaces.map((space) => ({
    value: String(space.Space_ID),
    label: space.Space_Name?.trim() || `衣櫃 ${space.Space_ID}`,
  }));
}

export async function getWardrobeRoomOptions(userId: string | number): Promise<string[]> {
  const rooms = await getWardrobeRoomSelectOptions(userId);
  return rooms.map((room) => room.value);
}

export async function getWardrobeItemsByUserId(userId: string | number): Promise<LuggageSpaceItem[]> {
  if (!userId) return [];

  const rooms = await getWardrobeRoomSelectOptions(userId);
  const roomNamesById = Object.fromEntries(rooms.map((room) => [room.value, room.label]));
  return getLuggageItemsByRoomIds(rooms.map((room) => room.value), roomNamesById);
}

export async function getWardrobeFilteredItemsByUserId(
  userId: string | number,
  filters: LuggageSpaceFilters,
): Promise<LuggageSpaceItem[]> {
  const items = await getWardrobeItemsByUserId(userId);
  return filterLuggageItems(items, filters);
}

export async function requestMoveLuggageItemsToRoom(itemIds: number[], targetRoom: string) {
  return requestMoveSelectedItemsToRoom(itemIds, targetRoom);
}

export async function requestDeleteLuggageItems(itemIds: number[]) {
  return requestDeleteSelectedItems(itemIds);
}

async function requestCopyItemsToLuggage(
  itemIds: number[],
  toLuggageId: number
): Promise<{ success: boolean; failedIds: number[] }> {
  if (itemIds.length === 0) return { success: true, failedIds: [] };

  const failedIds: number[] = [];

  await Promise.all(
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

