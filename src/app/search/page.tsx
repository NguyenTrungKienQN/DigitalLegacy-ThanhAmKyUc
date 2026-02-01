"use client";

import Header from "@/components/Header";
import PaperCard from "@/components/PaperCard";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
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
import VTLink from "@/components/VTLink";
import { useMemo, useState } from "react";
import { formatDuration } from "@/lib/format";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const all = useLiveQuery(() => db.memories.orderBy("createdAt").reverse().toArray(), []);

  const res = useMemo(() => {
    const s = (q || "").toLowerCase().trim();
    return (all || []).filter((m) => {
      const okQ =
        !s ||
        m.title.toLowerCase().includes(s) ||
        m.narrator.toLowerCase().includes(s);
      const okTag = !tag || (m.tags || []).includes(tag);
      return okQ && okTag;
    });
  }, [all, q, tag]);

  const chips = ["Ấm áp", "Vui", "Xúc động", "Bài học", "Hài hước"];

  return (
    <div className="min-h-full">
      <Header title="Tìm kiếm" />
      <div className="px-4 py-5 space-y-3">
        <input
          className="w-full rounded-2xl px-4 py-3 bg-white/60 border border-black/10"
          placeholder="Tìm theo tiêu đề hoặc người kể…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTag("")}
            className={`px-3 py-2 rounded-full text-xs border ${tag === "" ? "bg-black/15 border-black/20" : "bg-white/50 border-black/10"}`}
          >
            Tất cả
          </button>
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => setTag((v) => (v === c ? "" : c))}
              className={`px-3 py-2 rounded-full text-xs border ${tag === c ? "bg-black/15 border-black/20" : "bg-white/50 border-black/10"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {res.map((m) => (
            <VTLink key={m.id} href={`/memory/${m.id}`} className="block">
              <PaperCard className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{m.title}</div>
                  <div className="text-xs text-[var(--muted)]">{m.narrator} • {formatDuration(m.durationMs)}</div>
                </div>
                <div className="opacity-70">→</div>
              </PaperCard>
            </VTLink>
          ))}
          {res.length === 0 ? (
            <PaperCard>Không có kết quả.</PaperCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
