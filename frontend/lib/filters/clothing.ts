import type { ClothingFilters, ClothingItem } from "@/lib/types/clothing";

function normalizeHexColor(value: string) {
  return value.trim().toLowerCase();
}

export function filterClothingItems(items: ClothingItem[], filters: ClothingFilters) {
  return items.filter((item) => {
    const seasonMatch =
      filters.season.length === 0 || filters.season.some((season) => item.season.includes(season));

    const styleMatch = filters.style.length === 0 || filters.style.includes(item.style);

    const typeMatch = filters.type.length === 0 || filters.type.includes(item.type);

    const colorMatch =
      filters.color.length === 0 ||
      item.color.some(
        (slotColor) =>
          slotColor !== "none" &&
          filters.color.some((targetColor) => normalizeHexColor(slotColor) === normalizeHexColor(targetColor)),
      );

    const roomMatch =
      !filters.room || filters.room === "all" || item.room === filters.room;

    return seasonMatch && styleMatch && typeMatch && colorMatch && roomMatch;
  });
}
