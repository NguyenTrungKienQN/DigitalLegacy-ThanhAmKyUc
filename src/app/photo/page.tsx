import { Suspense } from "react";
import PhotoClient from "./PhotoClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-4">
          <div className="text-sm text-[var(--muted)]">Đang tải…</div>
        </div>
      }
    >
      <PhotoClient />
    </Suspense>
  );
}
