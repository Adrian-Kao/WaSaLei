"use client"

import { useEffect, useState } from "react";

import OutfitHistoryCard from "@/component/outfit-history-card";
import { getOutfitHistories, getOutfitOccasionOptions } from "@/lib/api/clothing";
import type { OutfitHistory } from "@/lib/types/clothing";

export default function Home() {
  const [occasionFilter, setOccasionFilter] = useState("all");
  const [outfits, setOutfits] = useState<OutfitHistory[]>([]);
  const [occasionOptions, setOccasionOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadOptions() {
      const options = await getOutfitOccasionOptions();
      if (isMounted) {
        setOccasionOptions(options);
      }
    }

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadOutfits() {
      setIsLoading(true);
      const history = await getOutfitHistories(occasionFilter);

      if (isMounted) {
        setOutfits(history);
        setIsLoading(false);
      }
    }

    void loadOutfits();

    return () => {
      isMounted = false;
    };
  }, [occasionFilter]);

  return (
    <main className="h-[90%] overflow-y-auto bg-[#E2E2E2] px-5 pb-8 pt-6 text-black scrollbar-hide">
      <div className="mb-5">
        <select
          value={occasionFilter}
          onChange={(event) => setOccasionFilter(event.target.value)}
          className="select h-13 min-h-0 w-72 rounded-2xl border-0 bg-base-100 text-2xl font-medium"
          aria-label="Occation"
        >
          {occasionOptions.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "Occation" : option}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="btn btn-primary btn-outline rounded-2xl mb-6 h-16 min-h-0 w-full text-6xl font-semibold">
        +
      </button>

      {isLoading ? (
        <div className="flex h-52 items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {outfits.map((outfit) => (
            <OutfitHistoryCard
              key={outfit.id}
              imageUrl={outfit.imageUrl}
              wornDate={outfit.wornDate}
              occasion={outfit.occasion}
            />
          ))}
        </div>
      )}
    </main>
  );
}
