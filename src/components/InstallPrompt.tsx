"use client";

import { useEffect, useMemo, useState } from "react";
import PaperCard from "./PaperCard";
import EmbossButton from "./EmbossButton";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export default function InstallPrompt() {
  const [bip, setBip] = useState<BIPEvent | null>(null);
  const [open, setOpen] = useState(false);

  const isIOS = useMemo(() => {
    if (typeof window === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    const shown = localStorage.getItem("tak_installShown") === "1";
    if (shown) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setBip(e as BIPEvent);
      setOpen(true);
      localStorage.setItem("tak_installShown", "1");
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // iOS: không có beforeinstallprompt → chỉ hiện gợi ý nhẹ ở Settings, hoặc sau onboarding
  useEffect(() => {
    const shown = localStorage.getItem("tak_installShown_ios") === "1";
    if (!isIOS || shown) return;
    // show 1 lần sau 2 giây
    const t = setTimeout(() => {
      setOpen(true);
      localStorage.setItem("tak_installShown_ios", "1");
    }, 1200);
    return () => clearTimeout(t);
  }, [isIOS]);

  if (!open) return null;

  return (
    <div className="px-4 pt-4">
      <PaperCard>
        <div className="text-sm font-semibold">Dùng như một ứng dụng thật?</div>
        <div className="mt-1 text-xs text-[var(--muted)]">
          Thêm “Thanh Âm Ký Ức” vào màn hình chính để mở full-screen và ẩn thanh địa chỉ.
        </div>

        <div className="mt-3 flex gap-2">
          {bip ? (
            <EmbossButton
              onClick={async () => {
                await bip.prompt();
                await bip.userChoice.catch(() => null);
                setOpen(false);
              }}
              className="flex-1"
            >
              Cài đặt
            </EmbossButton>
          ) : (
            <EmbossButton
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Đã hiểu
            </EmbossButton>
          )}

          <EmbossButton variant="secondary" onClick={() => setOpen(false)} className="flex-1">
            Để sau
          </EmbossButton>
        </div>

        <div className="mt-3 text-xs text-[var(--muted)]">
          {isIOS ? (
            <>iPhone: <b>Share</b> → <b>Add to Home Screen</b></>
          ) : (
            <>Android/Chrome: menu <b>⋮</b> → <b>Add to Home screen</b></>
          )}
        </div>
      </PaperCard>
    </div>
  );
}
