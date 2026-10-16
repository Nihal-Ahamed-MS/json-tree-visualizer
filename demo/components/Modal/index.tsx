"use client";

import type { ReactNode } from "react";
import { Dialog } from "radix-ui";
import { XIcon } from "@phosphor-icons/react";

type ModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    headerActions?: ReactNode;
    children?: ReactNode;
};

const Modal = ({ open, onOpenChange, title, headerActions, children }: ModalProps) => (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <Dialog.Content
                aria-describedby={undefined}
                className="fixed top-1/2 left-1/2 z-50 flex h-[min(600px,85vh)] w-[calc(100%-32px)] max-w-md -translate-x-1/2 flex-col -translate-y-1/2 rounded-lg border border-zinc-800 bg-[#111111] text-zinc-50 shadow-xl focus:outline-none"
            >
                <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-3">
                    <Dialog.Title className="text-sm font-semibold">{title}</Dialog.Title>
                    <div className="flex items-center gap-2">
                        {headerActions}
                        <Dialog.Close
                            className="cursor-pointer rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                            aria-label="Close"
                        >
                            <XIcon size={14} />
                        </Dialog.Close>
                    </div>
                </div>
                <div className="flex min-h-0 flex-1 flex-col text-sm text-zinc-300">{children}</div>
            </Dialog.Content>
        </Dialog.Portal>
    </Dialog.Root>
);

export default Modal;
