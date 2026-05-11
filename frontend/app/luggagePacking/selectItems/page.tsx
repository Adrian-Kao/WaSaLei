"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ClothingFiltersPanel from "@/component/clothing-filters";
import ItemCard from "@/component/item-card";
import {
	addItemsToLuggage,
	createLuggageSpaceFilters,
	getAllWardrobeItems,
	getLuggageRoomOptions,
	type LuggageSpaceFilters,
	type LuggageSpaceItem,
} from "@/lib/api/luggage";
import { useUserStore } from "@/store/store";

const seasonOptions = ["春", "夏", "秋", "冬"];
const styleOptions = ["日常", "運動", "正式", "其他"];
const typeOptions = ["上身", "下身", "配件", "鞋類", "其他"];
const colorOptions = ["#2A3388", "#000000", "#FFFFFF", "#9CA3AF"];

export default function SelectItemsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const userId = useUserStore((state) => state.userId);

	const luggageId = Number(searchParams.get("luggageId") ?? 0);

	const [filters, setFilters] = useState<LuggageSpaceFilters>(() => createLuggageSpaceFilters());
	const [allItems, setAllItems] = useState<LuggageSpaceItem[]>([]);
	const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
	const [roomOptions, setRoomOptions] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// 載入所有房間列表
	useEffect(() => {
		let isMounted = true;

		async function loadRoomOptions() {
			if (!userId) {
				if (isMounted) {
					setRoomOptions([]);
				}
				return;
			}

			try {
				const rooms = await getLuggageRoomOptions(userId);
				if (isMounted) {
					setRoomOptions(rooms);
				}
			} catch (error) {
				console.error("Failed to load room options:", error);
			}
		}

		void loadRoomOptions();

		return () => {
			isMounted = false;
		};
	}, [userId]);

	// 載入所有房間的衣物（根據篩選條件）
	useEffect(() => {
		let isMounted = true;

		async function loadAllItems() {
			try {
				const items = await getAllWardrobeItems(filters);
				if (isMounted) {
					setAllItems(items);
				}
			} catch (error) {
				console.error("Failed to load items:", error);
			}
		}

		void loadAllItems();

		return () => {
			isMounted = false;
		};
	}, [filters]);

	function toggleSelectedItem(itemId: number) {
		setSelectedItemIds((prev) =>
			prev.includes(itemId)
				? prev.filter((selectedId) => selectedId !== itemId)
				: [...prev, itemId]
		);
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
			router.back();
		} catch (error) {
			console.error("Failed to add items:", error);
			setIsLoading(false);
		}
	}

	return (
		<main className="h-[90%] overflow-y-auto scrollbar-hide bg-[#E2E2E2] text-black">
			<section className="bg-[#D3D3D3] px-4 py-5">
				<ClothingFiltersPanel
					filters={filters}
					setFilters={setFilters}
					seasonOptions={seasonOptions}
					styleOptions={styleOptions}
					typeOptions={typeOptions}
					colorOptions={colorOptions}
					showRoomFilter
					roomOptions={roomOptions}
				/>
			</section>

			<section className="w-full h-full p-6">
				<div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-8">
					{allItems.map((item) => (
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
