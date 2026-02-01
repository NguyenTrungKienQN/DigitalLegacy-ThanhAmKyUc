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
import { Search } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Header from "@/components/Header";
import PaperCard from "@/components/PaperCard";
import InstallPrompt from "@/components/InstallPrompt";
import VTLink from "@/components/VTLink";
import { formatDate, formatDuration } from "@/lib/format";
import BlobImage from "@/components/BlobImage";

function Thumb({ blob }: { blob?: Blob }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-black/5 aspect-[4/3]">
      {blob ? <BlobImage blob={blob} className="w-full h-full object-cover" /> : <div className="h-full grid place-items-center text-xs text-black/40">No photo</div>}
    </div>
  );
}

export default function Home() {
  const items = useLiveQuery(() => db.memories.orderBy("createdAt").reverse().toArray(), []);

  return (
    <div className="min-h-full pb-28">
      <Header
        title="Sổ Ký Ức"
        back={false}
        right={
          <VTLink
            href="/search"
            aria-label="Tìm kiếm"
            className="h-10 w-10 grid place-items-center rounded-xl
                      bg-white/70 border border-black/10 shadow-[0_1px_0_rgba(255,255,255,.7),0_8px_24px_rgba(0,0,0,.08)]
                      active:translate-y-[1px]"
          >
            <Search className="h-5 w-5 text-neutral-800" strokeWidth={2.2} />
          </VTLink>
        }
      />

      <InstallPrompt />

      <div className="px-4 pt-4">
        <PaperCard label="Hôm nay">
          <div className="serif text-[18px] font-semibold leading-snug">Thanh Âm Ký Ức</div>
          <div className="mt-1 text-sm text-[var(--muted)] italic">
            “Giọng nói là thứ ở lại lâu hơn ta nghĩ.”
          </div>

          <VTLink href="/create" className="block mt-4">
            <button
              className="w-full rounded-2xl bg-[var(--accent)] text-white py-4 font-semibold btn-emboss"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              ＋ Ghi câu chuyện mới
            </button>
          </VTLink>
        </PaperCard>
      </div>

      <div className="px-4 py-4 space-y-3">
        {!items || items.length === 0 ? (
          <PaperCard label="Trang trống">
            <div className="serif text-lg font-semibold">Chưa có ký ức nào.</div>
            <div className="mt-1 text-sm text-[var(--muted)]">
              Ghi lại một câu chuyện đầu tiên để mở “sổ”.
            </div>
          </PaperCard>
        ) : (
          items.map((m) => (
            <VTLink key={m.id} href={`/memory/${m.id}`} className="block">
              <PaperCard className="p-0 overflow-hidden">
                <div className="flex gap-3 p-3">
                  <div className="w-[120px]">
                    <div className="bg-white/75 rounded-3xl p-2 shadow-[0_14px_30px_rgba(0,0,0,.18)] border border-black/5">
                      <Thumb blob={m.photoBlob} />
                      <div className="mt-2 text-[11px] text-[var(--muted)] italic line-clamp-1">
                        {m.tags?.[0] ? `#${m.tags[0]}` : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 py-1 pr-1">
                    <div className="font-semibold leading-snug">{m.title}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {m.narrator} • {formatDuration(m.durationMs)} • {formatDate(m.createdAt)}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.tags?.slice(0, 3).map((t) => (
                        <span key={t} className="px-2 py-1 rounded-xl tape text-[11px] font-semibold text-black/70">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="w-11 h-11 rounded-2xl bg-black/10 btn-emboss flex items-center justify-center opacity-80">
                      <Play className="h-5 w-5" strokeWidth={2.3} />
                    </div>
                  </div>
                </div>
              </PaperCard>
            </VTLink>
          ))
        )}
      </div>
    </div>
  );
}
