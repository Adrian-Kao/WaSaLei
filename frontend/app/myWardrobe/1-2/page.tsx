"use client";

import { useMemo, useState } from "react";
import { FiEdit3, FiMove, FiPlus, FiTrash2, FiX } from "react-icons/fi";

import ItemCard from "@/component/item-card";
import { getWardrobeClothingItems, getWardrobeName } from "@/lib/api/clothing";
import { filterClothingItems } from "@/lib/filters/clothing";
import { defaultClothingFilters, type ClothingFilters } from "@/lib/types/clothing";
import { useWardrobeEditor } from "./useWardrobeEditor";


// 這些選項目前是寫死的測試資料，未來可直接換成後端回傳值。
const seasonOptions = ["all", "春", "夏", "秋", "冬"];
const styleOptions = ["all", "日常", "運動", "正式", "其他"];
const typeOptions = ["all", "上身", "下身", "配件", "鞋類", "其他"];

const colorOptions = ["all", "#2A3388", "#000000", "#FFFFFF", "#9CA3AF"];

const wardrobeName = getWardrobeName();
const initialClothingItems = getWardrobeClothingItems();

export default function WardrobePage() {
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
    const [filters, setFilters] = useState<ClothingFilters>(defaultClothingFilters);

    // 先在前端做過濾，之後若接後端也能直接替換這一層。
    const filteredItems = useMemo(() => {
        return filterClothingItems(items, filters);
    }, [filters, items]);

    return (
        <main className="h-[90%] overflow-y-auto scrollbar-hide bg-[#E2E2E2] text-black ">
            <section className="bg-[#D3D3D3] px-4 py-5">
                {/* 上方是四個篩選器，控制清單顯示內容。 */}
                <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                        <label className="block text-2xl leading-none">Season</label>
                        <select
                            value={filters.season}
                            onChange={(e) => setFilters((prev) => ({ ...prev, season: e.target.value }))}
                            className="select h-12 min-h-0 w-full rounded-xl border-0 bg-white text-2xl font-medium"
                        >
                            {seasonOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-2xl leading-none">style</label>
                        <select
                            value={filters.style}
                            onChange={(e) => setFilters((prev) => ({ ...prev, style: e.target.value }))}
                            className="select h-12 min-h-0 w-full rounded-xl border-0 bg-white text-2xl font-medium"
                        >
                            {styleOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-2xl leading-none">type</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                            className="select h-12 min-h-0 w-full rounded-xl border-0 bg-white text-2xl font-medium"
                        >
                            {typeOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <label className="block text-2xl leading-none">color</label>
                        </div>
                        <div className="dropdown w-full">
                            <div
                                tabIndex={0}
                                className="btn btn-outline h-12 min-h-0 w-full rounded-xl border-0 bg-white p-0"
                            >
                                {filters.color === "all" ? (
                                    <span className="text-2xl font-medium leading-none">all</span>
                                ) : (
                                    <span
                                        className="inline-block h-6 w-6 rounded border border-black"
                                        style={{ backgroundColor: filters.color }}
                                    />
                                )}
                            </div>
                            <ul className="dropdown-content menu z-30 w-full mt-1 rounded-xl bg-base-100 p-2 shadow" tabIndex={0}>
                                {colorOptions.map((opt) => (
                                    <li key={opt}>
                                        <button
                                            type="button"
                                            onClick={() => setFilters((prev) => ({ ...prev, color: opt }))}
                                            className="flex h-10 items-center justify-center"
                                            aria-label={opt === "all" ? "all" : opt}
                                            title={opt === "all" ? "all" : opt}
                                        >
                                            {opt === "all" ? (
                                                <span className="text-base font-medium">all</span>
                                            ) : (
                                                <span
                                                    className="inline-block h-5 w-5 rounded border border-black"
                                                    style={{ backgroundColor: opt }}
                                                />
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full h-full p-6">
                {/* 標題列：左邊是衣櫃名稱，右邊是編輯模式切換。 */}
                <div className="flex items-center h-[10%] gap-5">
                    <div className="flex h-full flex-1 items-center justify-center rounded-2xl border-2 border-black text-center text-3xl tracking-[0.18em]">
                        {wardrobeName}
                    </div>
                    {isEditMode ? (
                        <button
                            type="button"
                            onClick={toggleEditMode}
                            className="btn btn-outline grid h-full aspect-square flex-none place-items-center rounded-xl border-2 border-black text-black"
                        >
                            <FiX className="text-3xl" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={toggleEditMode}
                            className="btn btn-outline grid h-full aspect-square flex-none place-items-center rounded-xl border-2 border-black text-black"
                        >
                            <FiEdit3 className="text-3xl" />
                        </button>
                    )}
                </div>

                {isEditMode ? (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="btn btn-neutral h-14 min-h-0 w-full rounded-xl px-5 text-2xl font-medium "
                        >
                            <FiPlus className="shrink-0" />
                        </button>

                        <button
                            type="button"
                            onClick={handleDeleteSelectedItems}
                            disabled={selectedItemIds.length === 0}
                            className="btn btn-neutral h-14 min-h-0 w-full rounded-xl px-0 text-2xl font-medium [&>svg]:h-8! [&>svg]:w-8!"
                        >
                            <FiTrash2 className="shrink-0" />
                            
                        </button>

                        <button
                            type="button"
                            onClick={handleMoveSelectedItems}
                            disabled={selectedItemIds.length === 0}
                            className="btn btn-neutral h-14 min-h-0 w-full rounded-xl px-5 text-2xl font-medium [&>svg]:h-8! [&>svg]:w-8!"
                        >
                            <FiMove className="shrink-0" />
                            
                        </button>
                    </div>
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
