// src/lib/vt.ts
"use client";

type VTKind = "blur" | "zoom";

let resolveNav: (() => void) | null = null;
let fallbackTimer: number | null = null;

export function notifyRouteChanged() {
  if (fallbackTimer) {
    window.clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
  if (resolveNav) {
    const r = resolveNav;
    resolveNav = null;
    r();
  }
}

export function withViewTransition(fn: () => void, kind: VTKind = "blur") {
  if (typeof document === "undefined") {
    fn();
    return;
  }

  const anyDoc = document as any;
  const root = document.documentElement;

  root.dataset.vt = kind;
  root.classList.add("vt-on");

  const cleanup = () => {
    root.classList.remove("vt-on");
    try {
      delete root.dataset.vt;
    } catch {}
  };

  if (typeof anyDoc?.startViewTransition === "function") {
    const vt = anyDoc.startViewTransition(async () => {
      fn();

      // giữ VT mở tới khi route thật sự đổi (AppShell sẽ gọi notifyRouteChanged)
      await new Promise<void>((res) => {
        resolveNav = res;
        fallbackTimer = window.setTimeout(() => {
          notifyRouteChanged();
        }, 1200);
      });
    });

    Promise.resolve(vt?.finished).finally(cleanup);
  } else {
    fn();
    cleanup();
  }
}

export type AppRouterLike = {
  push: (s: string) => void;
  replace: (s: string) => void;
  back: () => void;
};

export function vtPush(router: AppRouterLike, href: string, kind: VTKind = "blur") {
  withViewTransition(() => router.push(href), kind);
}

export function vtReplace(router: AppRouterLike, href: string, kind: VTKind = "blur") {
  withViewTransition(() => router.replace(href), kind);
}

export function vtBack(router: AppRouterLike, kind: VTKind = "blur") {
  withViewTransition(() => router.back(), kind);
}
