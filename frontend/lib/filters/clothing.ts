import type { ClothingFilters, ClothingItem } from "@/lib/types/clothing";

function normalizeHexColor(value: string) {
  return value.trim().toLowerCase();
}

export function filterClothingItems(items: ClothingItem[], filters: ClothingFilters) {
  return items.filter((item) => {
    const seasonMatch =
      filters.season === "all" || item.season.includes(filters.season);

    const styleMatch = filters.style === "all" || item.style === filters.style;

    const typeMatch = filters.type === "all" || item.type === filters.type;

    const colorMatch =
      filters.color === "all" ||
      normalizeHexColor(item.color) === normalizeHexColor(filters.color);

    return seasonMatch && styleMatch && typeMatch && colorMatch;
  });
}
