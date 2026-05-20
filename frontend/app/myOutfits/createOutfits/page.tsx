
"use client";

import ItemCard from "@/component/item-card";

export default function CreateOutfitsPage() {
 

  return (
    <div className="max-w-xl mx-auto p-6 h-[90%] overflow-auto no-scrollbar">
      <div className="mb-4 flex justify-end">
        <button className="btn btn-outline btn-sm btn-primary">編輯</button>
      </div>

      <img src="/1.webp" alt="outfit" className="w-full rounded mb-4" />

      <div className="mb-4">
        <label className="block font-semibold mb-1">日期</label>
        <div>2026-05-15</div>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">note</label>
        <div className="text-gray-600">今天的穿搭備註顯示區</div>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">場合</label>
        <div className="text-gray-600">休閒</div>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">服裝配件列表</label>
        <div className="grid grid-cols-2 gap-4">
          {staticItems.map((item) => (
            <div key={item.id} className="relative">
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

      <button className="btn btn-error w-full mt-4">刪除此歷史紀錄</button>
    </div>
  );
}
