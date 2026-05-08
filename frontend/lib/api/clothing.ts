import type { ClothingItem, ItemHistory } from "@/lib/types/clothing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";

const fixedItemUrl = "/1.webp";

export type UserRoom = {
  Space_ID: number;
  Space_Type: string;
  Space_Name: string | null;
  Item_Count?: number;
  Capacity?: number;
  User_ID?: number;
};

type BackendItemDetail = {
  item_id: number;
  name: string;
  notes?: string | null;
  photo?: string | null;
  photo_url?: string | null;
  type?: string | null;
  seasons?: string[];
  styles?: string[];
  colors?: string[];
};

export type ClothingItemDetail = ClothingItem & {
  note?: string;
};

// 串接後端 API 取得該使用者所有 type 為「衣櫃」的空間名稱
export async function getUserRooms(userId: string | number): Promise<UserRoom[]> {
  if (!userId) return [];
  const res = await fetch(`${API_BASE_URL}/api/space/user/${userId}`);
  if (!res.ok) return [];
  const data = await res.json();
  console.log("Fetched user rooms:", data);
  if (!data.success || !Array.isArray(data.data)) return [];

  return (data.data as UserRoom[]).filter((s) => s.Space_Type === "衣櫃");
}

type BackendSpaceItem = {
  item_id?: number;
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
  console.log("Fetched space items:", data.data);

  return (data.data as BackendSpaceItem[]).map((item, index) => ({
    id: item.item_id ?? index + 1,
    name: item.name,
    color: [item.color1 ?? "none", item.color2 ?? "none", item.color3 ?? "none"],
    season: item.seasons ?? [],
    type: item.type,
    style: item.styles ?? [],
    imageUrl: item.photo_url ?? fixedItemUrl,
  }));
}

function toColorTuple(colors?: string[]): [string, string, string] {
  return [colors?.[0] ?? "none", colors?.[1] ?? "none", colors?.[2] ?? "none"];
}

function toAbsolutePhotoUrl(photoUrl?: string | null, photo?: string | null): string {
  if (photoUrl && /^https?:\/\//i.test(photoUrl)) return photoUrl;
  if (photoUrl && photoUrl.startsWith("/")) return `${API_BASE_URL}${photoUrl}`;
  if (photo) return `${API_BASE_URL}/images/${photo}`;
  return fixedItemUrl;
}

export async function getItemById(itemId: number): Promise<ClothingItemDetail | null> {
  if (!itemId) return null;

  const res = await fetch(`${API_BASE_URL}/api/items/${itemId}`);
  if (!res.ok) return null;

  const payload = await res.json();
  if (!payload.success || !payload.data) return null;

  const item = payload.data as BackendItemDetail;

  return {
    id: item.item_id,
    name: item.name,
    color: toColorTuple(item.colors),
    season: item.seasons ?? [],
    type: item.type ?? "其他",
    style: item.styles ?? [],
    imageUrl: toAbsolutePhotoUrl(item.photo_url, item.photo),
    note: item.notes ?? "",
  };
}

export async function getItemHistory(itemId: number): Promise<ItemHistory[]> {
  void itemId;
  return [];
}


// 刪除和移動功能
type ItemOpResult = { id: number; ok: boolean; status?: number; error?: string };

export async function requestDeleteSelectedItems(
  itemIds: number[]
): Promise<{ success: boolean; results: ItemOpResult[] }> {
  if (itemIds.length === 0) return { success: true, results: [] };

  const results = await Promise.all(
    itemIds.map(async (id): Promise<ItemOpResult> => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/items/${id}`, { method: "DELETE" });
        return { id, ok: res.ok, status: res.status };
      } catch (err) {
        return { id, ok: false, error: String(err) };
      }
    })
  );

  return { success: results.every((r) => r.ok), results };
}

export async function requestMoveSelectedItemsToRoom(
  itemIds: number[],
  targetRoom: string
): Promise<{ success: boolean; results: ItemOpResult[] }> {
  if (itemIds.length === 0) return { success: true, results: [] };
  const spaceId = Number(targetRoom);
  if (!spaceId) return { success: false, results: [] };

  const results = await Promise.all(
    itemIds.map(async (id): Promise<ItemOpResult> => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/items/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ space_id: spaceId }),
        });
        return { id, ok: res.ok, status: res.status };
      } catch (err) {
        return { id, ok: false, error: String(err) };
      }
    })
  );

  return { success: results.every((r) => r.ok), results };
}


