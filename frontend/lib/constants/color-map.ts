export type FixedColor = {
  id: number;
  name: string;
  hex: string;
};

export const FIXED_COLORS: FixedColor[] = [
  { id: 1, name: "白色", hex: "#FFFFFF" },
  { id: 2, name: "灰色", hex: "#9CA3AF" },
  { id: 3, name: "黑色", hex: "#111111" },
  { id: 4, name: "紅色", hex: "#EF4444" },
  { id: 5, name: "粉紅色", hex: "#EC4899" },
  { id: 6, name: "橘色", hex: "#F97316" },
  { id: 7, name: "黃色", hex: "#FACC15" },
  { id: 8, name: "米色", hex: "#EAD8B7" },
  { id: 9, name: "卡其色", hex: "#C3B091" },
  { id: 10, name: "棕色", hex: "#8B5E3C" },
  { id: 11, name: "綠色", hex: "#22C55E" },
  { id: 12, name: "藍綠色", hex: "#14B8A6" },
  { id: 13, name: "藍色", hex: "#3B82F6" },
  { id: 14, name: "紫色", hex: "#8B5CF6" },
];

const HEX_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function normalizeHex(input: string) {
  const value = input.trim();
  if (!value) return null;

  const withHash = value.startsWith("#") ? value : `#${value}`;
  if (!HEX_PATTERN.test(withHash)) {
    return null;
  }

  return withHash.toUpperCase();
}

export function getFixedColorById(id: number) {
  return FIXED_COLORS.find((color) => color.id === id) ?? null;
}

export function getFixedColorByName(name?: string | null) {
  const target = (name ?? "").trim();
  if (!target) return null;
  return FIXED_COLORS.find((color) => color.name === target) ?? null;
}

export function getFixedColorByHex(hex?: string | null) {
  if (!hex) return null;

  const normalized = normalizeHex(hex);
  if (!normalized) return null;

  return FIXED_COLORS.find((color) => color.hex.toUpperCase() === normalized) ?? null;
}

export function colorIdToHex(id?: number | null) {
  if (!id) return null;
  return getFixedColorById(id)?.hex ?? null;
}

export function colorNameToHex(name?: string | null) {
  return getFixedColorByName(name)?.hex ?? null;
}

export function colorHexToName(hex?: string | null) {
  return getFixedColorByHex(hex)?.name ?? null;
}

export function colorNameToId(name?: string | null) {
  return getFixedColorByName(name)?.id ?? null;
}

export function colorHexToId(hex?: string | null) {
  return getFixedColorByHex(hex)?.id ?? null;
}

export function normalizeColorToHex(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "none") return null;

  const fromName = colorNameToHex(trimmed);
  if (fromName) return fromName;

  return normalizeHex(trimmed);
}
