"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/components/Header";
import PaperCard from "@/components/PaperCard";
import EmbossButton from "@/components/EmbossButton";
import type { LucideIcon } from "lucide-react";
import { CassetteTape, Image as ImageIcon, Play, NotebookPen } from "lucide-react"; // + NotebookPen
import { vtReplace } from "@/lib/vt";


const slides: { title: string; text: string; icon: LucideIcon }[] = [
  {
    title: "Lưu giọng nói người thân",
    text: "Mỗi câu chuyện là một mảnh ký ức đáng giữ.",
    icon: CassetteTape,
  },
  {
    title: "Thêm ảnh kỷ vật",
    text: "Một tấm ảnh — một lần chạm vào quá khứ.",
    icon: ImageIcon,
  },
  {
    title: "Nghe lại bất cứ lúc nào",
    text: "Khi nhớ, chỉ cần bấm Play.",
    icon: Play,
  },
  {
    title: "Viết nhật ký mỗi ngày",
    text: "Gõ nhanh vài dòng, chèn ảnh kỷ vật và xem lại theo dòng thời gian.",
    icon: NotebookPen,
  },
];

export default function Onboarding() {
  const r = useRouter();
  const [i, setI] = useState(0);
  const Icon = slides[i].icon;

  const done = () => {
    localStorage.setItem("tak_hasOnboarded", "1");
    vtReplace(r as any, "/home", "zoom");
  };

  return (
    <div className="min-h-full">
      <Header title="Onboarding" back={false} />
      <div className="px-4 py-5">
        <PaperCard>
          <div className="w-11 h-11 rounded-2xl grid place-items-center bg-black/10 btn-emboss">
            <Icon className="h-6 w-6 text-neutral-800" strokeWidth={2.3} />
          </div>

          <div className="mt-3 text-lg font-semibold" style={{ fontFamily: "ui-serif, Georgia" }}>
            {slides[i].title}
          </div>
          <div className="mt-1 text-sm text-[var(--muted)]">{slides[i].text}</div>

          <div className="mt-4 flex justify-center gap-2 text-xs opacity-70">
            {slides.map((_, idx) => (
              <span key={idx}>{idx === i ? "●" : "○"}</span>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <EmbossButton
              variant="secondary"
              onClick={() => setI((v) => Math.max(0, v - 1))}
              disabled={i === 0}
              className="flex-1"
            >
              Trước
            </EmbossButton>

            {i < slides.length - 1 ? (
              <EmbossButton onClick={() => setI((v) => Math.min(slides.length - 1, v + 1))} className="flex-1">
                Tiếp
              </EmbossButton>
            ) : (
              <EmbossButton onClick={done} className="flex-1">
                Bắt đầu
              </EmbossButton>
            )}
          </div>

          <button onClick={done} className="mt-3 text-xs underline text-black/60 w-full">
            Mình sẽ xem sau
          </button>
        </PaperCard>

        <div className="mt-4 text-xs text-[var(--muted)]">
          Micro chỉ xin quyền khi bạn bấm <b>Bắt đầu ghi</b> để tránh bị chặn sớm.
        </div>
      </div>
    </div>
  );
}
