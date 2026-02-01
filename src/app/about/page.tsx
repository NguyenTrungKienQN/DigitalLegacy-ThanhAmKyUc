"use client";

import Header from "@/components/Header";
import PaperCard from "@/components/PaperCard";

export default function AboutPage() {
  // Nếu bạn chưa có version trong env, tạm để cứng:
  const version = "1.0.0";
  const slogan = "Giữ lại giọng nói, giữ lại thời gian.";

  return (
    <div className="min-h-full">
      <Header title="Về Thanh Âm Ký Ức" />

      <div className="px-4 py-6">
        <PaperCard className="text-center">
          {/* App icon: dùng icon 192/512 trong public/icons */}
          <div className="mx-auto w-24 h-24 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,.12)] border border-black/10 bg-white">
            {/* Nếu icon của bạn nằm chỗ khác, đổi src cho đúng */}
            <img
              src="/icons/icon-192.png"
              alt="Thanh Âm Ký Ức"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          <div className="mt-4" style={{ fontFamily: "ui-serif, Georgia" }}>
            <div className="text-lg font-semibold">Thanh Âm Ký Ức</div>
            <div className="mt-1 text-xs text-[var(--muted)]">{slogan}</div>
          </div>

          <div className="mt-5 text-sm">
            <span className="text-[var(--muted)]">Phiên bản</span>{" "}
            <span className="font-semibold">{version}</span>
          </div>

          <div className="mt-4 text-xs text-[var(--muted)] leading-relaxed">
            Ứng dụng lưu trữ ghi âm và kỷ vật ngay trên thiết bị (offline).
            Hãy sao lưu thường xuyên để bảo vệ ký ức của bạn.
          </div>
        </PaperCard>
      </div>
    </div>
  );
}
