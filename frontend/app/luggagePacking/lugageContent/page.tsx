"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ClothingFiltersPanel from "@/component/clothing-filters";
import EditActionBar from "@/component/edit-action-bar";
import EditModeToggleButton from "@/component/edit-mode-toggle-button";
import ItemCard from "@/component/item-card";
import {
	createLuggageSpaceFilters,
	getLuggageFilteredItems,
	getLuggageList,
	requestDeleteLuggageItems,
	type LuggageSpaceFilters,
	type LuggageSpaceItem,
} from "@/lib/api/luggage";
import { useUserStore } from "@/store/store";

const seasonOptions = ["春", "夏", "秋", "冬"];
const styleOptions = ["日常", "運動", "正式", "其他"];
const typeOptions = ["上身", "下身", "配件", "鞋類", "其他"];
const colorOptions = ["#2A3388", "#000000", "#FFFFFF", "#9CA3AF"];

export default function LuggageContentPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const userId = useUserStore((state) => state.userId);

	const luggageId = Number(searchParams.get("id") ?? 0);

	const [luggageName, setLuggageName] = useState("");
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
	const [filters, setFilters] = useState<LuggageSpaceFilters>(() => createLuggageSpaceFilters());
	const [filteredItems, setFilteredItems] = useState<LuggageSpaceItem[]>([]);

	useEffect(() => {
		let isMounted = true;
		const nextUserId = userId ?? "";

		async function loadLuggageName() {
			try {
				const list = await getLuggageList(nextUserId);
				const current = list.find((item) => item.id === luggageId);
				if (isMounted) {
					setLuggageName(current?.name ?? "我的行李");
				}
			} catch {
				if (isMounted) {
					setLuggageName("我的行李");
				}
			}
		}

		if (luggageId > 0) {
			void loadLuggageName();
		} else {
			setLuggageName("我的行李");
		}

		return () => {
			isMounted = false;
		};
	}, [luggageId, userId]);

	useEffect(() => {
		let isMounted = true;

		async function loadFilteredItems() {
			const scopedFilters: LuggageSpaceFilters = {
				...filters,
				room: [String(luggageId)],
			};
			const nextItems = await getLuggageFilteredItems(scopedFilters);
			if (isMounted) {
				setFilteredItems(nextItems);
			}
		}

		void loadFilteredItems();

		return () => {
			isMounted = false;
		};
	}, [filters, luggageId]);

	function toggleEditMode() {
		setIsEditMode((prev) => {
			const next = !prev;
			if (!next) {
				setSelectedItemIds([]);
			}
			return next;
		});
	}

	function toggleSelectedItem(itemId: number) {
		setSelectedItemIds((prev) =>
			prev.includes(itemId)
				? prev.filter((selectedId) => selectedId !== itemId)
				: [...prev, itemId]
		);
	}

	function handleAddItem() {
		router.push(`/luggagePacking/selectItems?luggageId=${luggageId}`);
	}

	async function handleDeleteSelectedItems() {
		if (selectedItemIds.length === 0) {
			return;
		}

		const result = await requestDeleteLuggageItems(selectedItemIds);
		if (!result.success) {
			console.error("Delete selected items failed:", result.results);
		}

		const deletedItemIds = result.results
			.filter((item) => item.ok)
			.map((item) => item.id);

		if (deletedItemIds.length > 0) {
			setFilteredItems((prev) =>
				prev.filter((item) => !deletedItemIds.includes(item.id))
			);
		}

		setSelectedItemIds([]);
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

				/>
			</section>

			<section className="w-full h-full p-6">
				<div className="flex items-center h-[10%] gap-5">
					<div className="flex h-full flex-1 items-center justify-center rounded-2xl border-2 border-black text-center text-3xl tracking-[0.18em]">
						{luggageName}
					</div>
					<EditModeToggleButton isEditMode={isEditMode} onToggle={toggleEditMode} />
				</div>

				{isEditMode ? (
					<EditActionBar
						selectedCount={selectedItemIds.length}
						onAdd={handleAddItem}
						onDelete={handleDeleteSelectedItems}
						showMove={false}
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
							imageUrl={item.imageUrl}
							editable={isEditMode}
							selected={selectedItemIds.includes(item.id)}
							onSelectToggle={() => toggleSelectedItem(item.id)}
						/>
					))}
				</div>

				{/* {!isEditMode ? (
					<div className="mt-6 flex justify-end">
						<button
							type="button"
							onClick={() => router.push("/luggagePacking/luggageHome")}
							className="btn btn-neutral h-16 min-h-0 rounded-2xl px-12 text-2xl"
						>
							確認
						</button>
					</div>
				) : null} */}
			</section>
		</main>
	);
}
