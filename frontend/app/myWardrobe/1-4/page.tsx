"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import ItemCard from "@/component/item-card";
import { getItemById, getItemHistory } from "@/lib/api/clothing";
import type { ClothingItem, ItemHistory } from "@/lib/types/clothing";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function ItemDetailPage() {
  const searchParams = useSearchParams();
  const itemId = parseInt(searchParams.get("id") || "1", 10);

  const [item, setItem] = useState<ClothingItem | null>(null);
  const [history, setHistory] = useState<ItemHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch item details
    const fetchedItem = getItemById(itemId);
    const fetchedHistory = getItemHistory(itemId);

    setItem(fetchedItem || null);
    setHistory(fetchedHistory);
    setIsLoading(false);
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
    <div className="w-full h-[90%] max-w-3xl mx-auto px-4 py-8 overflow-scroll scroller-hide">
      {/* Item Card Section */}
      <div className="mb-12">
        <div className="max-w-sm mx-auto">
          <ItemCard
            name={item.name}
            color={item.color}
            season={item.season}
            type={item.type}
            style={item.style}
          />
        </div>
      </div>

      {/* Notes Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">筆記</h2>
          <button
            type="button"
            className="btn btn-sm btn-ghost gap-2"
            aria-label="編輯筆記"
          >
            <FiEdit2 className="text-lg" />
          </button>
        </div>

        {item.note ? (
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-4">
              <p className="text-sm leading-relaxed">{item.note}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>還沒有筆記</p>
          </div>
        )}
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">歷史紀錄</h2>

        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((record, index) => (
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
