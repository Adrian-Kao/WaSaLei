"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ClothingFiltersPanel from "@/component/clothing-filters";
import EditActionBar from "@/component/edit-action-bar";
import EditModeToggleButton from "@/component/edit-mode-toggle-button";
import { useWardrobeEditor } from "@/hooks/useWardrobeEditor";
import ItemCard from "@/component/item-card";
import {
    getSpaceItems,
    getUserRooms
} from "@/lib/api/clothing";
import { FIXED_COLORS } from "@/lib/constants/color-map";
import { createClothingFilters, type ClothingFilters, type ClothingItem } from "@/lib/types/clothing";
import { useUserStore } from "@/store/store";

// 這些選項目前是寫死的測試資料，未來可直接換成後端回傳值。
const seasonOptions = ["春", "夏", "秋", "冬"];
const styleOptions = ["運動", "正式", "日常", "社交", "其他"];
const typeOptions = ["上身長", "上身短", "下身長", "下身短", "配件", "鞋類", "其他"];
const colorOptions = FIXED_COLORS.map((color) => color.hex);

// const wardrobeName = getWardrobeName();
const initialClothingItems: ClothingItem[] = [];  // 本地篩選：初始為空，實際衣物在 fetchRooms 取得

type RoomInfo = {
    roomId: number;
    name: string;
    itemCount: number;
    totalCapacity: number;
};

function matchesFilters(item: ClothingItem, filters: ClothingFilters) {
    const itemStyles = Array.isArray(item.style) ? item.style : [item.style];
    const itemColors = item.color.filter((color) => color && color !== "none");

    if (filters.season.length > 0 && !filters.season.some((season) => item.season.includes(season))) {
        return false;
    }

    if (filters.style.length > 0 && !filters.style.some((style) => itemStyles.includes(style))) {
        return false;
    }

    if (filters.type.length > 0 && !filters.type.includes(item.type)) {
        return false;
    }

    if (filters.color.length > 0 && !filters.color.some((color) => itemColors.includes(color))) {
        return false;
    }

    return true;
}


export default function WardrobePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomId = Number(searchParams.get("roomId") ?? 0);
    const userId = useUserStore((state) => state.userId);
    const [allRooms, setAllRooms] = useState<RoomInfo[]>([]);
    const [roomItems, setRoomItems] = useState<ClothingItem[]>([]);

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
    } = useWardrobeEditor(initialClothingItems, async () => {
        if (!roomId) return;
        const items = await getSpaceItems(roomId);
        setRoomItems(items);
    });
    const [filters, setFilters] = useState<ClothingFilters>(() => createClothingFilters());
    const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [roomOptions, setRoomOptions] = useState<RoomInfo[]>([]);
    const [selectedTargetRoom, setSelectedTargetRoom] = useState("");
    const [loading, setLoading] = useState(true);

    async function handleOpenMoveModal() {
        handleMoveSelectedItems();

        if (selectedItemIds.length === 0) {
            return;
        }

        setIsMoveModalOpen(true);

        const availableRooms = allRooms.filter((room) => room.roomId !== roomId);
        setRoomOptions(availableRooms);
        setSelectedTargetRoom(availableRooms[0] ? String(availableRooms[0].roomId) : "");
    }
    // 頁面載入時取得當前房間衣物與所有可移動房間
    useEffect(() => {
        let isMounted = true;

        async function fetchRooms() {
            setLoading(true);

            if (!userId || !roomId) {
                if (isMounted) {
                    setAllRooms([]);
                    setRoomItems([]);
                    setLoading(false);
                }
                return;
            }

            try {
                const [roomList, items] = await Promise.all([getUserRooms(userId), getSpaceItems(roomId)]);

                if (!isMounted) {
                    return;
                }

                setAllRooms(
                    roomList.map((room: any) => ({
                        roomId: room.Space_ID,
                        name: room.Space_Name || `沒抓到房間名`,
                        itemCount: room.Item_Count ?? 0,
                        totalCapacity: room.Capacity ?? 0,
                    }))
                );
                setRoomItems(items);
            } catch (error) {
                if (isMounted) {
                    setAllRooms([]);
                    setRoomItems([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        void fetchRooms();

        return () => {
            isMounted = false;
        };
    }, [userId, roomId]);

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

    function handleAddAndNavigate() {
        handleAddItem();
        router.push(`/myWardrobe/1-5?roomId=${roomId}`);
    }

    useEffect(() => {
        setFilteredItems(roomItems.filter((item) => matchesFilters(item, filters)));
    }, [filters, roomItems]);

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
                {/* 標題列：左邊是目前房間，右邊是編輯模式切換。 */}
                <div className="flex items-center h-[10%] gap-5">
                    <div className="flex h-full flex-1 items-center justify-center rounded-2xl border-2 border-black text-center text-3xl tracking-[0.18em]">
                        {allRooms.find(room => room.roomId === roomId)?.name ?? "尚未選擇房間"}
                    </div>
                    <EditModeToggleButton isEditMode={isEditMode} onToggle={toggleEditMode} />
                </div>

                {isEditMode ? (
                    <EditActionBar
                        selectedCount={selectedItemIds.length}
                        onAdd={handleAddAndNavigate}
                        onDelete={handleDeleteSelectedItems}
                        onMove={handleOpenMoveModal}
                    />
                ) : null}

                {loading ? (
                    <div className="mt-6 flex h-44 items-center justify-center">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-8">
                        {filteredItems.map((item) => (
                            <ItemCard
                                itemId={item.id}
                                key={`${item.id}-${item.name}`}
                                name={item.name}
                                color={item.color}
                                season={item.season}
                                type={item.type}
                                style={item.style}
                                imageUrl={item.imageUrl}
                                editable={isEditMode}
                                selected={selectedItemIds.includes(item.id)}
                                onSelectToggle={() => toggleSelectedItem(item.id)}
                            />
                        ))}
                    </div>
                )}
                {/* 下方是衣服卡片清單，會跟著 filter 與編輯選取狀態更新。 */}
            </section>

            {isMoveModalOpen ? (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 px-4" role="presentation">
                    <div className="w-full rounded-2xl bg-[#D3D3D3] p-8">
                        <div className="space-y-6">
                            {roomOptions.length > 0 ? (
                                roomOptions.map((room) => {
                                    const isSelected = selectedTargetRoom === String(room.roomId);

                                    return (
                                        <button
                                            key={room.roomId}
                                            type="button"
                                            onClick={() => setSelectedTargetRoom(String(room.roomId))}
                                            className={`btn h-18 min-h-0 w-full rounded-2xl border-0 bg-base-100 px-10 text-left text-3xl font-medium text-black hover:bg-base-200 ${isSelected ? "outline-4 -outline-offset-4 outline-black" : ""}`}
                                        >
                                            {room.name}
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
