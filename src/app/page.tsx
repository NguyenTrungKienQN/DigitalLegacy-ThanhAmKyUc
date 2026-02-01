"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { vtReplace } from "@/lib/vt";

export default function Splash() {
  const r = useRouter();

  useEffect(() => {
    const hasOnboarded = localStorage.getItem("tak_hasOnboarded") === "1";
    const target = hasOnboarded ? "/home" : "/onboarding";
    const t = setTimeout(() => vtReplace(r as any, target, "zoom"), 700);
    return () => clearTimeout(t);
  }, [r]);


  return (
    <div className="h-full notebook safe-area flex items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-black/10 btn-emboss flex items-center justify-center">
          <span className="text-2xl">📼</span>
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight" style={{ fontFamily: "ui-serif, Georgia" }}>
          Thanh Âm Ký Ức
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)] italic">“Giữ lại giọng nói, giữ lại thời gian.”</p>
        <div className="mt-6 flex justify-center gap-2 text-lg opacity-70">
          <span>●</span><span>●</span><span>●</span>
        </div>
      </div>
    </div>
  );
}
