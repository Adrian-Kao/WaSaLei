import type { Dispatch, SetStateAction } from "react";
import Select, { type MultiValue, type StylesConfig } from "react-select";

import type { ClothingFilters } from "@/lib/types/clothing";

type SelectOption = {
    value: string;
    label: string;
};

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
    const normalizeOptions = (options: string[]) => options.filter((value) => value !== "all").map((value) => ({ value, label: value }));

    const toSelectedOptions = (selectedValues: string[], options: SelectOption[]) =>
        options.filter((option) => selectedValues.includes(option.value));

    const toFilterValues = (selected: MultiValue<SelectOption>) => selected.map((option) => option.value);

    const seasonSelectOptions = normalizeOptions(seasonOptions);
    const styleSelectOptions = normalizeOptions(styleOptions);
    const typeSelectOptions = normalizeOptions(typeOptions);
    const colorSelectOptions = normalizeOptions(colorOptions);

    const selectStyles: StylesConfig<SelectOption, true> = {
        control: (base) => ({
            ...base,
            minHeight: 40,
            border: 0,
            borderRadius: 12,
            boxShadow: "none",
            backgroundColor: "#fff",
            paddingLeft: 2,
            paddingRight: 2,
        }),
        valueContainer: (base) => ({
            ...base,
            paddingTop: 2,
            paddingBottom: 2,
            gap: 4,
        }),
        placeholder: (base) => ({
            ...base,
            fontSize: 16,
            lineHeight: 1,
        }),
        multiValue: (base) => ({
            ...base,
            borderRadius: 9999,
            backgroundColor: "#ececec",
        }),
        multiValueLabel: (base) => ({
            ...base,
            fontSize: 16,
        }),
        option: (base) => ({
            ...base,
            fontSize: 16,
            lineHeight: 1.2,
            paddingTop: 10,
            paddingBottom: 10,
        }),
        menu: (base) => ({
            ...base,
            zIndex: 40,
        }),
    };

    const formatColorOptionLabel = (option: SelectOption) => (
        <span className="flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded border border-black" style={{ backgroundColor: option.value }} />
            <span>{option.label}</span>
        </span>
    );

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

            <div className="grid grid-cols-1 gap-1">
                <div className="space-y-1">
                    <label className="block text-xl leading-none">season</label>
                    <Select
                        isMulti
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        options={seasonSelectOptions}
                        value={toSelectedOptions(filters.season, seasonSelectOptions)}
                        onChange={(selected) => setFilters((prev) => ({ ...prev, season: toFilterValues(selected) }))}
                        placeholder="全部"
                        styles={selectStyles}
                        noOptionsMessage={() => "沒有選項"}
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xl leading-none">style</label>
                    <Select
                        isMulti
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        options={styleSelectOptions}
                        value={toSelectedOptions(filters.style, styleSelectOptions)}
                        onChange={(selected) => setFilters((prev) => ({ ...prev, style: toFilterValues(selected) }))}
                        placeholder="全部"
                        styles={selectStyles}
                        noOptionsMessage={() => "沒有選項"}
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xl leading-none">type</label>
                    <Select
                        isMulti
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        options={typeSelectOptions}
                        value={toSelectedOptions(filters.type, typeSelectOptions)}
                        onChange={(selected) => setFilters((prev) => ({ ...prev, type: toFilterValues(selected) }))}
                        placeholder="全部"
                        styles={selectStyles}
                        noOptionsMessage={() => "沒有選項"}
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <label className="block text-xl leading-none">color</label>
                    </div>
                    <Select
                        isMulti
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        options={colorSelectOptions}
                        value={toSelectedOptions(filters.color, colorSelectOptions)}
                        onChange={(selected) => setFilters((prev) => ({ ...prev, color: toFilterValues(selected) }))}
                        placeholder="全部"
                        styles={selectStyles}
                        noOptionsMessage={() => "沒有選項"}
                        formatOptionLabel={formatColorOptionLabel}
                    />
                </div>
            </div>
        </div>
    );
}