"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import ItemCard from "@/component/item-card";
import ColorStrip from "@/component/color-strip";
import { getItemById, getItemHistory, updateItem, type ClothingItemDetail } from "@/lib/api/clothing";
import type { ItemHistory } from "@/lib/types/clothing";
import { FiEdit2 } from "react-icons/fi";

const seasonOptions = ["春", "夏", "秋", "冬"];
const styleOptions = ["運動", "正式", "日常", "社交", "其他"];
const typeOptions = ["上身長", "上身短", "下身長", "下身短", "配件", "鞋類", "其他"];

const SEASON_ID: Record<string, number> = { 春: 1, 夏: 2, 秋: 3, 冬: 4 };
const STYLE_ID: Record<string, number> = { 運動: 1, 正式: 2, 日常: 3, 社交: 4, 其他: 5 };
const TYPE_ID: Record<string, number> = { 上身長: 1, 上身短: 2, 下身長: 3, 下身短: 4, 配件: 5, 鞋類: 6, 其他: 7 };

type EditableItemDraft = {
  name: string;
  season: string[];
  style: string[];
  type: string;
  note: string;
};

function createDraftFromItem(item: ClothingItemDetail): EditableItemDraft {
  return {
    name: item.name,
    season: item.season,
    style: toStyleArray(item.style),
    type: item.type,
    note: item.note ?? "",
  };
}

function toStyleArray(style: string | string[]) {
  return Array.isArray(style) ? style : [style];
}

