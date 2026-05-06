"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { useAppStore } from "@/store/store";
import { getLuggageList } from "@/lib/api/luggage";

export default function LuggageHomePage() {
  const router = useRouter();
  const userId = localStorage.getItem("userId");

  const [luggages, setLuggages] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLuggages() {
      setLoading(true);
      try {
        const result = await getLuggageList(userId ?? "");
        setLuggages(result);
      } catch (error) {
        console.error("Failed to fetch luggages:", error);
        setLuggages([]);
      } finally {
        setLoading(false);
      }
    }

    void fetchLuggages();
  }, [userId]);

  function handleLuggageClick(luggageId: number) {
    router.push(`/luggagePacking/lugageContent?id=${luggageId}`);
  }

  function handleCreateLuggage() {
    router.push("/luggagePacking/createLuggage");
  }

  return (
    <div className="flex h-[90%] flex-col items-center justify-between bg-base-100 px-5 pb-12 text-black">
      <div className="w-full">
        <div className="text-7xl font-bold tracking-tight mt-28 mb-10 text-center">我的行李</div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex h-44 items-center justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : luggages.length > 0 ? (
            luggages.map((luggage) => {
              return (
                <button
                  key={luggage.id}
                  type="button"
                  onClick={() => handleLuggageClick(luggage.id)}
                  className="btn h-16 min-h-0 w-full rounded-2xl border-2 border-black bg-base-100 text-black hover:bg-base-200 transition-colors text-xl"
                >
                  {luggage.name}
                </button>
              );
            })
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={handleCreateLuggage}
        className="btn btn-primary btn-outline h-16 min-h-0 w-full rounded-2xl text-xl"
      >
        我要打包
      </button>
    </div>
  );
}
