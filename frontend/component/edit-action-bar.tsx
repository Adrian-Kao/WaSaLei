import { FiMove, FiPlus, FiTrash2 } from "react-icons/fi";

type EditActionBarProps = {
    selectedCount: number;
    onAdd: () => void;
    onDelete: () => void;
    onMove: () => void;
};

export default function EditActionBar({ selectedCount, onAdd, onDelete, onMove }: EditActionBarProps) {
    const isBatchActionDisabled = selectedCount === 0;

    return (
        <div className="mt-4 grid grid-cols-3 gap-2">
            <button
                type="button"
                onClick={onAdd}
                className="btn btn-neutral h-14 min-h-0 w-full rounded-xl px-5 text-2xl font-medium"
                aria-label="新增衣服"
                title="新增衣服"
            >
                <FiPlus className="shrink-0" />
            </button>

            <button
                type="button"
                onClick={onDelete}
                disabled={isBatchActionDisabled}
                className="btn btn-neutral h-14 min-h-0 w-full rounded-xl px-0 text-2xl font-medium [&>svg]:h-8! [&>svg]:w-8!"
                aria-label="刪除已選衣服"
                title="刪除已選衣服"
            >
                <FiTrash2 className="shrink-0" />
            </button>

            <button
                type="button"
                onClick={onMove}
                disabled={isBatchActionDisabled}
                className="btn btn-neutral h-14 min-h-0 w-full rounded-xl px-5 text-2xl font-medium [&>svg]:h-8! [&>svg]:w-8!"
                aria-label="移動已選衣服"
                title="移動已選衣服"
            >
                <FiMove className="shrink-0" />
            </button>
        </div>
    );
}