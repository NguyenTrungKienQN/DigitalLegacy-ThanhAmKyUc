"use client";

import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Settings,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  CassetteTape,
  Image as ImageIcon,
} from "lucide-react";

export default function Header({
  title,
  right,
  back = true,
  subtle = false,
}: {
  title: string;
  right?: React.ReactNode;
  back?: boolean;
  subtle?: boolean;
}) {
  const r = useRouter();

  return (
    <div
      className={cn(
        "sticky top-0 z-30",
        subtle
          ? "bg-transparent"
          : "bg-white/35 backdrop-blur-md border-b border-black/10"
      )}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        {back ? (
          <button
            onClick={() => r.back()}
            className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center",
              subtle ? "bg-white/20" : "bg-black/10",
              "btn-emboss"
            )}
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.3} />
          </button>
        ) : (
          <div className="w-11 h-11" />
        )}

        <div className="flex-1 text-center">
          <div className="text-[15px] font-semibold tracking-tight" style={{ fontFamily: "ui-serif, Georgia" }}>
            {title}
          </div>
        </div>

        <div className="w-11 h-11 flex items-center justify-center">
          {right ? right : <div />}
        </div>
      </div>
    </div>
  );
}
