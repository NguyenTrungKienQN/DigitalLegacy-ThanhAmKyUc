"use client";

import Header from "@/components/Header";
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
import PaperCard from "@/components/PaperCard";
import EmbossButton from "@/components/EmbossButton";
import Player from "@/components/Player";
import { useDraftStore } from "@/lib/draftStore";
import { db } from "@/lib/db";
import { uuid } from "@/lib/format";
import { useRouter } from "next/navigation";

export default function ReviewPage() {
  const r = useRouter();
  const { draft, setNote, setSavedId, reset } = useDraftStore();

  const audioBlob = draft.audioBlob;
  const audioMime = draft.audioMime || "audio/webm";
  const durationMs = draft.durationMs || 0;

  if (!audioBlob) {
    return (
      <div className="min-h-full">
        <Header title="Nghe thử" />
        <div className="px-4 py-5">
          <PaperCard>
            <div className="text-sm">Chưa có bản ghi.</div>
            <EmbossButton className="mt-3 w-full" onClick={() => r.replace("/record")}>
              Quay lại ghi
            </EmbossButton>
          </PaperCard>
        </div>
      </div>
    );
  }

  const save = async () => {
    const id = uuid();
    await db.memories.add({
      id,
      title: draft.title,
      narrator: draft.narrator,
      tags: draft.tags || [],
      note: draft.note,
      createdAt: Date.now(),
      durationMs,
      audioMime,
      audioBlob,
      version: 1
    });
    setSavedId(id);
    r.replace(`/photo?mid=${encodeURIComponent(id)}`);
  };

  const rerecord = () => {
    if (!confirm("Ghi lại từ đầu? Bản ghi hiện tại sẽ mất.")) return;
    reset();
    r.replace("/create");
  };

  return (
    <div className="min-h-full">
      <Header title="Nghe thử" />
      <div className="px-4 py-5 space-y-4">
        <PaperCard>
          <div className="font-semibold">{draft.title}</div>
          <div className="text-xs text-[var(--muted)]">{draft.narrator}</div>

          <div className="mt-4">
            {/*
              MediaRecorder (đặc biệt webm/opus) đôi khi trả về audio.duration = Infinity/NaN
              khi load metadata, làm thời lượng đích bị kẹt 00:00. durationMs đã được đo
              trong lúc ghi, nên truyền vào để hiển thị ổn định.
            */}
            <Player blob={audioBlob} mime={audioMime} knownDurationMs={durationMs} />
          </div>

          <div className="mt-4 text-xs text-[var(--muted)]">Ghi chú (tuỳ chọn)</div>
          <textarea
            className="mt-1 w-full rounded-xl px-3 py-3 bg-white/60 border border-black/10 text-sm"
            rows={4}
            placeholder="Bối cảnh, năm nào, địa điểm…"
            value={draft.note || ""}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="mt-4 flex gap-2">
            <EmbossButton className="flex-1" onClick={save}>Lưu ký ức</EmbossButton>
            <EmbossButton variant="secondary" className="flex-1" onClick={rerecord}>Ghi lại</EmbossButton>
          </div>
        </PaperCard>
      </div>
    </div>
  );
}
