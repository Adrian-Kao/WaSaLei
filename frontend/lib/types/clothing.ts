export type ClothingItem = {
  id: number;
  name: string;
  color: [string, string, string];
  season: string[];
  type: string;
  style: string | string[];
  imageUrl: string;
  roomId?: string;
  roomName?: string;
};

export type ClothingFilters = {
  season: string[];
  style: string[];
  type: string[];
  color: string[];
  room?: string[];
};

export type ItemHistory = {
  id: number;
  itemId: number;
  time: Date;
  photo?: string;
  note?: string;
  occasion?: string;
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
