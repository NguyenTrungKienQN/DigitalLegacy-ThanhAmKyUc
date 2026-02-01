"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { withViewTransition } from "@/lib/vt";

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  LinkProps & { children: React.ReactNode };

function hrefToString(href: LinkProps["href"]): string {
  if (typeof href === "string") return href;
  if (href instanceof URL) return href.toString();
  const { pathname = "", query, hash } = href as any;
  const q = query
    ? "?" +
      new URLSearchParams(
        Object.entries(query).flatMap(([k, v]) =>
          v == null ? [] : Array.isArray(v) ? v.map((x) => [k, String(x)]) : [[k, String(v)]]
        )
      ).toString()
    : "";
  const hh = hash ? (String(hash).startsWith("#") ? String(hash) : `#${String(hash)}`) : "";
  return `${pathname}${q}${hh}`;
}

function isExternal(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

export default function VTLink(props: Props) {
  const router = useRouter();
  const hrefStr = hrefToString(props.href);

  return (
    <Link
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        if (e.defaultPrevented) return;
        if (props.target === "_blank") return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if ((e as any).button === 1) return;
        if (isExternal(hrefStr)) return;

        e.preventDefault();
        withViewTransition(() => router.push(hrefStr));
      }}
    />
  );
}
