"use client";
import { useEffect } from "react";

export default function HydrationFlag() {
  useEffect(() => {
    document.documentElement.setAttribute("data-hydrated", "true");
  }, []);
  return null;
}
