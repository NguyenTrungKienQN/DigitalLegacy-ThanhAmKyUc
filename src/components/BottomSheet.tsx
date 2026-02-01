"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/cn";

export default function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50" />
        <Dialog.Content
          className={cn(
            "fixed z-50 left-0 right-0 bottom-0",
            "rounded-t-[28px] bg-white/70 backdrop-blur border-t border-black/10 shadow-[0_-20px_60px_rgba(0,0,0,.35)]",
            "pb-[calc(env(safe-area-inset-bottom)+16px)]"
          )}
        >
          <div className="w-12 h-1.5 bg-black/15 rounded-full mx-auto mt-3" />
          {title ? (
            <div className="px-5 pt-3 text-sm font-semibold" style={{ fontFamily: "ui-serif, Georgia" }}>
              {title}
            </div>
          ) : null}
          <div className="px-5 py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
