import { ClothingItem, Outfit } from "@/lib/types/outfit";
import { getSpaceItems } from "@/lib/api/clothing";

// 統一 mock 資料
const allItems: ClothingItem[] = getSpaceItems("");
const mockOutfits: Outfit[] = [
  {
    id: 1,
    wornDate: "2025/08/23",
    photo: "/1.webp",
    note: "和朋友聚餐",
    occasion: "休閒",
    items: allItems.slice(0, 3),
  },
  {
    id: 2,
    wornDate: "2025/08/24",
    photo: "/1.webp",
    note: "上班穿搭",
    occasion: "工作",
    items: allItems.slice(2, 5),
  },
  {
    id: 3,
    wornDate: "2025/08/25",
    photo: "/1.webp",
    note: "假日出遊",
    occasion: "約會",
    items: allItems.slice(1, 4),
  },
];

export async function getAllOutfits(): Promise<Outfit[]> {
  return mockOutfits;
}

export async function getOutfitById(id: string | number): Promise<Outfit | undefined> {
  return mockOutfits.find(o => o.id === Number(id));
}

// Placeholder: delete an outfit by id
export async function deleteOutfitById(id: string | number): Promise<void> {
  // TODO: Replace with real backend call
  return;
}

// Placeholder: update an outfit (add/remove items, edit name, etc)
export async function updateOutfit(outfit: Outfit): Promise<Outfit> {
  // TODO: Replace with real backend call
  return outfit;
}

// TODO: 之後在這裡接後端呼叫取得 occasion 選項列表
export async function getOutfitOccasionOptions() {
  return Promise.resolve(["all", "休閒", "工作", "約會"]);
}
