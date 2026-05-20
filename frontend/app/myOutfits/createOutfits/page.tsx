
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ItemCard from "@/component/item-card";
import { createOutfit } from "@/lib/api/outfits";
import { createLuggageSpaceFilters, getWardrobeFilteredItemsByUserId, type LuggageSpaceItem } from "@/lib/api/luggage";
import { useUserStore } from "@/store/store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";

function parseIdList(value: string | null) {
  if (!value) return [] as number[];
  return value
    .split(",")
    .map((rawId) => Number(rawId.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
}

type DraftOutfit = {
  photo: string;
  wornDate: string;
  note: string;
  occasion: string;
  items: LuggageSpaceItem[];
};

export default function CreateOutfitsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = useUserStore((state) => state.userId);

  const imageFilename = searchParams.get("imageFilename") ?? "";
  const addedIdsParam = searchParams.get("addedIds");

  const [draft, setDraft] = useState<DraftOutfit>({
    photo: imageFilename,
    wornDate: "",
    note: "",
    occasion: "",
    items: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // hydrate items when returning from selectItems
  useEffect(() => {
    if (!addedIdsParam) return;

    const addedIds = parseIdList(addedIdsParam);
    if (addedIds.length === 0) {
      router.replace(`/myOutfits/createOutfits?imageFilename=${encodeURIComponent(imageFilename)}`);
      return;
    }

    let isMounted = true;

    async function hydrateItems() {
      if (!userId) return;

      try {
        const all = await getWardrobeFilteredItemsByUserId(userId, createLuggageSpaceFilters());
        if (!isMounted) return;

        const byId = new Map(all.map((item) => [item.id, item]));
        const selected = addedIds
          .map((id) => byId.get(id))
          .filter((item): item is LuggageSpaceItem => Boolean(item));

        setDraft((prev) => ({ ...prev, items: selected }));
      } catch (e) {
        console.error("Failed to hydrate items:", e);
      } finally {
        if (isMounted) {
          router.replace(`/myOutfits/createOutfits?imageFilename=${encodeURIComponent(imageFilename)}`);
        }
      }
    }

    void hydrateItems();

    return () => {
      isMounted = false;
    };
  }, [addedIdsParam, imageFilename, router, userId]);

  function handleFieldChange(field: keyof Pick<DraftOutfit, "wornDate" | "note" | "occasion">, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function handleGoToSelectItems() {
    const selectedIds = draft.items.map((item) => item.id).join(",");
    const query = new URLSearchParams({ outfitId: "new", selectedIds, imageFilename });
    router.push(`/myOutfits/selectItems?${query.toString()}`);
  }

  async function handleSubmit() {
    if (!imageFilename) return;
    if (!userId) {
      setError("請先登入");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await createOutfit({
        photo: draft.photo,
        wornDate: draft.wornDate,
        note: draft.note,
        occasion: draft.occasion,
        item_ids: draft.items.map((item) => item.id),
        user_id: Number(userId),
      });
      router.push(`/myOutfits/singleOutfit?id=${result.id}`);
    } catch (e) {
      setError("建立穿搭失敗，請再試一次");
    } finally {
      setLoading(false);
    }
  }

  if (!imageFilename) {
    return (
      <div className="p-8 flex flex-col items-center gap-4">
        <div>尚未選取穿搭圖片</div>
        <button className="btn btn-primary" onClick={() => router.push("/myOutfits/uploadOutfitPic")}>
          返回上傳圖片
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 h-[90%] overflow-auto no-scrollbar">
      <img
        src={`${API_BASE_URL}/pictures/Outfits/prepare/${imageFilename}`}
        alt="outfit"
        className="w-full rounded mb-4"
      />

      <div className="mb-4">
        <label className="block font-semibold mb-1">日期</label>
        <input
          type="date"
          value={draft.wornDate}
          onChange={(e) => handleFieldChange("wornDate", e.target.value)}
          className="input input-bordered w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">note</label>
        <textarea
          value={draft.note}
          onChange={(e) => handleFieldChange("note", e.target.value)}
          className="textarea textarea-bordered w-full"
          rows={2}
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">場合</label>
        <div className="flex flex-wrap gap-2">
          {["休閒", "正式", "運動", "其他"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleFieldChange("occasion", opt)}
              className={`btn btn-sm ${draft.occasion === opt ? "btn-primary" : "btn-outline"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">服裝配件列表</label>
        <button
          type="button"
          className="btn btn-primary btn-outline btn-md w-full mb-3"
          onClick={handleGoToSelectItems}
        >
          新增修改服裝配件
        </button>
        <div className="grid grid-cols-2 gap-4">
          {draft.items.length === 0 && <div className="text-gray-400 col-span-2">尚未選擇配件</div>}
          {draft.items.map((item) => (
            <ItemCard
              key={item.id}
              name={item.name}
              color={item.color}
              season={item.season}
              type={item.type}
              style={item.style}
              imageUrl={item.imageUrl}
            />
          ))}
        </div>
      </div>

      {error && <div className="text-error mb-2">{error}</div>}

      <button
        className="btn btn-primary w-full mt-4"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "建立中..." : "建立穿搭"}
      </button>
    </div>
  );
}
