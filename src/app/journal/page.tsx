"use client";

import Header from "@/components/Header";
import PaperCard from "@/components/PaperCard";
import EmbossButton from "@/components/EmbossButton";
import VTLink from "@/components/VTLink";
import { cn } from "@/lib/cn";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus } from "lucide-react";

function fmt(ts: number) {
  // client-only => không lo hydration mismatch
  return new Date(ts).toLocaleString("vi-VN", { hour12: false });
}

export default function JournalPage() {
  const items = useLiveQuery(async () => {
    // mới nhất lên trước
    return db.journals.orderBy("createdAt").reverse().toArray();
  }, []);

  return (
    <div className="min-h-full">
      <Header title="Nhật ký" />

      <div className="px-4 py-5 pb-28">
        {/* Empty state */}
        {!items?.length ? (
          <PaperCard className="text-center">
            <div className="text-lg font-semibold serif">Chưa có nhật ký nào</div>
            <div className="mt-1 text-sm text-[var(--muted)]">
              Viết vài dòng hôm nay — để sau này còn nhớ.
            </div>
            <div className="mt-4">
              <VTLink href="/journal/new" className="inline-block">
                <EmbossButton>
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" strokeWidth={2.3} />
                    Viết nhật ký đầu tiên
                  </span>
                </EmbossButton>
              </VTLink>
            </div>
          </PaperCard>
        ) : (
          <div className="relative pl-8">
            {/* line */}
            <div className="absolute left-3 top-2 bottom-2 w-px bg-black/15" />

            {items.map((j: any) => {
              const title = (j.title?.trim() || "Nhật ký");
              const photoCount = (j.photos?.length ?? 0);

              return (
                <div key={j.id} className="relative mb-4">
                  {/* node */}
                  <div className="absolute left-[9px] top-6 w-3 h-3 rounded-full bg-[var(--paper)] border border-black/25 shadow-sm" />

                  <PaperCard className="ml-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold serif">{title}</div>
                        <div className="mt-1 text-xs text-[var(--muted)]">
                          {fmt(j.createdAt)}
                          {j.updatedAt && j.updatedAt !== j.createdAt ? ` • sửa ${fmt(j.updatedAt)}` : ""}
                        </div>
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        {photoCount ? `${photoCount} ảnh` : ""}
                      </div>
                    </div>

                    <div className="mt-2 text-sm whitespace-pre-wrap line-clamp-3">
                      {j.content}
                    </div>

                    <div className="mt-3 flex justify-end">
                      <VTLink href={`/journal/${j.id}`}>
                        <EmbossButton variant="secondary">Mở</EmbossButton>
                      </VTLink>
                    </div>
                  </PaperCard>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating button */}
      <div className="fixed right-4 bottom-[84px] z-50">
        <VTLink href="/journal/new" aria-label="Viết nhật ký mới">
          <button
            className={cn(
              "w-14 h-14 rounded-2xl grid place-items-center",
              "bg-[var(--paper)] border border-black/10 shadow-[0_16px_40px_rgba(0,0,0,.20)]",
              "btn-emboss"
            )}
          >
            <Plus className="h-6 w-6" strokeWidth={2.3} />
          </button>
        </VTLink>
      </div>
    </div>
  );
}
