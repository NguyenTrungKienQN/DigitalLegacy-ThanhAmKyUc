"use client";

import React, { useState } from "react";
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
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import PaperCard from "@/components/PaperCard";
import EmbossButton from "@/components/EmbossButton";
import Polaroid from "@/components/Polaroid";
import Player from "@/components/Player";
import { useObjectUrl } from "@/lib/useObjectUrl";

export default function MemoryDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const m = useLiveQuery(() => db.memories.get(id), [id]);

  const [title, setTitle] = useState("");
  const [narrator, setNarrator] = useState("");

  const imgUrl = useObjectUrl(m?.photoBlob ?? null);

  if (!m) {
    return (
      <div className="p-4 text-stone-700">
        <div className="opacity-70">Đang tải…</div>
      </div>
    );
  }

  const onDelete = async () => {
    await db.memories.delete(id);
    router.push("/home");
  };

  const onDownloadAudio = () => {
    const url = URL.createObjectURL(m.audioBlob);
    const a = document.createElement("a");
    a.href = url;
    const mt = m.audioMime || "audio/webm";
    const ext = mt.includes("mp4") || mt.includes("aac") ? "m4a" : "webm";
    a.download = `${m.title || "ky-uc"}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const onSaveTitle = async () => {
    const t = title.trim();
    if (!t) return;
    await db.memories.update(id, { title: t });
    setTitle("");
  };

  const onSaveNarrator = async () => {
    const n = narrator.trim();
    if (!n) return;
    await db.memories.update(id, { narrator: n });
    setNarrator("");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <EmbossButton onClick={() => router.back()} aria-label="Quay lại">
          <ChevronLeft className="h-5 w-5" strokeWidth={2.3} />
        </EmbossButton>

        <EmbossButton onClick={() => router.push("/settings")} aria-label="Cài đặt">
          <Settings className="h-5 w-5" strokeWidth={2.3} />
        </EmbossButton>
      </div>

      <PaperCard className="space-y-3">
        <div className="flex items-start gap-3">
          <Polaroid
            src={imgUrl ?? undefined}
            caption={m.title ? `“${m.title}”` : "— kỷ vật —"}
            className="w-[170px] shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold leading-tight break-words">
              {m.title || "Chưa có tiêu đề"}
            </div>
            <div className="text-xs text-stone-600">
              {m.narrator ? `Kể: ${m.narrator}` : "Chưa có người kể"}
            </div>
            <div className="text-xs text-stone-500">
              {new Date(m.createdAt).toLocaleString("vi-VN")}
            </div>
          </div>
        </div>

        <Player blob={m.audioBlob} mime={m.audioMime} knownDurationMs={m.durationMs} />

        <div className="grid grid-cols-2 gap-3">
          <EmbossButton onClick={onSaveTitle} className="w-full">
            Đổi tiêu đề
          </EmbossButton>
          <EmbossButton onClick={onSaveNarrator} className="w-full">
            Đổi người kể
          </EmbossButton>

          <EmbossButton onClick={() => router.push(`/photo?mid=${id}`)} className="w-full">
            Đổi ảnh
          </EmbossButton>
          <EmbossButton onClick={onDownloadAudio} className="w-full">
            Tải audio về
          </EmbossButton>
        </div>

        <div className="space-y-2">
          <input
            className="w-full rounded-xl border border-stone-300 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Tiêu đề mới…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-stone-300 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Người kể…"
            value={narrator}
            onChange={(e) => setNarrator(e.target.value)}
          />
        </div>

        <EmbossButton onClick={onDelete} className="w-full">
          Xoá ký ức
        </EmbossButton>
      </PaperCard>
    </div>
  );
}
