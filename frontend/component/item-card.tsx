
import { useRouter } from "next/navigation";
import { FiCheck, FiPlus } from "react-icons/fi";
import { useEffect, useState } from "react";
import { normalizeColorToHex } from "@/lib/constants/color-map";
import ColorStrip from "@/component/color-strip";

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
    return normalizeColorToHex(input);
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
    const [imageSrc, setImageSrc] = useState(imageUrl || "/1.webp");
    const colorSlots = color.map((slotColor) => normalizeColor(slotColor));
    const styles = normalizeList(style);
    const normalizedItemId = Number(itemId);
    const canNavigateToDetail = !editable && Number.isFinite(normalizedItemId) && normalizedItemId > 0;
    const canToggleSelection = editable && typeof onSelectToggle === "function";

    useEffect(() => {
        setImageSrc(imageUrl || "/1.webp");
    }, [imageUrl]);

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
                <img
                    src={imageSrc}
                    alt={imageAlt ?? name}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={() => setImageSrc("/1.webp")}
                />
            </div>
            <div className="flex flex-col items-center justify-center gap-2 px-2">
                <div className="flex items-center justify-center text-md leading-none ">
                    <div>{name}</div>
                </div>

                <div className="flex flex-row items-center justify-around text-sm w-full">
                    <ColorStrip colors={colorSlots} />
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
