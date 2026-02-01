"use client";

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
import Header from "@/components/Header";
import PaperCard from "@/components/PaperCard";
import EmbossButton from "@/components/EmbossButton";
import { useDraftStore } from "@/lib/draftStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

const chips = ["Ấm áp", "Vui", "Xúc động", "Bài học", "Hài hước"];

export default function Create() {
  const r = useRouter();
  const { setMeta, reset } = useDraftStore();
  const [title, setTitle] = useState("");
  const [narrator, setNarrator] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  return (
    <div className="min-h-full">
      <Header title="Ký ức mới" />
      <div className="px-4 py-5">
        <PaperCard>
          <div className="text-xs text-[var(--muted)] mb-1">Tiêu đề</div>
          <input
            className="w-full rounded-xl px-3 py-3 bg-white/60 border border-black/10"
            placeholder="Ví dụ: Chuyện hồi đi bộ đội…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="text-xs text-[var(--muted)] mt-4 mb-1">Người kể</div>
          <input
            className="w-full rounded-xl px-3 py-3 bg-white/60 border border-black/10"
            placeholder="Ví dụ: Ông nội / Mẹ / Bố…"
            value={narrator}
            onChange={(e) => setNarrator(e.target.value)}
          />

          <div className="text-xs text-[var(--muted)] mt-4 mb-2">Cảm xúc (tuỳ chọn)</div>
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => {
              const on = tags.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => setTags((prev) => (on ? prev.filter((x) => x !== c) : [...prev, c]))}
                  className={`px-3 py-2 rounded-full text-xs border ${on ? "bg-black/15 border-black/20" : "bg-white/50 border-black/10"}`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <EmbossButton
              className="w-full"
              onClick={() => {
                if (!title.trim() || !narrator.trim()) {
                  alert("Bạn nhập Tiêu đề và Người kể trước nhé.");
                  return;
                }
                reset();
                setMeta({ title: title.trim(), narrator: narrator.trim(), tags });
                r.push("/record");
              }}
            >
              Bắt đầu ghi âm
            </EmbossButton>
            <div className="mt-2 text-[11px] text-[var(--muted)]">
              App sẽ xin quyền micro khi bạn bấm REC.
            </div>
          </div>
        </PaperCard>
      </div>
    </div>
  );
}
