"use client";

import { useMemo, useState } from "react";
import { FiEdit3 } from "react-icons/fi";

import ItemCard from "@/component/item-card";
import { getWardrobeClothingItems, getWardrobeName } from "@/lib/api/clothing";
import { filterClothingItems } from "@/lib/filters/clothing";
import { defaultClothingFilters, type ClothingFilters } from "@/lib/types/clothing";

// 到時要跟後端要資料了，先寫死在這裡測試畫面
const seasonOptions = ["all", "春", "夏", "秋", "冬"];
const styleOptions = ["all", "日常", "運動", "正式"];
const typeOptions = ["all", "上身", "下身", "外套", "鞋"];
const colorOptions = [
	{ label: "all", value: "all" },
	{ label: "深藍", value: "#2A3388" },
	{ label: "黑", value: "#000000" },
	{ label: "白", value: "#FFFFFF" },
	{ label: "灰", value: "#9CA3AF" },
];

const wardrobeName = getWardrobeName();
const clothingItems = getWardrobeClothingItems();

export default function WardrobePage() {
	const [filters, setFilters] = useState<ClothingFilters>(defaultClothingFilters);

	const filteredItems = useMemo(() => {
		return filterClothingItems(clothingItems, filters);
	}, [filters]);

	return (
		<main className="h-[90%] overflow-y-auto scrollbar-hide bg-[#E2E2E2] text-black ">
			<section className="bg-[#D3D3D3] px-4 py-5">
				<div className="grid grid-cols-4 gap-3">
					<div className="space-y-1">
						<label className="block text-2xl leading-none">Season</label>
						<select
							value={filters.season}
							onChange={(event) =>
								setFilters((prev) => ({ ...prev, season: event.target.value }))
							}
							className="select h-12 min-h-0 w-full rounded-xl border-0 bg-white text-2xl font-medium"
						>
							{seasonOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-1">
						<label className="block text-2xl leading-none">style</label>
						<select
							value={filters.style}
							onChange={(event) =>
								setFilters((prev) => ({ ...prev, style: event.target.value }))
							}
							className="select h-12 min-h-0 w-full rounded-xl border-0 bg-white text-2xl font-medium"
						>
							{styleOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-1">
						<label className="block text-2xl leading-none">type</label>
						<select
							value={filters.type}
							onChange={(event) =>
								setFilters((prev) => ({ ...prev, type: event.target.value }))
							}
							className="select h-12 min-h-0 w-full rounded-xl border-0 bg-white text-2xl font-medium"
						>
							{typeOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-1">
						<label className="block text-2xl leading-none">color</label>
						<select
							value={filters.color}
							onChange={(event) =>
								setFilters((prev) => ({ ...prev, color: event.target.value }))
							}
							className="select h-12 min-h-0 w-full rounded-xl border-0 bg-white text-2xl font-medium"
						>
							{colorOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>
				</div>
			</section>

			<section className="w-full h-full p-6">
				<div className="flex items-center h-[10%] gap-5">
					<div className="flex h-full flex-1 items-center justify-center rounded-2xl border-2 border-black text-center text-3xl tracking-[0.18em]">
						{wardrobeName}
					</div>
					<button
						className="btn btn-outline grid h-full aspect-square flex-none place-items-center rounded-xl border-2 border-black text-black"
					>
						<FiEdit3 className="text-3xl" />
					</button>
				</div>

				<div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-8">
					{filteredItems.map((item) => (
						<ItemCard
							key={item.id}
							name={item.name}
							color={item.color}
							season={item.season}
							type={item.type}
							style={item.style}
						/>
					))}
				</div>
			</section>
		</main>
	);
}
