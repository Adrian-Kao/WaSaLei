"use client";

import { useEffect, useMemo, useState } from "react";

import ClothingFiltersPanel from "@/component/clothing-filters";
import EditActionBar from "@/component/edit-action-bar";
import EditModeToggleButton from "@/component/edit-mode-toggle-button";
import { useCurrentRoom } from "@/hooks/useCurrentRoom";
import { useWardrobeEditor } from "@/hooks/useWardrobeEditor";
import ItemCard from "@/component/item-card";
import { getWardrobeClothingItems, getWardrobeName } from "@/lib/api/clothing";
import { filterClothingItems } from "@/lib/filters/clothing";
import { createClothingFilters, type ClothingFilters } from "@/lib/types/clothing";


// 這些選項目前是寫死的測試資料，未來可直接換成後端回傳值。
const seasonOptions = ["all", "春", "夏", "秋", "冬"];
const styleOptions = ["all", "日常", "運動", "正式", "其他"];
const typeOptions = ["all", "上身", "下身", "配件", "鞋類", "其他"];
const colorOptions = ["all", "#2A3388", "#000000", "#FFFFFF", "#9CA3AF"];

const wardrobeName = getWardrobeName();
const initialClothingItems = getWardrobeClothingItems();

export default function WardrobePage() {
    const currentRoom = useCurrentRoom();

    // 編輯狀態集中在 hook，page 只負責組 UI 與 filter。
    const {
        items,
        isEditMode,
        selectedItemIds,
        toggleEditMode,
        toggleSelectedItem,
        handleDeleteSelectedItems,
        handleMoveSelectedItems,
        handleAddItem,
    } = useWardrobeEditor(initialClothingItems);
    const [filters, setFilters] = useState<ClothingFilters>(() => createClothingFilters(currentRoom));

    useEffect(() => {
        setFilters((prev) => {
            if (prev.room === currentRoom) {
                return prev;
            }

            return {
                ...prev,
                room: currentRoom,
            };
        });
    }, [currentRoom]);

    // 先在前端做過濾，之後若接後端也能直接替換這一層。
    const filteredItems = useMemo(() => {
        return filterClothingItems(items, filters);
    }, [filters, items]);

    return (
        <main className="h-[90%] overflow-y-auto scrollbar-hide bg-[#E2E2E2] text-black ">
            <section className="bg-[#D3D3D3] px-4 py-5">
                {/* 上方是四個篩選器，控制清單顯示內容。 */}
                <ClothingFiltersPanel
                    filters={filters}
                    setFilters={setFilters}
                    seasonOptions={seasonOptions}
                    styleOptions={styleOptions}
                    typeOptions={typeOptions}
                    colorOptions={colorOptions}
                />
            </section>

            <section className="w-full h-full p-6">
                {/* 標題列：左邊是衣櫃名稱，右邊是編輯模式切換。 */}
                <div className="flex items-center h-[10%] gap-5">
                    <div className="flex h-full flex-1 items-center justify-center rounded-2xl border-2 border-black text-center text-3xl tracking-[0.18em]">
                        {wardrobeName}
                    </div>
                    <EditModeToggleButton isEditMode={isEditMode} onToggle={toggleEditMode} />
                </div>

                {isEditMode ? (
                    <EditActionBar
                        selectedCount={selectedItemIds.length}
                        onAdd={handleAddItem}
                        onDelete={handleDeleteSelectedItems}
                        onMove={handleMoveSelectedItems}
                    />
                ) : null}

                <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-8">
                    {filteredItems.map((item) => (
                        <ItemCard
                            key={item.id}
                            name={item.name}
                            color={item.color}
                            season={item.season}
                            type={item.type}
                            style={item.style}
                            imageUrl={item.url}
                            editable={isEditMode}
                            selected={selectedItemIds.includes(item.id)}
                            onSelectToggle={() => toggleSelectedItem(item.id)}
                        />
                    ))}
                </div>
                    {/* 下方是衣服卡片清單，會跟著 filter 與編輯選取狀態更新。 */}
            </section>
        </main>
    );
}
