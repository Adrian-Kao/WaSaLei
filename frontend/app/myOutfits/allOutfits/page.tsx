"use client"

import { useEffect, useState } from "react";

import OutfitHistoryCard from "@/component/outfit-history-card";
import { getAllOutfits,getOutfitOccasionOptions } from "@/lib/api/outfits";

import type { Outfit } from "@/lib/types/outfit";

export default function AllOutfitsPage() {
  const [occasionFilter, setOccasionFilter] = useState("all");
  const [outfits, setOutfits] = useState<Outfit[]>([]);
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
      const allOutfits = await getAllOutfits();
      
      // 前端篩選 occasion
      const filtered = occasionFilter === "all" 
        ? allOutfits 
        : allOutfits.filter(o => o.occasion === occasionFilter);

      if (isMounted) {
        setOutfits(filtered);
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
      <div className="mb-5 ">
        <select
          value={occasionFilter}
          onChange={(event) => setOccasionFilter(event.target.value)}
          className="select h-13 min-h-0 w-full rounded-2xl border-0 bg-base-100 text-2xl font-medium"
          aria-label="Occasion"
        >
          {occasionOptions.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All Occasions" : option}
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
              imageUrl={outfit.photo}
              wornDate={outfit.wornDate}
              occasion={outfit.occasion}
              href={`/myOutfits/singleOutfit?id=${outfit.id}`}
              ariaLabel={`查看穿搭 ${outfit.id}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}
