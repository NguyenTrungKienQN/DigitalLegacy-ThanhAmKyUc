// src/components/VTRouteWatcher.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { notifyRouteChanged } from "@/lib/vt";

export default function VTRouteWatcher() {
  const p = usePathname();
  useEffect(() => {
    notifyRouteChanged();
  }, [p]);

  return null;
}
