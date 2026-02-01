"use client";

import { useEffect, useState } from "react";

/**
 * Create a stable object URL for a Blob without doing side effects during render.
 * Fixes React StrictMode double-render issues in dev (objectURL created+revoked too early).
 */
export function useObjectUrl(blob?: Blob | null) {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!blob) {
      setUrl(undefined);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => {
      // Dev (StrictMode + Fast Refresh) có thể double-mount/double-unmount rất nhanh,
      // revoke sớm sẽ tạo spam `net::ERR_FILE_NOT_FOUND` khi <audio>/<img> vẫn đang load.
      // Vì đây chỉ là PWA local-first, leak nhỏ ở DEV chấp nhận được.
      if (process.env.NODE_ENV !== "production") return;
      try {
        URL.revokeObjectURL(u);
      } catch {}
    };
  }, [blob]);

  return url;
}
