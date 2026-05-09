import { FiX } from "react-icons/fi";

type ColorStripProps = {
  colors: (string | null)[];
  showLabel?: boolean;
};

export default function ColorStrip({ colors, showLabel = false }: ColorStripProps) {
  const displayColors = colors.filter((c): c is string => Boolean(c) && c !== "none");

  return (
    <div>
      <div className="inline-flex h-6 w-15 overflow-hidden rounded-2xl border-2 border-black">
        {displayColors.length === 0 ? (
          <span
            className="grid h-full w-full place-items-center bg-white"
            aria-label="none color slot"
            title="none"
          >
            <FiX className="text-[10px] text-black" />
          </span>
        ) : (
          displayColors.map((slotColor, index) => (
            <span
              key={`color-strip-${slotColor}-${index}`}
              aria-label={`color ${slotColor}`}
              title={slotColor}
              className="h-full flex-1 border-l-2 border-black first:border-l-0"
              style={{ backgroundColor: slotColor }}
            />
          ))
        )}
      </div>
      {showLabel && displayColors.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          偵測結果：{displayColors.slice(0, 3).join("、")}
        </div>
      )}
    </div>
  );
}
