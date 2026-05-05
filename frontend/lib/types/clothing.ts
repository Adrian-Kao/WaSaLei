export type ClothingItem = {
  id: number;
  name: string;
  color: [string, string, string];
  season: string[];
  type: string;
  style: string | string[];
  imageUrl: string;
};

export type ClothingFilters = {
  season: string[];
  style: string[];
  type: string[];
  color: string[];
  room?: string[];
};
// ??這有用到嗎
export type ItemHistory = {
  id: number;
  itemId: number;
  time: Date;
  photo?: string; // URL to photo from this wearing/occasion
  note?: string; // Note about this specific history record
  occasion?: string; // What occasion this was worn for
};


export const defaultClothingFilters: ClothingFilters = {
  season: [],
  style: [],
  type: [],
  color: [],
};

export function createClothingFilters(room?: string | string[]): ClothingFilters {
  const roomArray = room ? (Array.isArray(room) ? room : [room]) : undefined;
  return {
    ...defaultClothingFilters,
    ...(roomArray ? { room: roomArray } : {}),
  };
}
