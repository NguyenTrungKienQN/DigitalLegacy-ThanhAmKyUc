"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import PaperCard from "@/components/PaperCard";
import EmbossButton from "@/components/EmbossButton";
import { db } from "@/lib/db";
import { Camera, Image as ImageIcon, X } from "lucide-react";

function useObjectUrls(blobs: Blob[]) {
  return useMemo(() => blobs.map((b) => URL.createObjectURL(b)), [blobs]);
}

export default function JournalNewPage() {
  const r = useRouter();

  const pickRef = useRef<HTMLInputElement | null>(null);
  const camRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<Blob[]>([]);
  const urls = useObjectUrls(photos);

  // cleanup blob URLs (đừng leak)
  useEffect(() => {
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [urls]);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const arr = Array.from(files);

    const max = 6;
    const remain = Math.max(0, max - photos.length);
    const picked = arr.slice(0, remain);

    setPhotos((p) => [...p, ...picked]);
  };

  const save = async () => {
    const now = Date.now();
    const id = crypto.randomUUID();
    const entry = {
      id,
      title: title.trim() || undefined,
      content: content.trim(),
      photos,
      createdAt: now,
      updatedAt: now,
    };

    if (!entry.content) return;

    await db.journals.put(entry as any);
    r.replace(`/journal/${id}`);
  };

  return (
    <div className="min-h-full">
      <Header title="Viết nhật ký" />

      <div className="px-4 py-5 pb-28">
        <PaperCard>
          <div className="text-sm font-semibold serif">Tiêu đề (tuỳ chọn)</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Một ngày mưa..."
            className="mt-2 w-full rounded-2xl px-4 py-3 bg-white/40 border border-black/10 outline-none"
          />

          <div className="mt-4 text-sm font-semibold serif">Nội dung</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Hôm nay mình đã..."
            className="mt-2 w-full min-h-[180px] rounded-2xl px-4 py-3 bg-white/40 border border-black/10 outline-none whitespace-pre-wrap"
          />

          {/* Hidden inputs */}
          <input
            ref={camRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <input
            ref={pickRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />

          <div className="mt-4 flex gap-2">
            <EmbossButton
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => camRef.current?.click()}
            >
              <span className="inline-flex items-center gap-2 justify-center">
                <Camera className="h-4 w-4" strokeWidth={2.3} />
                Chụp ảnh
              </span>
            </EmbossButton>

            <EmbossButton
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => pickRef.current?.click()}
            >
              <span className="inline-flex items-center gap-2 justify-center">
                <ImageIcon className="h-4 w-4" strokeWidth={2.3} />
                Chọn ảnh
              </span>
            </EmbossButton>
          </div>

          {/* Preview grid */}
          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {urls.map((u, idx) => (
                <div
                  key={u}
                  className="relative rounded-2xl overflow-hidden border border-black/10 bg-white/50 shadow-[0_10px_26px_rgba(0,0,0,.10)]"
                >
                  <img src={u} alt={`photo-${idx}`} className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => p.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-black/40 text-white grid place-items-center"
                    aria-label="Xoá ảnh"
                  >
                    <X className="h-4 w-4" strokeWidth={2.6} />
                  </button>
                  <div className="p-2 text-[11px] text-[var(--muted)] serif">
                    Kỷ vật #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <EmbossButton type="button" variant="secondary" className="flex-1" onClick={() => r.back()}>
              Huỷ
            </EmbossButton>
            <EmbossButton type="button" className="flex-1" onClick={save} disabled={!content.trim()}>
              Lưu
            </EmbossButton>
          </div>
        </PaperCard>
      </div>
    </div>
  );
}
