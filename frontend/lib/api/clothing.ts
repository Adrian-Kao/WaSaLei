import type { ClothingFilters, ClothingItem } from "@/lib/types/clothing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";

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


// export function getWardrobeName() {
//   return wardrobeName;
// }

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

// 串接後端 API 取得該使用者所有 type 為「衣櫃」的空間名稱
export async function getUserRooms(userId: string | number) {
  if (!userId) return [];
  const res = await fetch(`${API_BASE_URL}/api/space/user/${userId}`);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.success || !Array.isArray(data.data)) return [];
  // 前端還要自己拿多於資料做篩選，顯然已經受不了後端的效率?
  return data.data.filter((s: any) => s.Space_Type === "衣櫃");
}

type BackendSpaceItem = {
  name: string;
  type: string;
  seasons: string[];
  styles: string[];
  color1: string | null;
  color2: string | null;
  color3: string | null;
  photo_url: string | null;
};

export async function getSpaceItems(spaceId: string | number): Promise<ClothingItem[]> {
  if (!spaceId) return [];

  const res = await fetch(`${API_BASE_URL}/api/space/${spaceId}/items`);
  if (!res.ok) return [];

  const data = await res.json();
  if (!data.success || !Array.isArray(data.data)) return [];

  return (data.data as BackendSpaceItem[]).map((item, index) => ({
    id: index + 1,
    name: item.name,
    color: [item.color1 ?? "none", item.color2 ?? "none", item.color3 ?? "none"],
    season: item.seasons ?? [],
    type: item.type,
    style: item.styles ?? [],
    imageUrl: item.photo_url ?? fixedItemUrl,
  }));
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


