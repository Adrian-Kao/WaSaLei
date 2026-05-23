import { API_BASE_URL, apiFetch } from "@/lib/api/api-client";
import { Outfit } from "@/lib/types/outfit";

type BackendOutfitSummary = {
  id?: number;
  wornDate?: string;
  photo?: string;
  note?: string;
  occasion?: string;
  item_ids?: number[];
};

type BackendOutfitDetailItem = {
  id: number;
  name: string;
  color?: [string, string, string];
  season?: string[];
  type?: string;
  style?: string | string[];
  imageUrl?: string;
};

type BackendOutfitDetail = {
  id?: number;
  wornDate?: string;
  photo?: string;
  note?: string;
  occasion?: string;
  items?: BackendOutfitDetailItem[];
};
// 從 localStorage 取得目前使用者 id
function getStoredUserId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("user-storage");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { state?: { userId?: number | string } };
    const candidate = parsed?.state?.userId;
    const userId = Number(candidate);
    return Number.isFinite(userId) && userId > 0 ? userId : null;
  } catch {
    return null;
  }
}

async function parseResponseData<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  if (!payload?.success) {
    return null;
  }

  return (payload.data ?? null) as T | null;
}

function toAbsolutePhotoUrl(photoUrl?: string | null): string {
  if (!photoUrl) {
    return "/1.webp";
  }

  if (/^https?:\/\//i.test(photoUrl)) {
    return photoUrl;
  }

  if (photoUrl.startsWith("/")) {
    return `${API_BASE_URL}${photoUrl}`;
  }

  return `${API_BASE_URL}/${photoUrl}`;
}

function normalizeOutfitSummary(row: BackendOutfitSummary): Outfit {
  return {
    id: Number(row.id ?? 0),
    wornDate: row.wornDate ?? "",
    photo: toAbsolutePhotoUrl(row.photo),
    note: row.note ?? "",
    occasion: row.occasion ?? "",
    items: [],
  };
}

function normalizeOutfitDetail(row: BackendOutfitDetail): Outfit {
  return {
    id: Number(row.id ?? 0),
    wornDate: row.wornDate ?? "",
    photo: toAbsolutePhotoUrl(row.photo),
    note: row.note ?? "",
    occasion: row.occasion ?? "",
    items: Array.isArray(row.items)
      ? row.items.map((item) => ({
          id: Number(item.id),
          name: item.name ?? "",
          color: item.color ?? ["none", "none", "none"],
          season: item.season ?? [],
          type: item.type ?? "其他",
          style: item.style ?? [],
          imageUrl: toAbsolutePhotoUrl(item.imageUrl),
        }))
      : [],
  };
}

export async function getAllOutfits(userId?: string | number): Promise<Outfit[]> {
  const resolvedUserId = Number(userId ?? getStoredUserId());
  if (!Number.isFinite(resolvedUserId) || resolvedUserId <= 0) {
    return [];
  }

  const params = new URLSearchParams({ user_id: String(resolvedUserId) });
  const response = await apiFetch(`/api/outfits?${params.toString()}`);
  const data = await parseResponseData<BackendOutfitSummary[]>(response);

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeOutfitSummary);
}

export async function getOutfitDetail(outfitId: string | number): Promise<Outfit | undefined> {
  const response = await apiFetch(`/api/outfits/${outfitId}`);
  const data = await parseResponseData<BackendOutfitDetail>(response);

  if (!data) {
    return undefined;
  }

  return normalizeOutfitDetail(data);
}

export async function getOutfitById(id: string | number): Promise<Outfit | undefined> {
  return getOutfitDetail(id);
}

// Placeholder: delete an outfit by id
export async function deleteOutfitById(id: string | number): Promise<void> {
  const response = await apiFetch(`/api/outfits/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("刪除穿搭失敗");
  }
}

// Update one outfit record (date/occasion/note/items)
export async function updateOutfit(outfit: Outfit): Promise<Outfit> {
  const response = await apiFetch(`/api/outfits/${outfit.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      occasion: outfit.occasion,
      photo: outfit.photo,
      note: outfit.note,
      wornDate: outfit.wornDate,
      item_ids: outfit.items.map((item) => item.id),
    }),
  });

  const data = await parseResponseData<BackendOutfitDetail>(response);
  if (!data) {
    throw new Error("更新穿搭失敗");
  }

  return normalizeOutfitDetail(data);
}

// TODO: 從後端取得 occasion 選項列表
export async function getOutfitOccasionOptions(userId?: string | number): Promise<string[]> {
  const resolvedUserId = Number(userId ?? getStoredUserId());
  if (!Number.isFinite(resolvedUserId) || resolvedUserId <= 0) {
    return ["all"];
  }

  const response = await apiFetch(`/api/outfits/occasion-options?user_id=${resolvedUserId}`);

  const data = await parseResponseData<string[]>(response);
  return Array.isArray(data) ? data : ["all"];
}

// Upload outfit image to /api/outfits/upload-image
export async function uploadOutfitImage(file: File): Promise<{ path: string; url: string } | null> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiFetch(`/api/outfits/upload-image`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) return null;
  const payload = await response.json();
  if (!payload?.success) return null;
  return { path: payload.path, url: payload.url };
}

// Create a new outfit record
export async function createOutfit(data: {
  photo: string;
  wornDate: string;
  note: string;
  occasion: string;
  item_ids: number[];
  user_id: number;
}): Promise<Outfit> {
  const response = await apiFetch(`/api/outfits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const payload = await parseResponseData<BackendOutfitDetail>(response);
  if (!payload) {
    throw new Error("建立穿搭失敗");
  }

  return normalizeOutfitDetail(payload);
}
