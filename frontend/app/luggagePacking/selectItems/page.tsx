"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ClothingFiltersPanel from "@/component/clothing-filters";
import ItemCard from "@/component/item-card";
import {
	addItemsToLuggage,
	createLuggageSpaceFilters,
	filterLuggageItems,
	getWardrobeItemsByUserId,
	getWardrobeRoomSelectOptions,
	requestAutoOutfitSelection,
	type LuggageSpaceFilters,
	type LuggageSpaceItem,
	type SpaceFilterOption,
} from "@/lib/api/luggage";
import { COLOR_OPTIONS, SEASON_OPTIONS, STYLE_OPTIONS, TYPE_OPTIONS } from "@/lib/constants/filter-options";
import { useUserStore } from "@/store/store";

export default function SelectItemsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const userId = useUserStore((state) => state.userId);

	const luggageId = Number(searchParams.get("luggageId") ?? 0);

	const [filters, setFilters] = useState<LuggageSpaceFilters>(() => createLuggageSpaceFilters());
	const [allItems, setAllItems] = useState<LuggageSpaceItem[]>([]);
	const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
	const [roomOptions, setRoomOptions] = useState<SpaceFilterOption[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetchingItems, setIsFetchingItems] = useState(false);

	useEffect(() => {
		let isMounted = true;

		async function loadInitialData() {
			if (!userId) {
				if (isMounted) {
					setRoomOptions([]);
					setAllItems([]);
				}
				return;
			}

			setIsFetchingItems(true);
			try {
				const [rooms, items] = await Promise.all([
					getWardrobeRoomSelectOptions(userId),
					getWardrobeItemsByUserId(userId),
				]);

				if (isMounted) {
					setRoomOptions(rooms);
					setAllItems(items);
				}
			} catch (error) {
				console.error("Failed to load packing item data:", error);
				if (isMounted) {
					setRoomOptions([]);
					setAllItems([]);
				}
			} finally {
				if (isMounted) {
					setIsFetchingItems(false);
				}
			}
		}

		void loadInitialData();

		return () => {
			isMounted = false;
		};
	}, [userId]);

	const filteredItems = useMemo(() => filterLuggageItems(allItems, filters), [allItems, filters]);

	function toggleSelectedItem(itemId: number) {
		setSelectedItemIds((prev) =>
			prev.includes(itemId)
				? prev.filter((selectedId) => selectedId !== itemId)
				: [...prev, itemId]
		);
	}

	async function handleAutoOutfit() {
		if (filteredItems.length === 0) {
			window.alert("目前篩選條件下沒有可用衣服。");
			return;
		}

		if (luggageId <= 0) {
			window.alert("找不到指定行李箱。");
			return;
		}

		try {
			const result = await requestAutoOutfitSelection(luggageId, filteredItems);

			if (result.selectedItemIds.length === 0) {
				window.alert("目前篩選條件下無法產生穿搭。");
				return;
			}

			setSelectedItemIds(result.selectedItemIds);

			const warningText = result.warnings.length > 0 ? `\n\n${result.warnings.join("\n")}` : "";
			window.alert(`已依目前篩選條件產生 ${result.days} 天穿搭，並選取 ${result.selectedItemIds.length} 件衣服。${warningText}`);
		} catch (error) {
			console.error("Failed to generate auto outfit:", error);
			window.alert(error instanceof Error ? error.message : "一鍵穿搭產生失敗");
		}
	}

	async function handleConfirm() {
		if (selectedItemIds.length === 0) {
			return;
		}

		if (luggageId <= 0) {
			console.error("Invalid luggage ID");
			return;
		}

		try {
			setIsLoading(true);
			await addItemsToLuggage(luggageId, selectedItemIds);
			router.replace(`/luggagePacking/lugageContent?id=${luggageId}&refresh=${Date.now()}`);
		} catch (error) {
			console.error("Failed to add items:", error);
			setIsLoading(false);
		}
	}

	return (
		<main className="h-full overflow-y-auto scrollbar-hide bg-[#E2E2E2] text-black">
			<section className="bg-[#D3D3D3] px-4 py-5">
				<ClothingFiltersPanel
					filters={filters}
					setFilters={setFilters}
					seasonOptions={SEASON_OPTIONS}
					styleOptions={STYLE_OPTIONS}
					typeOptions={TYPE_OPTIONS}
					colorOptions={COLOR_OPTIONS}
					showRoomFilter
					roomOptions={roomOptions}
					onAutoOutfit={handleAutoOutfit}
					autoOutfitDisabled={isFetchingItems || filteredItems.length === 0}
				/>
			</section>

			<section className="w-full p-6">
				<div className="flex items-center justify-between text-base text-black/70">
					<span>{isFetchingItems ? "載入衣服中..." : `顯示 ${filteredItems.length} / ${allItems.length} 件`}</span>
					<span>已選 {selectedItemIds.length} 件</span>
				</div>

				{!isFetchingItems && filteredItems.length === 0 ? (
					<div className="mt-10 rounded-lg bg-white px-4 py-8 text-center text-lg text-black/60">
						沒有符合條件的衣服
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
							imageUrl={item.imageUrl}
							editable
							selected={selectedItemIds.includes(item.id)}
							onSelectToggle={() => toggleSelectedItem(item.id)}
						/>
					))}
				</div>

				<div className="mt-12 flex justify-center gap-3 pb-8">
					<button
						type="button"
						onClick={() => router.back()}
						disabled={isLoading}
						className="btn btn-primary btn-outline h-16 min-h-0 rounded-2xl px-12 text-2xl"
					>
						取消
					</button>

					<button
						type="button"
						onClick={handleConfirm}
						disabled={selectedItemIds.length === 0 || isLoading}
						className="btn btn-primary btn-outline h-16 min-h-0 rounded-2xl px-12 text-2xl"
					>
						{isLoading ? "新增中..." : `確認 (${selectedItemIds.length})`}
					</button>
				</div>
			</section>
		</main>
	);
}
