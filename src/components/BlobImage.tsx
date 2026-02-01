"use client";

import React from "react";
import { useObjectUrl } from "@/lib/useObjectUrl";

export default function BlobImage({
  blob,
  className,
  alt = ""
}: {
  blob: Blob;
  className?: string;
  alt?: string;
}) {
  const url = useObjectUrl(blob);
  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} className={className} alt={alt} />;
}
