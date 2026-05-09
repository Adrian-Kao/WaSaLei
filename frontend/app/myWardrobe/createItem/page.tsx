"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMemo, useState } from "react";
import { normalizeColorToHex, colorHexToId } from "@/lib/constants/color-map";
import { createItem } from "@/lib/api/clothing";
import { useCreateItemStore } from "@/store/store";
import ColorStrip from "@/component/color-strip";

const seasonOptions = ["春", "夏", "秋", "冬"];
const styleOptions = ["運動", "正式", "日常", "社交", "其他"];
const typeOptions = ["上身長", "上身短", "下身長", "下身短", "配件", "鞋類", "其他"];

const SEASON_ID: Record<string, number> = { 春: 1, 夏: 2, 秋: 3, 冬: 4 };
const STYLE_ID: Record<string, number> = { 運動: 1, 正式: 2, 日常: 3, 社交: 4, 其他: 5 };
const TYPE_ID: Record<string, number> = { 上身長: 1, 上身短: 2, 下身長: 3, 下身短: 4, 配件: 5, 鞋類: 6, 其他: 7 };

type CreateItemFormData = {
  name: string;
  season: string[];
  style: string[];
  type: string;
  note: string;
};

export default function CreateItemPage() {
  const router = useRouter();
  const imageUrl = useCreateItemStore((state) => state.imageUrl) as string;
  const inputPath = useCreateItemStore((state) => state.inputPath) as string;
  const detectedColors = useCreateItemStore((state) => state.detectedColors) as string[];
  const spaceId = useCreateItemStore((state) => state.spaceId);
  const userId = useCreateItemStore((state) => state.userId);

  const [form, setForm] = useState<CreateItemFormData>({
    name: "",
    season: [],
    style: [],
    type: typeOptions[0],
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colorSlots: [string, string, string] = useMemo(
    () =>
      [0, 1, 2].map((index) => normalizeColorToHex(detectedColors[index]) ?? "none") as [
        string,
        string,
        string,
      ],
    [detectedColors]
  );

  function updateFormField(field: keyof CreateItemFormData, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function toggleArrayField(field: "season" | "style", value: string) {
    setForm((previous) => {
      const alreadySelected = previous[field].includes(value);
      return {
        ...previous,
        [field]: alreadySelected
          ? previous[field].filter((item) => item !== value)
          : [...previous[field], value],
      };
    });
  }

  async function handleConfirmCreate() {
    if (!form.name.trim() || !spaceId || !userId) return;

    setIsSubmitting(true);
    try {
      const colorIds = colorSlots
        .map((hex) => colorHexToId(hex))
        .filter((id): id is number => id !== null && id !== undefined);

      const result = await createItem({
        user_id: userId,
        name: form.name.trim(),
        space_id: spaceId,
        type_id: TYPE_ID[form.type],
        season_ids: form.season.map((s) => SEASON_ID[s]),
        color_ids: colorIds,
        style_ids: form.style.map((s) => STYLE_ID[s]),
      });

      if (result) {
        router.push("/myWardrobe/1-1");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full h-[90%] bg-base-100 px-4 py-8 overflow-scroll no-scrollbar">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">新增衣服</h1>

        <div className="card w-full rounded-3xl border border-base-300 bg-base-200 p-6 shadow-sm">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">衣服圖片</label>
            {imageUrl ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-base-100">
                <Image
                  src={imageUrl}
                  alt="去背後衣服圖片"
                  fill
                  sizes="(max-width: 768px) 100vw, 520px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-base-300 bg-base-100 text-sm text-gray-400">
                尚未收到圖片，請先從圖片解析頁進入
              </div>
            )}
            {inputPath ? <p className="mt-2 text-xs text-gray-500">來源: {inputPath}</p> : null}
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">解析顏色</label>
            {detectedColors.length === 0 ? (
              <>
                <ColorStrip colors={[]} />
                <p className="mt-2 text-sm text-gray-400">尚未取得顏色資料</p>
              </>
            ) : (
              <ColorStrip colors={colorSlots} showLabel={true} />
            )}
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">名稱</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateFormField("name", event.target.value)}
              className="input input-bordered w-full"
              aria-label="衣服名稱"
            />
          </div>

          <div className="mb-4">
            <div className="mb-2 block text-sm font-medium">季節 (可多選)</div>
            <div className="flex flex-wrap gap-2">
              {seasonOptions.map((option) => {
                const selected = form.season.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleArrayField("season", option)}
                    className={`btn btn-sm rounded-full ${selected ? "btn-primary" : "btn-outline"}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2 block text-sm font-medium">風格 (可多選)</div>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map((option) => {
                const selected = form.style.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleArrayField("style", option)}
                    className={`btn btn-sm rounded-full ${selected ? "btn-primary" : "btn-outline"}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2 block text-sm font-medium">類型 (單選)</div>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((option) => {
                const selected = form.type === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateFormField("type", option)}
                    className={`btn btn-sm rounded-full ${selected ? "btn-primary" : "btn-outline"}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">備註</label>
            <textarea
              value={form.note}
              onChange={(event) => updateFormField("note", event.target.value)}
              className="textarea textarea-bordered h-24 w-full"
              aria-label="衣服備註"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleConfirmCreate}
              disabled={isSubmitting || !form.name.trim()}
              className="btn btn-primary"
              aria-label="確認新增"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "確認"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
