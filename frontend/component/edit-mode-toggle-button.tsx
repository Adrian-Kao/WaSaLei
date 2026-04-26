import { FiEdit3, FiX } from "react-icons/fi";

type EditModeToggleButtonProps = {
    isEditMode: boolean;
    onToggle: () => void;
};

export default function EditModeToggleButton({ isEditMode, onToggle }: EditModeToggleButtonProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="btn btn-outline grid h-full aspect-square flex-none place-items-center rounded-xl border-2 border-black text-black"
            aria-label={isEditMode ? "結束編輯模式" : "進入編輯模式"}
            title={isEditMode ? "結束編輯模式" : "進入編輯模式"}
        >
            {isEditMode ? <FiX className="text-3xl" /> : <FiEdit3 className="text-3xl" />}
        </button>
    );
}