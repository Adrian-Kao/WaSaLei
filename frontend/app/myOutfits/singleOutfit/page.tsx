
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getOutfitById, deleteOutfitById, updateOutfit } from "@/lib/api/outfits";
import { Outfit } from "@/lib/types/outfit";
import ItemCard from "@/component/item-card";
import { FiX } from "react-icons/fi";

export default function SingleOutfitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 測試用：若無 id 參數則預設 '1'（匹配 mockOutfits）
  const id = searchParams.get("id") || '1';
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draftOutfit, setDraftOutfit] = useState<Outfit | null>(null);

  useEffect(() => {
    getOutfitById(id).then((outfit) => {
      setOutfit(outfit ?? null);
    });
  }, [id]);

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

  // 在 draft 中刪除 item
  function handleRemoveItem(itemId: number) {
    if (!draftOutfit) return;
    setDraftOutfit((prev) =>
      prev ? { ...prev, items: prev.items.filter((item) => item.id !== itemId) } : null
    );
  }

  // 完成編輯：送出 draft 到後端，成功後重新抓資料
  async function handleFinishEdit() {
    if (!draftOutfit) return;
    setLoading(true);
    try {
      await updateOutfit(draftOutfit);
      // 重新抓最新資料並更新畫面
      const refreshed = await getOutfitById(draftOutfit.id);
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
      router.push("/myOutfits");
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{displayOutfit?.note || "穿搭"}</h1>
        <button
          className="btn btn-outline btn-sm btn-primary"
          onClick={() => (editMode ? handleFinishEdit() : handleEnterEditMode())}
          disabled={loading}
        >
          {editMode ? "完成" : "編輯"}
        </button>
      </div>

      {outfit.photo && (
        <img src={outfit.photo} alt="outfit" className="w-full rounded mb-4" />
      )}

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
            {["休閒", "正式", "運動", "其他"].map((opt) => (
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
        <div className="grid grid-cols-2 gap-4">
          {(!displayOutfit || displayOutfit.items.length === 0) && <div>無衣物</div>}
          {displayOutfit?.items.map((item) => (
            <div key={item.id} className="relative">
              <ItemCard
                name={item.name}
                color={item.color}
                season={item.season}
                type={item.type}
                style={item.style}
                imageUrl={item.imageUrl}
              />
              {editMode && (
                <button
                  className="absolute -top-2 -right-2 border-3 border-black bg-white text-black rounded-full p-1 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                  onClick={() => handleRemoveItem(item.id)}
                  aria-label="刪除衣物"
                >
                  <FiX size={15} strokeWidth={3} />
                </button>
              )}
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
