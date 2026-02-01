"use client";

import Header from "@/components/Header";
import PaperCard from "@/components/PaperCard";
import VTLink from "@/components/VTLink";


export default function Settings() {
  return (
    <div className="min-h-full">
      <Header title="Cài đặt" />
      <div className="px-4 py-5 space-y-3">
        <VTLink href="/settings/backup" className="block">
          <PaperCard>
            <div className="font-semibold">Sao lưu & Xuất</div>
            <div className="text-xs text-[var(--muted)]">Tải toàn bộ dữ liệu (zip)</div>
          </PaperCard>
        </VTLink>
        <VTLink href="/about" className="block">
          <PaperCard>
            <div className="font-semibold">Về Thanh Âm Ký Ức</div>
            <div className="text-xs text-[var(--muted)]">Giữ lại câu chuyện gia đình.</div>
          </PaperCard>
        </VTLink>
      </div>
    </div>
  );
}
