export type ClothingItem = {
  id: number;
  name: string;
  color: string;
  season: string[];
  type: string;
  style: string;
};

export type ClothingFilters = {
  season: string;
  style: string;
  type: string;
  color: string;
};

export const defaultClothingFilters: ClothingFilters = {
  season: "all",
  style: "all",
  type: "all",
  color: "all",
};
