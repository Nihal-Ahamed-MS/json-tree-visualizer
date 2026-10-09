import { DotsSixVerticalIcon } from "@phosphor-icons/react";
import { DividerProps } from "react-split-pane";

export function SplitDivider({ onPointerDown, onKeyDown, isDragging }: DividerProps) {
    return (
        <div
            onPointerDown={onPointerDown}
            onKeyDown={onKeyDown}
            className={`relative flex w-1 cursor-col-resize flex-col items-center justify-center bg-stone-800 transition-colors ${isDragging ? "bg-stone-500" : "hover:bg-stone-500/60"}`}
        >
            <div className={`flex flex-col items-center justify-center rounded bg-stone-700 px-0.5 py-1 transition-colors ${isDragging ? "bg-stone-600" : "group-stone:bg-zinc-600"}`}>
                <DotsSixVerticalIcon size={12} className={isDragging ? "text-white" : "text-zinc-400"} />
            </div>
        </div>
    );
}