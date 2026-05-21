import type { Dispatch, SetStateAction } from "react";
import Select, { type MultiValue, type StylesConfig } from "react-select";

import type { ClothingFilters } from "@/lib/types/clothing";
import { colorHexToName } from "@/lib/constants/color-map";

export type FilterSelectOption = {
    value: string;
    label: string;
};

type OptionInput = string | FilterSelectOption;

type ClothingFiltersProps = {
    filters: ClothingFilters;
    setFilters: Dispatch<SetStateAction<ClothingFilters>>;
    seasonOptions: OptionInput[];
    styleOptions: OptionInput[];
    typeOptions: OptionInput[];
    colorOptions: OptionInput[];
    showRoomFilter?: boolean;
    roomOptions?: OptionInput[];
};

function toOption(option: OptionInput): FilterSelectOption {
    if (typeof option === "string") {
        return { value: option, label: option };
    }
    return option;
}

function normalizeOptions(options: OptionInput[]) {
    return options
        .map(toOption)
        .filter((option) => option.value && option.value !== "all");
}

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
    const toSelectedOptions = (selectedValues: string[] | undefined, options: FilterSelectOption[]) =>
        options.filter((option) => (selectedValues ?? []).includes(option.value));

    const toFilterValues = (selected: MultiValue<FilterSelectOption>) => selected.map((option) => option.value);

    const roomSelectOptions = normalizeOptions(roomOptions);
    const seasonSelectOptions = normalizeOptions(seasonOptions);
    const styleSelectOptions = normalizeOptions(styleOptions);
    const typeSelectOptions = normalizeOptions(typeOptions);
    const colorSelectOptions = normalizeOptions(colorOptions);

    const selectStyles: StylesConfig<FilterSelectOption, true> = {
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

    const formatColorOptionLabel = (option: FilterSelectOption) => {
        const colorName = colorHexToName(option.value);
        return (
            <span className="flex items-center gap-2">
                <span className="inline-block h-5 w-5 rounded border border-black" style={{ backgroundColor: option.value }} />
                <span>{colorName || option.label}</span>
            </span>
        );
    };

    const clearFilters = () => {
        setFilters((prev) => ({
            ...prev,
            room: [],
            season: [],
            style: [],
            type: [],
            color: [],
        }));
    };

    return (
        <div className="grid gap-3">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold leading-none">篩選衣服</h2>
                <button type="button" onClick={clearFilters} className="btn btn-sm rounded-lg bg-white text-black">
                    清除
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {showRoomFilter ? (
                    <div className="space-y-1">
                        <label className="block text-lg leading-none">選擇衣櫃</label>
                        <Select
                            instanceId="room-filter-select"
                            isMulti
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            options={roomSelectOptions}
                            value={toSelectedOptions(filters.room, roomSelectOptions)}
                            onChange={(selected) => setFilters((prev) => ({ ...prev, room: toFilterValues(selected) }))}
                            placeholder="選擇要從哪個衣櫃挑"
                            styles={selectStyles}
                            noOptionsMessage={() => "沒有選項"}
                        />
                    </div>
                ) : null}

                <div className="space-y-1">
                    <label className="block text-lg leading-none">類型</label>
                    <Select
                        instanceId="type-filter-select"
                        isMulti
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        options={typeSelectOptions}
                        value={toSelectedOptions(filters.type, typeSelectOptions)}
                        onChange={(selected) => setFilters((prev) => ({ ...prev, type: toFilterValues(selected) }))}
                        placeholder="全部類型"
                        styles={selectStyles}
                        noOptionsMessage={() => "沒有選項"}
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-lg leading-none">季節</label>
                    <Select
                        instanceId="season-filter-select"
                        isMulti
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        options={seasonSelectOptions}
                        value={toSelectedOptions(filters.season, seasonSelectOptions)}
                        onChange={(selected) => setFilters((prev) => ({ ...prev, season: toFilterValues(selected) }))}
                        placeholder="全部季節"
                        styles={selectStyles}
                        noOptionsMessage={() => "沒有選項"}
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-lg leading-none">風格</label>
                    <Select
                        instanceId="style-filter-select"
                        isMulti
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        options={styleSelectOptions}
                        value={toSelectedOptions(filters.style, styleSelectOptions)}
                        onChange={(selected) => setFilters((prev) => ({ ...prev, style: toFilterValues(selected) }))}
                        placeholder="全部風格"
                        styles={selectStyles}
                        noOptionsMessage={() => "沒有選項"}
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-lg leading-none">顏色</label>
                    <Select
                        instanceId="color-filter-select"
                        isMulti
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        options={colorSelectOptions}
                        value={toSelectedOptions(filters.color, colorSelectOptions)}
                        onChange={(selected) => setFilters((prev) => ({ ...prev, color: toFilterValues(selected) }))}
                        placeholder="全部顏色"
                        styles={selectStyles}
                        noOptionsMessage={() => "沒有選項"}
                        formatOptionLabel={formatColorOptionLabel}
                    />
                </div>
            </div>
        </div>
    );
}

