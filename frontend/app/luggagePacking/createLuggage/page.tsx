"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLuggage, formatLuggageName } from "@/lib/api/luggage";

const SEASON_OPTIONS = ["春", "夏", "秋", "冬"];

export default function CreateLuggagePage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [season, setSeason] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSeasonChange = (selectedSeason: string) => {
    setSeason((prev) =>
      prev.includes(selectedSeason)
        ? prev.filter((s) => s !== selectedSeason)
        : [...prev, selectedSeason]
    );
  };

  const handleConfirm = async () => {
    if (!destination.trim() || !days.trim() || season.length === 0) {
      setError("請填寫所有欄位");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const name = formatLuggageName(destination, days, season);
      await createLuggage(name);
      router.push("/luggagePacking/luggageHome");
    } catch (err) {
      setError(err instanceof Error ? err.message : "建立行李失敗");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-white px-5 py-10">
      <h1 className="mb-15 text-[32px] font-semibold text-[#333]">建立行李</h1>

      <div className="mb-10 flex w-full max-w-125 flex-col">
        <label className="mb-3 text-[16px] font-medium text-[#333]">Name</label>
        <input
          type="text"
          placeholder="Value"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="rounded-lg border border-[#ddd] bg-base-200 px-4 py-4 text-[16px] text-[#333] transition-colors placeholder:text-[#999] focus:border-[#999] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f0f0f0] disabled:text-[#999]"
          disabled={loading}
        />
      </div>

      <div className="mb-10 flex w-full max-w-125 flex-col">
        <label className="mb-3 text-[16px] font-medium text-[#333]">Days</label>
        <input
          type="number"
          placeholder="Value"
          value={days}
          min={1}
          step={1}
          inputMode="numeric"
          onChange={(e) => setDays(e.target.value)}
          className="rounded-lg border border-[#ddd] bg-base-200 px-4 py-4 text-[16px] text-[#333] transition-colors placeholder:text-[#999] focus:border-[#999] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f0f0f0] disabled:text-[#999]"
          disabled={loading}
        />
      </div>

      <div className="mb-10 flex w-full max-w-125 flex-col">
        <label className="mb-3 text-[16px] font-medium text-[#333]">Season</label>
        <div className="flex flex-wrap gap-4 rounded-lg border border-[#ddd] bg-base-200 p-3">
          {SEASON_OPTIONS.map((opt) => (
            <label key={opt} className="flex cursor-pointer select-none items-center gap-2 text-sm text-[#333]">
              <input
                type="checkbox"
                checked={season.includes(opt)}
                onChange={() => handleSeasonChange(opt)}
                disabled={loading}
                className="h-4.5 w-4.5 cursor-pointer accent-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <div className="mb-5 w-full max-w-125 rounded bg-[#ffebee] px-3 py-3 text-sm text-[#d32f2f]">{error}</div>}

      <button
        onClick={handleConfirm}
        className="mt-5 btn btn-primary btn-outline h-16 min-h-0 w-full rounded-2xl text-xl"
        disabled={loading}
      >
        {loading ? "處理中..." : "確認"}
      </button>
    </div>
  );
}
