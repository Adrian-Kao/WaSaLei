import type { ClothingFilters, ClothingItem, ItemHistory, OutfitHistory } from "@/lib/types/clothing";

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
  room: "台北宿舍",
  url: fixedItemUrl,
  note: index === 0 ? "很舒服的棉質材料，適合日常穿著" : undefined,
}));

// Mock history for item with id=1
const mockItemHistory: ItemHistory[] = [
  {
    id: 1,
    itemId: 1,
    time: new Date("2026-04-10"),
    photo: "https://via.placeholder.com/300",
    note: "和朋友一起去逛街",
    occasion: "逛街",
  },
  {
    id: 2,
    itemId: 1,
    time: new Date("2026-04-12"),
    photo: "https://via.placeholder.com/300",
    note: "工作日穿著",
    occasion: "工作",
  },
  {
    id: 3,
    itemId: 1,
    time: new Date("2026-04-15"),
    photo: "https://via.placeholder.com/300",
    note: "周末放鬆",
    occasion: "休閒",
  },
];

const mockOutfitHistories: OutfitHistory[] = [
  {
    id: 1,
    imageUrl: fixedItemUrl,
    wornDate: "2025/08/23",
    occasion: "休閒",
  },
  {
    id: 2,
    imageUrl: fixedItemUrl,
    wornDate: "2025/08/23",
    occasion: "休閒",
  },
  {
    id: 3,
    imageUrl: fixedItemUrl,
    wornDate: "2025/08/23",
    occasion: "工作",
  },
  {
    id: 4,
    imageUrl: fixedItemUrl,
    wornDate: "2025/08/23",
    occasion: "工作",
  },
  {
    id: 5,
    imageUrl: fixedItemUrl,
    wornDate: "2025/08/23",
    occasion: "休閒",
  },
  {
    id: 6,
    imageUrl: fixedItemUrl,
    wornDate: "2025/08/23",
    occasion: "約會",
  },
];

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

// 模擬後端讀取 room 清單，未來可替換為真實 API request。
export async function getWardrobeRooms() {
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

// TODO: 之後在這裡接後端呼叫取得 occasion 選項列表
export async function getOutfitOccasionOptions() {
  return Promise.resolve(["all", "休閒", "工作", "約會"]);
}

// TODO: 之後改為呼叫後端 API，將 occasion 帶到 query/body。
function applyOutfitOccasionFilterPlaceholder(outfits: OutfitHistory[], occasion: string) {
  void occasion;
  return outfits;
}

// TODO: 之後在這裡接後端呼叫取得穿搭歷史，根據 occasion 參數篩選
export async function getOutfitHistories(occasion = "all") {
  const filtered = applyOutfitOccasionFilterPlaceholder(mockOutfitHistories, occasion);
  return Promise.resolve(filtered);
}

export function getItemById(itemId: number) {
  return mockClothingItems.find((item) => item.id === itemId);
}

export function getItemHistory(itemId: number) {
  const history = mockItemHistory.filter((h) => h.itemId === itemId);
  // Sort by time descending (newest first)
  return history.sort((a, b) => b.time.getTime() - a.time.getTime());
}
