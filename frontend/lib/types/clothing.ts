export type ClothingItem = {
  id: number;
  name: string;
  color: [string, string, string];
  season: string[];
  type: string;
  style: string;
  note?: string; // Optional note about this item
};

export type ClothingFilters = {
  season: string;
  style: string;
  type: string;
  color: string;
};

export type ItemHistory = {
  id: number;
  itemId: number;
  time: Date;
  photo?: string; // URL to photo from this wearing/occasion
  note?: string; // Note about this specific history record
  occasion?: string; // What occasion this was worn for
};

export const defaultClothingFilters: ClothingFilters = {
  season: "all",
  style: "all",
  type: "all",
  color: "all",
};
