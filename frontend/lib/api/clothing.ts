import type { ClothingFilters, ClothingItem } from "@/lib/types/clothing";

const wardrobeName = "測試衣櫃";
const fixedItemUrl = "/1.webp";
const mockRooms = ["台北宿舍", "房間A", "房間B", "工作室"];

const mockClothingItems: ClothingItem[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  name: "藍色T",
  color: ["#2A3388", "#000000", "none"],
  season: ["春", "夏"],
  type: "上身",
  style: "日常",
  imageUrl: fixedItemUrl,
}));


export function getWardrobeName() {
  return wardrobeName;
}

export function getWardrobeClothingItems() {
  return mockClothingItems;
}

// TODO: 之後改為呼叫後端 API，將 filters 帶到 query/body。
function applyWardrobeFiltersPlaceholder(items: ClothingItem[], filters: ClothingFilters) {
  void filters;
  return items;
}

// TODO: 之後在這裡接後端呼叫取得衣物清單，根據 filters 參數篩選
export async function getWardrobeFilteredClothingItems(filters: ClothingFilters) {
  const filtered = applyWardrobeFiltersPlaceholder(mockClothingItems, filters);
  return Promise.resolve(filtered);
}

// TODO: 之後在這裡接後端呼叫取得該使用者的所有房間清單
export async function getUserRooms(userId: string | number) {
  void userId;
  return Promise.resolve(mockRooms);
}

// TODO: 之後在這裡接後端呼叫（移動衣物到指定 room）。
export async function requestMoveSelectedItemsToRoom(itemIds: number[], targetRoom: string) {
  void itemIds;
  void targetRoom;
}

// TODO: 之後在這裡接後端呼叫（刪除指定衣物）。
export async function requestDeleteSelectedItems(itemIds: number[]) {
  void itemIds;
}



export function getItemById(itemId: number) {
  return mockClothingItems.find((item) => item.id === itemId);
}


