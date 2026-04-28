import Image from "next/image";
import { FiX } from "react-icons/fi";

type CreateItemCardProps = {
  name: string;
  onNameChange: (value: string) => void;
  style: string;
  onStyleChange: (value: string) => void;
  season: string;
  onSeasonChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  color: [string, string, string];
  imageUrl: string;
  imageAlt?: string;
  styleOptions: string[];
  seasonOptions: string[];
  typeOptions: string[];
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

export default function CreateItemCard({
  name,
  onNameChange,
  style,
  onStyleChange,
  season,
  onSeasonChange,
  type,
  onTypeChange,
  color,
  imageUrl,
  imageAlt,
  styleOptions,
  seasonOptions,
  typeOptions,
}: CreateItemCardProps) {
  const colorSlots = color.map((slotColor) => normalizeColor(slotColor));

  return (
    <div className="card w-full rounded-4xl bg-base-300 p-5 shadow-sm">
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-3xl bg-base-100">
        <Image
          src={imageUrl}
          alt={imageAlt ?? name}
          fill
          sizes="(max-width: 768px) 70vw, 360px"
          className="object-cover"
        />
      </div>

      <div className="mb-4 flex items-center justify-center gap-3">
        <input
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className="input h-11 min-h-0 w-full max-w-48 rounded-xl border-2 border-black bg-base-100 text-center text-2xl font-medium text-black"
          aria-label="衣服名稱"
        />

        <div className="inline-flex overflow-hidden rounded-2xl border-2 border-black bg-base-100">
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
      </div>

      <div className="grid grid-cols-3 gap-2">
        <select
          value={style}
          onChange={(event) => onStyleChange(event.target.value)}
          className="select h-11 min-h-0 w-full rounded-xl border-0 bg-base-100 text-center text-lg font-medium"
          aria-label="風格"
        >
          {styleOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={season}
          onChange={(event) => onSeasonChange(event.target.value)}
          className="select h-11 min-h-0 w-full rounded-xl border-0 bg-base-100 text-center text-lg font-medium"
          aria-label="季節"
        >
          {seasonOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(event) => onTypeChange(event.target.value)}
          className="select h-11 min-h-0 w-full rounded-xl border-0 bg-base-100 text-center text-lg font-medium"
          aria-label="類型"
        >
          {typeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
