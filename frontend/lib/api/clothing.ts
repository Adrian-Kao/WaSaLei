import type { ClothingItem } from "@/lib/types/clothing";

const wardrobeName = "測試衣櫃";

const mockClothingItems: ClothingItem[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  name: "藍色T",
  color: "#2A3388",
  season: ["春", "夏"],
  type: "上身",
  style: "日常",
}));

export function getWardrobeName() {
  return wardrobeName;
}

export function getWardrobeClothingItems() {
  return mockClothingItems;
}
