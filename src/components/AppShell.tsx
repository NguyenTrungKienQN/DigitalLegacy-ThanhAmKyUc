"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import TabBar from "./TabBar";
import { cn } from "@/lib/cn";
import { notifyRouteChanged } from "@/lib/vt";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const p = usePathname();

  // ✅ Tabbar hiện mọi trang trừ Splash "/" và Onboarding
  const showTab = p !== "/" && !p.startsWith("/onboarding");

  // ✅ báo cho ViewTransition biết: route đã đổi thật
  useEffect(() => {
    notifyRouteChanged();
  }, [p]);

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
          if (delta > 0 && st > HIDE_AFTER) setTabHidden(true); // cuộn xuống
          else if (delta < 0) setTabHidden(false); // cuộn lên

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
        "min-h-dvh w-full flex items-center justify-center p-3 md:p-6",
        "bg-[radial-gradient(1200px_700px_at_50%_0%,rgba(255,255,255,.10),transparent_60%),linear-gradient(180deg,#2a231d_0%,#15110d_100%)]"
      )}
    >
      <div
        className={cn(
          "w-full max-w-[440px] h-dvh md:h-[min(92vh,900px)] overflow-hidden",
          "md:rounded-[40px] md:border md:border-white/10 md:shadow-[0_28px_90px_rgba(0,0,0,.6)]",
          "bg-black/10 backdrop-blur-[10px]"
        )}
      >
        {/* ✅ nền giấy cho cả vùng, để tabbar không bị “đen xì” */}
        <div className="h-full flex flex-col paper-bg grain safe-area">
          {/* ✅ Scroll area */}
          <div
            ref={scrollRef}
            className={cn(
              "flex-1 overflow-y-auto hide-scrollbar overscroll-none",
              showTab && "pb-[calc(env(safe-area-inset-bottom)+96px)]"
            )}
          >
            {/* ✅ 1 screen duy nhất cho View Transition */}
            <main style={{ viewTransitionName: "screen" }} className="min-h-full">
              {children}
            </main>
          </div>

          {/* ✅ TabBar ngoài scroll */}
          {showTab ? <TabBar hidden={tabHidden} /> : null}
        </div>
      </div>
    </div>
  );
}
