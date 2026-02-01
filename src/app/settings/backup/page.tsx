"use client";

import Header from "@/components/Header";
import PaperCard from "@/components/PaperCard";
import EmbossButton from "@/components/EmbossButton";
import { db } from "@/lib/db";
import JSZip from "jszip";
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
import { downloadBlob } from "@/lib/download";

export default function BackupPage() {
  const exportAll = async () => {
    const items = await db.memories.toArray();
    const zip = new JSZip();

    const meta = items.map((m) => ({
      id: m.id,
      title: m.title,
      narrator: m.narrator,
      tags: m.tags,
      note: m.note,
      createdAt: m.createdAt,
      durationMs: m.durationMs,
      audioMime: m.audioMime,
      photoMime: m.photoMime,
      version: m.version
    }));

    zip.file("memories.json", JSON.stringify(meta, null, 2));

    const audioDir = zip.folder("audio");
    const photoDir = zip.folder("photos");

    for (const m of items) {
      audioDir?.file(`${m.id}.bin`, m.audioBlob);
      if (m.photoBlob) photoDir?.file(`${m.id}.bin`, m.photoBlob);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, `thanh-am-ky-uc-backup-${Date.now()}.zip`);
  };

  return (
    <div className="min-h-full">
      <Header title="Backup" />
      <div className="px-4 py-5">
        <PaperCard>
          <div className="font-semibold">Tải toàn bộ dữ liệu</div>
          <div className="mt-1 text-xs text-[var(--muted)]">
            Zip gồm: memories.json + audio/ + photos/. Người dùng tự giữ để không sợ mất dữ liệu khi xoá cache.
          </div>
          <EmbossButton className="w-full mt-4" onClick={exportAll}>
            Tải zip backup
          </EmbossButton>
        </PaperCard>
      </div>
    </div>
  );
}