export default function ItemDetailPage() {
  const searchParams = useSearchParams();
  const rawItemId = Number(searchParams.get("id"));
  const itemId = Number.isFinite(rawItemId) && rawItemId > 0 ? rawItemId : null;

  const [item, setItem] = useState<ClothingItemDetail | null>(null);
  const [history, setHistory] = useState<ItemHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draft, setDraft] = useState<EditableItemDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [detailImageSrc, setDetailImageSrc] = useState("/1.webp");

  useEffect(() => {
    if (!item) {
      setDraft(null);
      return;
    }

    setDraft(createDraftFromItem(item));
    setDetailImageSrc(item.imageUrl || "/1.webp");
  }, [item]);

  function toggleDraftArrayField(field: "season" | "style", value: string) {
    setDraft((previous) => {
      if (!previous) {
        return previous;
      }

      const isSelected = previous[field].includes(value);

      return {
        ...previous,
        [field]: isSelected
          ? previous[field].filter((item) => item !== value)
          : [...previous[field], value],
      };
    });
  }

  function toggleSeasonOption(targetSeason: string) {
    toggleDraftArrayField("season", targetSeason);
  }

  function toggleStyleOption(targetStyle: string) {
    toggleDraftArrayField("style", targetStyle);
  }

  function updateDraftField(field: "name" | "type" | "note", value: string) {
    setDraft((previous) => (previous ? { ...previous, [field]: value } : previous));
  }

  async function handleSaveDraft() {
    if (!item || !draft || !itemId) {
      setIsEditMode(false);
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateItem(itemId, {
        name: draft.name.trim() || item.name,
        notes: draft.note,
        type_id: TYPE_ID[draft.type],
        season_ids: draft.season.map((s) => SEASON_ID[s]).filter(Boolean),
        style_ids: draft.style.map((s) => STYLE_ID[s]).filter(Boolean),
      });
      if (updated) {
        setItem(updated);
      }
    } finally {
      setIsSaving(false);
      setIsEditMode(false);
    }
  }

  function handleEditButtonClick() {
    if (!isEditMode) {
      setIsEditMode(true);
      return;
    }

    void handleSaveDraft();
  }

  useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      if (!itemId) {
        if (isMounted) {
          setItem(null);
          setHistory([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      try {
        const [fetchedItem, fetchedHistory] = await Promise.all([
          getItemById(itemId),
          getItemHistory(itemId),
        ]);

        if (!isMounted) return;
        setItem(fetchedItem);
        setHistory(fetchedHistory);
      } catch {
        if (!isMounted) return;
        setItem(null);
        setHistory([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [itemId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">找不到衣服</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[90%] max-w-3xl mx-auto px-4 py-8 overflow-scroll scrollbar-hide">
      {/* Item Card Section */}
      <div className="mb-12">
        <div className="max-w-sm mx-auto">
          <div className="mb-4 flex items-center justify-end">
            <button
              type="button"
              onClick={handleEditButtonClick}
              disabled={isSaving}
              className="btn btn-sm btn-ghost gap-2"
              aria-label={isEditMode ? "離開編輯模式" : "進入編輯模式"}
            >
              {isSaving ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <FiEdit2 className="text-lg" />
              )}
              {isSaving ? "儲存中" : isEditMode ? "完成" : "編輯"}
            </button>
          </div>

          {isEditMode && draft ? (
            <div className="card w-full rounded-3xl border border-base-300 bg-base-200 shadow-sm">

              <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-2xl bg-base-100">
                <Image
                  src={detailImageSrc}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 70vw, 320px"
                  className="object-cover"
                  onError={() => setDetailImageSrc("/1.webp")}
                />
              </div>
              <div className="p-4">
                {/* 顏色顯示（不可編輯） */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">顏色</label>
                  <ColorStrip colors={item.color} />
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">名稱</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(event) => updateDraftField("name", event.target.value)}
                    className="input input-bordered w-full"
                    aria-label="衣服名稱"
                  />
                </div>

                <div className="mb-4">
                  <div className="mb-2 block text-sm font-medium">季節（可多選）</div>
                  <div className="flex flex-wrap gap-2">
                    {seasonOptions.map((option) => {
                      const isSelected = draft.season.includes(option);

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleSeasonOption(option)}
                          className={`btn btn-sm rounded-full ${isSelected ? "btn-primary" : "btn-outline"}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="mb-2 block text-sm font-medium">Style（可多選）</div>
                  <div className="flex flex-wrap gap-2">
                    {styleOptions.map((option) => {
                      const isSelected = draft.style.includes(option);

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleStyleOption(option)}
                          className={`btn btn-sm rounded-full ${isSelected ? "btn-primary" : "btn-outline"}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="mb-2 block text-sm font-medium">Type（單選）</div>
                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map((option) => {
                      const isSelected = draft.type === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => updateDraftField("type", option)}
                          className={`btn btn-sm rounded-full ${isSelected ? "btn-primary" : "btn-outline"}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="mb-2 block text-sm font-medium">Note</label>
                  <textarea
                    value={draft.note}
                    onChange={(event) => updateDraftField("note", event.target.value)}
                    className="textarea textarea-bordered h-24 w-full"
                    aria-label="衣服筆記"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ItemCard
                name={item.name}
                color={item.color}
                season={item.season}
                type={item.type}
                style={item.style}
                imageUrl={item.imageUrl}
              />

              {item.note ? (
                <div className="card border border-base-300 bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <p className="text-sm leading-relaxed">{item.note}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 px-4 py-6 text-center text-sm text-gray-400">
                  還沒有筆記
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">歷史紀錄</h2>

        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((record) => (
              <div
                key={record.id}
                className="card bg-base-100 shadow-sm border border-base-300 overflow-hidden"
              >
                <div className="card-body p-0">
                  {/* Title with date */}
                  <div className="bg-primary text-primary-content px-4 py-2">
                    <h3 className="font-semibold">
                      {new Date(record.time).toLocaleDateString("zh-TW")}
                    </h3>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex gap-4">
                      {/* Photo */}
                      {record.photo ? (
                        <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={record.photo}
                            alt="History photo"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : null}

                      {/* Info */}
                      <div className="flex-1">
                        {record.occasion && (
                          <p className="text-sm font-medium text-primary mb-2">
                            {record.occasion}
                          </p>
                        )}
                        {record.note && (
                          <p className="text-sm text-gray-600">{record.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>還沒有歷史紀錄</p>
          </div>
        )}
      </div>
    </div>
  );
}
