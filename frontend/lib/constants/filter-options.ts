import { FIXED_COLORS } from "@/lib/constants/color-map";

export const SEASON_OPTIONS = ["春", "夏", "秋", "冬"];
export const STYLE_OPTIONS = ["運動", "正式", "日常", "社交", "其他"];
export const TYPE_OPTIONS = ["上身長", "上身短", "下身長", "下身短", "配件", "鞋類", "其他"];
export const COLOR_OPTIONS = FIXED_COLORS.map((color) => color.hex);

export const SEASON_ID: Record<string, number> = {
  春: 1,
  夏: 2,
  秋: 3,
  冬: 4,
};

export const STYLE_ID: Record<string, number> = {
  運動: 1,
  正式: 2,
  日常: 3,
  社交: 4,
  其他: 5,
};

export const TYPE_ID: Record<string, number> = {
  上身長: 1,
  上身短: 2,
  下身長: 3,
  下身短: 4,
  配件: 5,
  鞋類: 6,
  其他: 7,
};
