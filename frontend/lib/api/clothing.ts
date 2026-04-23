import type { ClothingItem, ItemHistory } from "@/lib/types/clothing";

const wardrobeName = "測試衣櫃";

const mockClothingItems: ClothingItem[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  name: "藍色T",
  color: ["#2A3388", "#000000", "none"],
  season: ["春", "夏"],
  type: "上身",
  style: "日常",
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

export function getWardrobeName() {
  return wardrobeName;
}

export function getWardrobeClothingItems() {
  return mockClothingItems;
}

export function getItemById(itemId: number) {
  return mockClothingItems.find((item) => item.id === itemId);
}

export function getItemHistory(itemId: number) {
  const history = mockItemHistory.filter((h) => h.itemId === itemId);
  // Sort by time descending (newest first)
  return history.sort((a, b) => b.time.getTime() - a.time.getTime());
}
