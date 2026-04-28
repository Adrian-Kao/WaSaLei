"use client";

import { useState } from "react";

import CreateItemCard from "@/component/create-item-card";

const seasonOptions = ["春", "夏", "秋", "冬"];
const styleOptions = ["休閒", "正式", "運動", "簡約"];
const typeOptions = ["上身", "下身", "外套", "配件"];
const itemColor: [string, string, string] = ["2F3650", "none", "none"];

export default function CreateItemPage() {
  const [name, setName] = useState("藍色T");
  const [style, setStyle] = useState(styleOptions[0]);
  const [season, setSeason] = useState(seasonOptions[1]);
  const [type, setType] = useState(typeOptions[0]);
  const [note, setNote] = useState("Value");

  return (
    <div className="flex min-h-[90%] flex-col items-center bg-base-100 px-5 pb-8 pt-8 text-black">
      <div className="w-full max-w-sm space-y-6">
        <CreateItemCard
          name={name}
          onNameChange={setName}
          style={style}
          onStyleChange={setStyle}
          season={season}
          onSeasonChange={setSeason}
          type={type}
          onTypeChange={setType}
          color={itemColor}
          imageUrl="/1.webp"
          imageAlt={name}
          seasonOptions={seasonOptions}
          styleOptions={styleOptions}
          typeOptions={typeOptions}
        />

        <div className="space-y-2">
          <label htmlFor="note" className="block text-xl font-medium leading-none">
            筆記
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="textarea textarea-bordered h-28 w-full rounded-2xl border border-base-300 bg-white p-4 text-lg leading-relaxed text-black shadow-sm"
            placeholder="輸入筆記"
          />
        </div>

        <button
          type="button"
          className="btn h-14 w-full rounded-2xl border-0 bg-base-300 text-xl font-semibold text-black shadow-sm hover:bg-base-400"
        >
          確認
        </button>
      </div>
    </div>
  );
}
