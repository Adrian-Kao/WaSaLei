export type ClothingItem = {
  id: number;
  name: string;
  color: [string, string, string];
  season: string[];
  type: string;
  style: string;
  room?: string;
  note?: string;
  url: string;
};

export type ClothingFilters = {
  season: string[];
  style: string[];
  type: string[];
  color: string[];
  room?: string;
};

export type ItemHistory = {
  id: number;
  itemId: number;
  time: Date;
  photo?: string; // URL to photo from this wearing/occasion
  note?: string; // Note about this specific history record
  occasion?: string; // What occasion this was worn for
};

export type OutfitHistory = {
  id: number;
  imageUrl: string;
  wornDate: string;
  occasion: string;
};

export const defaultClothingFilters: ClothingFilters = {
  season: [],
  style: [],
  type: [],
  color: [],
};

export function createClothingFilters(room?: string): ClothingFilters {
  if (!room) {
    return { ...defaultClothingFilters };
  }

  return {
    ...defaultClothingFilters,
    room,
  };
}
