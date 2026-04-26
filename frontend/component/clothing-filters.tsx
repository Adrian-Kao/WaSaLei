import type { Dispatch, SetStateAction } from "react";

import type { ClothingFilters } from "@/lib/types/clothing";

type ClothingFiltersProps = {
    filters: ClothingFilters;
    setFilters: Dispatch<SetStateAction<ClothingFilters>>;
    seasonOptions: string[];
    styleOptions: string[];
    typeOptions: string[];
    colorOptions: string[];
    showRoomFilter?: boolean;
    roomOptions?: string[];
};

export default function ClothingFilters({
    filters,
    setFilters,
    seasonOptions,
    styleOptions,
    typeOptions,
    colorOptions,
    showRoomFilter = false,
    roomOptions = [],
}: ClothingFiltersProps) {
    return (
        <div className="grid gap-3">
            {showRoomFilter ? (
                <div className="space-y-1 w-full mx-auto">
                    <label className="block text-2xl leading-none">room</label>
                    <select
                        value={filters.room ?? "all"}
                        onChange={(e) => setFilters((prev) => ({ ...prev, room: e.target.value }))}
                        className="select h-12 min-h-0 w-full rounded-xl border-0 bg-white text-2xl font-medium"
                    >
                        {roomOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            ) : null}

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
                        <ul className="dropdown-content menu z-30 mt-1 w-full rounded-xl bg-base-100 p-2 shadow" tabIndex={0}>
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
        </div>
    );
}