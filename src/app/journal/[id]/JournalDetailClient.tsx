"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import PaperCard from "@/components/PaperCard";
import EmbossButton from "@/components/EmbossButton";
import VTLink from "@/components/VTLink";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Camera, Image as ImageIcon, Trash2, X } from "lucide-react";

function fmt(ts: number) {
  return new Date(ts).toLocaleString("vi-VN", { hour12: false });
}

function useObjectUrls(blobs: Blob[]) {
  return useMemo(() => blobs.map((b) => URL.createObjectURL(b)), [blobs]);
}

export default function JournalDetailClient({ id }: { id: string }) {
  const r = useRouter();
  const entry = useLiveQuery(() => db.journals.get(id), [id]);

  const camRef = useRef<HTMLInputElement | null>(null);
  const pickRef = useRef<HTMLInputElement | null>(null);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<Blob[]>([]);

  const resetFromEntry = () => {
    if (!entry) return;
    setTitle(entry.title ?? "");
    setContent(entry.content ?? "");
    setPhotos(entry.photos ?? []);
  };

  useEffect(() => {
    if (!entry) return;
    resetFromEntry();
    setEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);

  const urls = useObjectUrls(photos);

  // ✅ cleanup đúng cách (useEffect, không phải useMemo)
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
    if (!entry) return;
    const now = Date.now();
    await db.journals.put({
      ...entry,
      title: title.trim() || undefined,
      content: content.trim(),
      photos,
      updatedAt: now,
    } as any);
    setEditing(false);
  };

  const del = async () => {
    if (!confirm("Xoá nhật ký này? Ảnh đính kèm cũng sẽ bị xoá khỏi thiết bị.")) return;
    await db.journals.delete(id);
    r.replace("/journal");
  };

  if (entry === undefined) {
    return (
      <div className="min-h-full">
        <Header title="Nhật ký" />
        <div className="px-4 py-6">
          <PaperCard>Đang tải…</PaperCard>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-full">
        <Header title="Nhật ký" />
        <div className="px-4 py-6">
          <PaperCard>
            <div className="text-sm font-semibold serif">Không tìm thấy nhật ký</div>
            <div className="mt-3">
              <VTLink href="/journal">
                <EmbossButton variant="secondary">Về timeline</EmbossButton>
              </VTLink>
            </div>
          </PaperCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <Header title="Nhật ký" />

      <div className="px-4 py-5 pb-28">
        <PaperCard>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold serif">{entry.title?.trim() || "Nhật ký"}</div>
              <div className="mt-1 text-xs text-[var(--muted)]">
                {fmt(entry.createdAt)}
                {entry.updatedAt !== entry.createdAt ? ` • sửa ${fmt(entry.updatedAt)}` : ""}
              </div>
            </div>
            <button
              type="button"
              onClick={del}
              className="w-10 h-10 rounded-2xl bg-black/10 btn-emboss grid place-items-center"
              aria-label="Xoá"
              title="Xoá"
            >
              <Trash2 className="h-5 w-5" strokeWidth={2.3} />
            </button>
          </div>

          {!editing ? (
            <>
              <div className="mt-3 text-sm whitespace-pre-wrap">{entry.content}</div>

              {entry.photos?.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {urls.map((u, idx) => (
                    <div
                      key={u}
                      className="rounded-2xl overflow-hidden border border-black/10 bg-white/50 shadow-[0_10px_26px_rgba(0,0,0,.10)]"
                    >
                      <img src={u} alt={`photo-${idx}`} className="w-full h-32 object-cover" />
                      <div className="p-2 text-[11px] text-[var(--muted)] serif">Kỷ vật #{idx + 1}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 flex gap-2">
                <EmbossButton type="button" variant="secondary" className="flex-1" onClick={() => r.back()}>
                  Quay lại
                </EmbossButton>
                <EmbossButton
                  type="button"
                  className="flex-1"
                  onClick={() => {
                    resetFromEntry();
                    setEditing(true);
                  }}
                >
                  Sửa
                </EmbossButton>
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 text-sm font-semibold serif">Tiêu đề</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề (tuỳ chọn)"
                className="mt-2 w-full rounded-2xl px-4 py-3 bg-white/40 border border-black/10 outline-none"
              />

              <div className="mt-4 text-sm font-semibold serif">Nội dung</div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-2 w-full min-h-[180px] rounded-2xl px-4 py-3 bg-white/40 border border-black/10 outline-none whitespace-pre-wrap"
              />

              {/* ✅ Hidden inputs + ref click */}
              <input
                ref={camRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.currentTarget.value = "";
                }}
              />
              <input
                ref={pickRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.currentTarget.value = "";
                }}
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
                      <div className="p-2 text-[11px] text-[var(--muted)] serif">Kỷ vật #{idx + 1}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <EmbossButton
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    resetFromEntry();
                    setEditing(false);
                  }}
                >
                  Huỷ
                </EmbossButton>
                <EmbossButton type="button" className="flex-1" onClick={save} disabled={!content.trim()}>
                  Lưu
                </EmbossButton>
              </div>
            </>
          )}
        </PaperCard>
      </div>
    </div>
  );
}
