"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PaperCard from "@/components/PaperCard";
import Polaroid from "@/components/Polaroid";
import EmbossButton from "@/components/EmbossButton";
import { db } from "@/lib/db";
import { useObjectUrl } from "@/lib/useObjectUrl";
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

export default function PhotoPage() {
  const r = useRouter();
  const sp = useSearchParams();
  const mid = sp.get("mid");

  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!mid) r.replace("/home");
  }, [mid, r]);

  const preview = useObjectUrl(file);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    // Cho phép chọn lại cùng 1 file cũng trigger onChange
    e.target.value = "";
  };

  const onSave = async () => {
    if (!mid || !file) return;
    await db.memories.update(mid, { photoBlob: file });
    r.replace(`/memory/${mid}`);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-sm font-semibold">Chọn ảnh kỷ vật</div>

      {/*
        Đừng rely vào UI mặc định của <input type=file> vì global CSS reset có thể
        làm nó “biến mất”/khó nhìn trên một số browser. Dùng nút styled để bấm chọn.
      */}
      <input ref={fileRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPick}
        className="hidden"
      />

      <PaperCard className="space-y-3">
        <Polaroid
          src={preview ?? undefined}
          caption={file ? "Xem trước" : "Chưa chọn ảnh"}
        />

        <div className="grid grid-cols-2 gap-2">
          <EmbossButton variant="secondary" onClick={() => cameraRef.current?.click()}>
            Chụp ảnh
          </EmbossButton>
          <EmbossButton onClick={() => fileRef.current?.click()}>
            Chọn từ máy
          </EmbossButton>
        </div>

        <div className="flex gap-2">
          <EmbossButton className="flex-1" disabled={!file} onClick={onSave}>
            Lưu
          </EmbossButton>
          <EmbossButton variant="secondary" className="flex-1" onClick={() => r.back()}>
            Quay lại
          </EmbossButton>
        </div>

        <div className="text-xs text-black/60">
          Bạn có thể bỏ qua, ảnh có thể đổi lại sau.
        </div>

        <EmbossButton
          variant="secondary"
          className="w-full text-[var(--muted)]"
          onClick={() => r.replace(`/memory/${mid}`)}
        >
          Bỏ qua
        </EmbossButton>
      </PaperCard>
    </div>
  );
}
