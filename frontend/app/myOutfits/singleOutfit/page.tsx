
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getOutfitDetail, deleteOutfitById, updateOutfit } from "@/lib/api/outfits";
import { Outfit } from "@/lib/types/outfit";
import ItemCard from "@/component/item-card";
import { createLuggageSpaceFilters, getWardrobeFilteredItemsByUserId } from "@/lib/api/luggage";
import { useUserStore } from "@/store/store";

function parseIdList(value: string | null) {
  if (!value) return [] as number[];

  return value
    .split(",")
    .map((rawId) => Number(rawId.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
}

export default function SingleOutfitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = useUserStore((state) => state.userId);

  // 測試用：若無 id 參數則預設 '1'（匹配 mockOutfits）
  const id = searchParams.get("id") || '1';
  const addedIdsParam = searchParams.get("addedIds");
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draftOutfit, setDraftOutfit] = useState<Outfit | null>(null);

  useEffect(() => {
    getOutfitDetail(id).then((outfit) => {
      setOutfit(outfit ?? null);
    });
  }, [id]);

  useEffect(() => {
    if (!outfit || !addedIdsParam) {
      return;
    }

    const baseOutfit = outfit;

    const addedIds = parseIdList(addedIdsParam);
    if (addedIds.length === 0) {
      router.replace(`/myOutfits/singleOutfit?id=${id}`);
      return;
    }

    let isMounted = true;

    async function hydrateAddedItems() {
      if (!userId) return;

      try {
        const allWardrobeItems = await getWardrobeFilteredItemsByUserId(userId, createLuggageSpaceFilters());
        if (!isMounted) return;

        const byId = new Map(allWardrobeItems.map((item) => [item.id, item]));
        const selectedItems = addedIds
          .map((itemId) => byId.get(itemId))
          .filter((item): item is NonNullable<typeof item> => Boolean(item));

        setDraftOutfit({
          ...baseOutfit,
          items: selectedItems,
        });
        setEditMode(true);
      } catch (error) {
        console.error("Failed to hydrate added items:", error);
      } finally {
        if (isMounted) {
          router.replace(`/myOutfits/singleOutfit?id=${id}`);
        }
      }
    }

    void hydrateAddedItems();

    return () => {
      isMounted = false;
    };
  }, [outfit, addedIdsParam, id, router, userId]);

  // 進入編輯模式：建立 draft 複本
  function handleEnterEditMode() {
    if (!outfit) return;
    setDraftOutfit(JSON.parse(JSON.stringify(outfit))); // 深複製
    setEditMode(true);
  }

  // 退出編輯模式（取消）
  function handleCancelEdit() {
    setDraftOutfit(null);
    setEditMode(false);
  }

  // 更新 draft 的欄位（日期、note、occasion）
  function handleDraftFieldChange(field: keyof Outfit, value: any) {
    if (!draftOutfit) return;
    setDraftOutfit((prev) => prev ? { ...prev, [field]: value } : null);
  }

  function handleGoToSelectItems() {
    const selectedIds = draftOutfit?.items.map((item) => item.id) ?? [];
    const selectedIdsParam = selectedIds.join(",");
    const query = new URLSearchParams({
      outfitId: String(id),
      selectedIds: selectedIdsParam,
    });

    router.push(`/myOutfits/selectItems?${query.toString()}`);
  }

  // 完成編輯：送出 draft 到後端，成功後重新抓資料
  async function handleFinishEdit() {
    if (!draftOutfit) return;
    setLoading(true);
    try {
      await updateOutfit(draftOutfit);
      // 重新抓最新資料並更新畫面
      const refreshed = await getOutfitDetail(draftOutfit.id);
      setOutfit(refreshed ?? null);
      setDraftOutfit(null);
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update outfit:", error);
    } finally {
      setLoading(false);
    }
  }

  // 刪除整個 outfit
  async function handleDeleteOutfit() {
    if (!outfit) return;
    setLoading(true);
    try {
      await deleteOutfitById(outfit.id);
      router.push("/myOutfits/allOutfits");
    } catch (error) {
      console.error("Failed to delete outfit:", error);
    } finally {
      setLoading(false);
    }
  }

  // 決定要顯示的資料：編輯模式用 draft，否則用已儲存的 outfit
  const displayOutfit = editMode && draftOutfit ? draftOutfit : outfit;

  function formatDateForInput(dateValue: string | undefined) {
    if (!dateValue) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    const normalized = dateValue.replaceAll("/", "-");
    return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : "";
  }

  if (!outfit) return <div className="p-8">載入中...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 h-[90%] overflow-auto no-scrollbar">
      <div className="mb-4 flex justify-end">
        <button
          className="btn btn-outline btn-sm btn-primary"
          onClick={() => (editMode ? handleFinishEdit() : handleEnterEditMode())}
          disabled={loading}
        >
          {editMode ? "完成" : "編輯"}
        </button>
      </div>

      
      <img src={outfit.photo||'/1.webp'} alt="outfit" className="w-full rounded mb-4" />
      

      {/* 日期 */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">日期</label>
        {editMode && draftOutfit ? (
          <input
            type="date"
            value={formatDateForInput(draftOutfit.wornDate)}
            onChange={(e) => handleDraftFieldChange("wornDate", e.target.value)}
            className="input input-bordered w-full"
          />
        ) : (
          <div>{displayOutfit?.wornDate || "-"}</div>
        )}
      </div>

      {/* note */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">note</label>
        {editMode && draftOutfit ? (
          <textarea
            value={draftOutfit.note}
            onChange={(e) => handleDraftFieldChange("note", e.target.value)}
            className="textarea textarea-bordered w-full"
            rows={2}
          />
        ) : (
          <div className="text-gray-600">{displayOutfit?.note || "-"}</div>
        )}
      </div>

      {/* occasion */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">場合</label>
        {editMode && draftOutfit ? (
          <div className="flex flex-wrap gap-2">
            {["日常", "上班", "正式", "社交", "運動", "旅行", "其他"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleDraftFieldChange("occasion", opt)}
                className={`btn btn-sm ${draftOutfit.occasion === opt ? "btn-primary" : "btn-outline"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-gray-600">{displayOutfit?.occasion || "-"}</div>
        )}
      </div>

      {/* 衣服列表 */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">服裝配件列表</label>
        {editMode && (
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-primary btn-outline btn-md  w-full"
              onClick={handleGoToSelectItems}
            >
              新增修改服裝配件
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {(!displayOutfit || displayOutfit.items.length === 0) && <div>無衣物</div>}
          {displayOutfit?.items.map((item) => (
            <div key={item.id}>
              <ItemCard
                name={item.name}
                color={item.color}
                season={item.season}
                type={item.type}
                style={item.style}
                imageUrl={item.imageUrl}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 編輯模式的刪除按鈕 */}
      {editMode && (
        <button
          className="btn btn-error w-full mt-4"
          onClick={handleDeleteOutfit}
          disabled={loading}
        >
          刪除此歷史紀錄
        </button>
      )}
    </div>
  );
}
