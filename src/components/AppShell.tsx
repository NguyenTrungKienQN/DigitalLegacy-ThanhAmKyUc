"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import TabBar from "./TabBar";
import { cn } from "@/lib/cn";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const p = usePathname();

  const showTab =
    p.startsWith("/home") || p.startsWith("/journal") || p.startsWith("/settings") || p.startsWith("/search");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastTopRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [tabHidden, setTabHidden] = useState(false);

  useEffect(() => {
    if (!showTab) return;

    const el = scrollRef.current;
    if (!el) return;

    const SHOW_AT_TOP = 8;
    const HIDE_AFTER = 24;
    const THRESHOLD = 10;

    const onScroll = () => {
      const st = el.scrollTop;

      if (st <= SHOW_AT_TOP) {
        setTabHidden(false);
        lastTopRef.current = st;
        return;
      }

      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const last = lastTopRef.current;
        const delta = st - last;

        if (Math.abs(delta) >= THRESHOLD) {
          if (delta > 0 && st > HIDE_AFTER) setTabHidden(true);
          else if (delta < 0) setTabHidden(false);
          lastTopRef.current = st;
        }

        rafRef.current = null;
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [showTab]);

  return (
    <div
      className={cn(
        "min-h-dvh w-full",
        // ✅ Mobile: nền paper full màn hình (không viền)
        "paper-bg",
        // ✅ Desktop: mới có nền tối + canh giữa + padding
        "md:flex md:items-center md:justify-center md:p-6",
        "md:bg-[radial-gradient(1200px_700px_at_50%_0%,rgba(255,255,255,.10),transparent_60%),linear-gradient(180deg,#2a231d_0%,#15110d_100%)]"
      )}
    >
      <div
        className={cn(
          // ✅ Mobile: full màn hình luôn
          "w-full h-dvh overflow-hidden",
          // ✅ Desktop: giả lập phone frame
          "md:max-w-[440px] md:h-[min(92vh,900px)] md:rounded-[40px]",
          "md:border md:border-white/10 md:shadow-[0_28px_90px_rgba(0,0,0,.6)]",
          "md:bg-black/10 md:backdrop-blur-[10px]"
        )}
      >
        <div className="h-full flex flex-col paper-bg grain safe-area">
          <div
            ref={scrollRef}
            className={cn(
              "flex-1 overflow-y-auto hide-scrollbar overscroll-none",
              "paper-bg grain safe-area",
              // chừa chỗ cho tabbar khi tab hiện
              showTab && "pb-[calc(env(safe-area-inset-bottom)+96px)]"
            )}
          >
            {children}
          </div>

          {showTab ? <TabBar hidden={tabHidden} /> : null}
        </div>
      </div>
    </div>
  );
}
