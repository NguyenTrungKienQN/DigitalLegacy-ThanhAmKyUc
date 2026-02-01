"use client";

import VTLink from "@/components/VTLink";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BookOpenText, NotebookPen, Settings } from "lucide-react";

const items = [
  { href: "/home", label: "Sổ", Icon: BookOpenText },
  { href: "/journal", label: "Nhật ký", Icon: NotebookPen },
  { href: "/settings", label: "Cài đặt", Icon: Settings },
];

export default function TabBar({ hidden = false }: { hidden?: boolean }) {
  const p = usePathname();

  return (
    <div
      className={cn(
        "z-[60] pb-[calc(env(safe-area-inset-bottom)+12px)]",
        "transition-transform transition-opacity duration-200 ease-out will-change-transform",
        hidden
          ? "translate-y-[110%] opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      )}
    >
      <div className="mx-4 mb-3 rounded-2xl bg-white/35 backdrop-blur border border-black/10 shadow-[0_16px_40px_rgba(0,0,0,.18)] overflow-hidden">
        <div className="grid grid-cols-3">
          {items.map((it, idx) => {
            const active = p === it.href || p.startsWith(it.href + "/");
            const Icon = it.Icon;

            return (
              <VTLink
                key={it.href}
                href={it.href}
                className={cn(
                  "py-2.5 text-center text-[11px] font-semibold relative select-none",
                  active ? "text-[var(--ink)]" : "text-black/45",
                  idx !== items.length - 1 && "border-r border-black/10"
                )}
                aria-label={it.label}
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <Icon
                    className={cn("h-4 w-4", active ? "text-[var(--ink)]" : "text-black/45")}
                    strokeWidth={2.3}
                  />
                  <span
                    className={cn(
                      "serif leading-none",
                      active && "underline decoration-[color:var(--margin)] decoration-2 underline-offset-4"
                    )}
                  >
                    {it.label}
                  </span>
                </div>
              </VTLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
