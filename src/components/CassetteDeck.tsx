"use client";

import { cn } from "@/lib/cn";

export default function CassetteDeck({
  title,
  subtitle,
  time,
  spinning = false,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  time: string;
  spinning?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("deck rounded-[26px] p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="px-3 py-1 rounded-xl label-tape text-white/85 text-[11px] font-semibold">
          {title}
        </div>
        <div className="text-[11px] text-white/55">TAK-01</div>
      </div>

      {subtitle ? (
        <div className="mt-2 text-[12px] text-white/70">
          <span className="serif">{subtitle}</span>
        </div>
      ) : null}

      {/* window */}
      <div className="deck-window mt-3 rounded-[22px] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-[74px] h-[74px] rounded-full reel">
            <div className={cn("absolute inset-0 rounded-full", spinning && "spin")} />
          </div>

          <div className="flex-1 text-center">
            <div className="kbd text-4xl font-semibold text-white">{time}</div>
            <div className="mt-1 text-[11px] text-white/55">RECORDER / NOTEBOOK EDITION</div>
          </div>

          <div className="relative w-[74px] h-[74px] rounded-full reel">
            <div className={cn("absolute inset-0 rounded-full", spinning && "spin")} />
          </div>
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </div>
  );
}
