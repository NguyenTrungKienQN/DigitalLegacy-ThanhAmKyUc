import MemoryDetailClient from "./MemoryDetailClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ unwrap Promise params
  return <MemoryDetailClient id={id} />;
}
