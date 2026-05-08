import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiCheck, FiPlus, FiX } from "react-icons/fi";

type ItemCardProps = {
    itemId?: number | string;
    name: string;
    color: [string, string, string];
    season: string[];
    type: string;
    style: string | string[];
    imageUrl: string;
    imageAlt?: string;
    editable?: boolean;
    selected?: boolean;
    onSelectToggle?: () => void;
    detailPath?: string;
};

function normalizeColor(input: string) {
    if (input === "none") {
        return null;
    }

    const value = input.trim();
    const withHash = value.startsWith("#") ? value : `#${value}`;
    const isValidHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(withHash);
    return isValidHex ? withHash : null;
}

function normalizeList(value: string | string[]) {
    return Array.isArray(value) ? value : [value];
}

export default function ItemCard({
    itemId,
    name,
    color,
    season,
    type,
    style,
    imageUrl,
    imageAlt,
    editable = false,
    selected = false,
    onSelectToggle,
    detailPath = "/myWardrobe/1-4",
}: ItemCardProps) {
    const router = useRouter();
    const colorSlots = color.map((slotColor) => normalizeColor(slotColor));
    const styles = normalizeList(style);
    const normalizedItemId = Number(itemId);
    const canNavigateToDetail = !editable && Number.isFinite(normalizedItemId) && normalizedItemId > 0;
    const canToggleSelection = editable && typeof onSelectToggle === "function";

    function handleCardClick() {
        if (canToggleSelection) {
            onSelectToggle();
            return;
        }

        if (!canNavigateToDetail) {
            return;
        }

        router.push(`${detailPath}?id=${normalizedItemId}`);
    }

    return (
        <div
            className={`relative w-full h-full card shadow-sm bg-base-200 ${selected ? "ring-2 ring-black" : ""} ${canNavigateToDetail || canToggleSelection ? "cursor-pointer" : ""}`}
            onClick={handleCardClick}
            role={canNavigateToDetail || canToggleSelection ? "button" : undefined}
            tabIndex={canNavigateToDetail || canToggleSelection ? 0 : undefined}
            onKeyDown={(event) => {
                if (!canNavigateToDetail && !canToggleSelection) return;
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleCardClick();
                }
            }}
        >
            {editable && onSelectToggle ? (
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onSelectToggle();
                    }}
                    className={`absolute -right-2 -top-2 z-10 grid h-8 w-8 place-items-center rounded-full border-2 border-black bg-white ${selected ? "text-black" : "text-black"}`}
                    aria-label={selected ? "取消選取" : "選取衣服"}
                >
                    {selected ? <FiCheck className="text-xl" /> : <FiPlus className="text-xl" />}
                </button>
            ) : null}
            <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md">
                <Image
                    src={imageUrl}
                    alt={imageAlt ?? name}
                    fill
                    sizes="(max-width: 768px) 70vw, 320px"
                    className="object-cover"
                />
            </div>
            <div className="flex flex-col items-center justify-center gap-2 px-2">
                <div className="flex items-center justify-center text-md leading-none ">
                    <div>{name}</div>
                </div>

                <div className="flex flex-row items-center justify-around text-sm w-full">
                    <div className="inline-flex overflow-hidden rounded-2xl border-2 border-black">
                        {colorSlots.map((slotColor, index) => (
                            <span
                                key={`${name}-color-${index}`}
                                aria-label={slotColor ? `color ${slotColor}` : "none color slot"}
                                title={slotColor ?? "none"}
                                className={`grid h-5 w-5 place-items-center border-l-2 border-black first:border-l-0 ${slotColor ? "" : "bg-white"}`}
                                style={slotColor ? { backgroundColor: slotColor } : undefined}
                            >
                                {slotColor ? null : <FiX className="text-[10px] text-black" />}
                            </span>
                        ))}
                    </div>
                    <div>{styles || "-"}</div>
                </div>
                <div className="flex flex-row items-center justify-around   text-sm w-full">
                    <div>{season || "-"}</div>
                    <div>{type || "-"}</div>
                </div>
            </div>
        </div>
    );
}
