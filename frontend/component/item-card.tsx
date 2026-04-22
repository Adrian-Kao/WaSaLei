import Image from "next/image";

type ItemCardProps = {
    name: string;
    color: string;
    season: string[];
    type: string;
    style: string | string[];
    imageUrl?: string;
    imageAlt?: string;
};

function normalizeColor(input: string) {
    const value = input.trim();
    const withHash = value.startsWith("#") ? value : `#${value}`;
    const isValidHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(withHash);
    return isValidHex ? withHash : "#9CA3AF";
}

function normalizeList(value: string | string[]) {
    return Array.isArray(value) ? value : [value];
}

export default function ItemCard({
    name,
    color,
    season,
    type,
    style,
    imageUrl,
    imageAlt,
}: ItemCardProps) {
    const colorHex = normalizeColor(color);
    const styles = normalizeList(style);

    return (
        <div className="w-full h-full card shadow-sm bg-base-200">
            <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-2xl">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={imageAlt ?? name}
                        fill
                        sizes="(max-width: 768px) 70vw, 320px"
                        className="object-cover"
                    />
                ) : null}
            </div>

            <div className="mb-2 flex items-center justify-center gap-3 text-2xl leading-none ">
                <span>{name}</span>
                <span
                    aria-label={`color ${colorHex}`}
                    title={colorHex}
                    className="inline-block h-5 w-5 rounded-md border-2 border-black"
                    style={{ backgroundColor: colorHex }}
                />
            </div>

            <div className=" px-2 flex flex-row flex-nowrap items-center justify-center gap-4 whitespace-nowrap text-sm ">
                <span>{styles || "-"}</span>
                <span>{season || "-"}</span>
                <span>{type || "-"}</span>
            </div>
        </div>
    );
}
