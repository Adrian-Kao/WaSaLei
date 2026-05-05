// 統一衣物型別
export interface ClothingItem {
  id: number;
  name: string;
  color: [string, string, string];
  season: string[];
  type: string;
  style: string | string[];
  imageUrl: string;
}

// 歷史穿搭型別
export interface Outfit {
  id: number;
  wornDate: string;
  photo: string;
  note: string;
  occasion: string;
  items: ClothingItem[];
}
