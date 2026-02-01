"use client";

import { useParams } from "next/navigation";
import JournalDetailClient from "./JournalDetailClient";

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  if (!id) return null;
  return <JournalDetailClient id={id} />;
}
