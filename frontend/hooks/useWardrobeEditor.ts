import { useState } from "react";

import { requestDeleteSelectedItems, requestMoveSelectedItemsToRoom } from "@/lib/api/clothing";
import type { ClothingItem } from "@/lib/types/clothing";

export function useWardrobeEditor(initialItems: ClothingItem[]) {
	const [items, setItems] = useState(initialItems);
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

	// 切換編輯模式時，如果關掉編輯模式就順便清掉所有選取。
	function toggleEditMode() {
		setIsEditMode((prev) => {
			const next = !prev;

			if (!next) {
				setSelectedItemIds([]);
			}

			return next;
		});
	}

	// 這是卡片右上角的選取/取消選取行為。
	function toggleSelectedItem(itemId: number) {
		setSelectedItemIds((prev) =>
			prev.includes(itemId) ? prev.filter((selectedId) => selectedId !== itemId) : [...prev, itemId],
		);
	}

	// 目前先做最基本的刪除：直接從本地 items 移除。
	function handleDeleteSelectedItems() {
		if (selectedItemIds.length === 0) {
			return;
		}

		void requestDeleteSelectedItems(selectedItemIds);
		setSelectedItemIds([]);
	}

	// MOVE 先開啟 UI 流程，不直接改資料。
	function handleMoveSelectedItems() {
		if (selectedItemIds.length === 0) {
			return;
		}
	}

	function moveSelectedItemsToRoom(targetRoom: string) {
		if (selectedItemIds.length === 0 || !targetRoom) {
			return;
		}

		void requestMoveSelectedItemsToRoom(selectedItemIds, targetRoom);
		setSelectedItemIds([]);
	}

	// ADD 先清空選取，後續可以改成開新增表單或導頁。
	function handleAddItem() {
		setSelectedItemIds([]);
	}

	return {
		items,
		isEditMode,
		selectedItemIds,
		toggleEditMode,
		toggleSelectedItem,
		handleDeleteSelectedItems,
		handleMoveSelectedItems,
		moveSelectedItemsToRoom,
		handleAddItem,
	};
}