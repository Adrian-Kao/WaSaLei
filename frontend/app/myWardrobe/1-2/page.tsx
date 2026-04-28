"use client";

import { useEffect, useState } from "react";

import ClothingFiltersPanel from "@/component/clothing-filters";
import EditActionBar from "@/component/edit-action-bar";
import EditModeToggleButton from "@/component/edit-mode-toggle-button";
import { useCurrentRoom } from "@/hooks/useCurrentRoom";
import { useWardrobeEditor } from "@/hooks/useWardrobeEditor";
import ItemCard from "@/component/item-card";
import {
    getWardrobeClothingItems,
    getWardrobeFilteredClothingItems,
    getWardrobeName,
    getWardrobeRooms,
} from "@/lib/api/clothing";
import { createClothingFilters, type ClothingFilters, type ClothingItem } from "@/lib/types/clothing";


// 這些選項目前是寫死的測試資料，未來可直接換成後端回傳值。
const seasonOptions = ["春", "夏", "秋", "冬"];
const styleOptions = ["日常", "運動", "正式", "其他"];
const typeOptions = ["上身", "下身", "配件", "鞋類", "其他"];
const colorOptions = ["#2A3388", "#000000", "#FFFFFF", "#9CA3AF"];

const wardrobeName = getWardrobeName();
const initialClothingItems = getWardrobeClothingItems();

export default function WardrobePage() {
    const currentRoom = useCurrentRoom();

    // 編輯狀態集中在 hook，page 只負責組 UI 與 filter。
    const {
        isEditMode,
        selectedItemIds,
        toggleEditMode,
        toggleSelectedItem,
        handleDeleteSelectedItems,
        handleMoveSelectedItems,
        moveSelectedItemsToRoom,
        handleAddItem,
    } = useWardrobeEditor(initialClothingItems);
    const [filters, setFilters] = useState<ClothingFilters>(() => createClothingFilters(currentRoom));
    const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [roomOptions, setRoomOptions] = useState<string[]>([]);
    const [selectedTargetRoom, setSelectedTargetRoom] = useState("");
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);

    async function handleOpenMoveModal() {
        handleMoveSelectedItems();

        if (selectedItemIds.length === 0) {
            return;
        }

        setIsMoveModalOpen(true);
        setIsLoadingRooms(true);

        const rooms = await getWardrobeRooms();
        const availableRooms = rooms.filter((room) => room !== currentRoom);
        setRoomOptions(availableRooms);
        setSelectedTargetRoom(availableRooms[0] ?? "");
        setIsLoadingRooms(false);
    }

    function handleCloseMoveModal() {
        setIsMoveModalOpen(false);
        setSelectedTargetRoom("");
    }

    function handleConfirmMove() {
        if (!selectedTargetRoom) {
            return;
        }

        moveSelectedItemsToRoom(selectedTargetRoom);
        handleCloseMoveModal();
    }

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

    useEffect(() => {
        let isMounted = true;

        async function loadFilteredItems() {
            const nextItems = await getWardrobeFilteredClothingItems(filters);
            if (isMounted) {
                setFilteredItems(nextItems);
            }
        }

        void loadFilteredItems();

        return () => {
            isMounted = false;
        };
    }, [filters]);

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
                        onMove={handleOpenMoveModal}
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

            {isMoveModalOpen ? (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 px-4" role="presentation">
                    <div className="w-full rounded-2xl bg-[#D3D3D3] p-8">
                        <div className="space-y-6">
                            {isLoadingRooms ? (
                                <div className="flex h-44 items-center justify-center">
                                    <span className="loading loading-spinner loading-lg"></span>
                                </div>
                            ) : roomOptions.length > 0 ? (
                                roomOptions.map((room) => {
                                    const isSelected = selectedTargetRoom === room;

                                    return (
                                        <button
                                            key={room}
                                            type="button"
                                            onClick={() => setSelectedTargetRoom(room)}
                                            className={`btn h-18 min-h-0 w-full rounded-2xl border-0 bg-base-100 px-10 text-left text-3xl font-medium text-black hover:bg-base-200 ${isSelected ? "outline-4 -outline-offset-4 outline-black" : ""}`}
                                        >
                                            {room}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="rounded-3xl bg-[#EFE3B6] p-10 text-center text-2xl font-medium text-black">
                                    沒有可移動的房間
                                </div>
                            )}

                            <div className="mt-12 flex justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseMoveModal}
                                    className="btn btn-primary btn-outline h-16 min-h-0 rounded-2xl px-12 text-2xl"
                                >
                                    取消
                                </button>

                                <button
                                    type="button"
                                    onClick={handleConfirmMove}
                                    disabled={!selectedTargetRoom}
                                    className="btn btn-primary btn-outline h-16 min-h-0 rounded-2xl px-12 text-2xl"
                                >
                                    確定
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </main>
    );
}
