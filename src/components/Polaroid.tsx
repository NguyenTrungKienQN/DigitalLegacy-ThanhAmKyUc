"use client";

import { cn } from "@/lib/cn";

export default function Polaroid({
  src,
  caption,
  className = "",
}: {
  src?: string;
  caption?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative bg-white/75 rounded-3xl p-3 shadow-[0_16px_38px_rgba(0,0,0,.22)] border border-black/5", className)}>
      <div className="absolute -top-2 right-6 w-16 h-6 rounded-xl tape rotate-[-6deg]" />
      <div className="rounded-2xl overflow-hidden bg-black/5 aspect-[4/3] flex items-center justify-center">
        {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <div className="text-xs text-black/40">Chưa có ảnh</div>}
      </div>
      <div className="mt-2 text-xs text-[var(--muted)] italic">
        {caption || "— kỷ vật —"}
      </div>
    </div>
  );
}
