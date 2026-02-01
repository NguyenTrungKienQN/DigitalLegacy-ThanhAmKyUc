import { cn } from "@/lib/cn";

export default function PaperCard({
  children,
  className = "",
  label,
  tapeLabel,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
  tapeLabel?: string; // backward compatible
}) {
  const shown = label ?? tapeLabel;

  return (
    <div className={cn("page-card rounded-[22px] p-4", className)}>
      {shown ? (
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-black/15 bg-white/30 text-[11px] font-semibold">
          <span className="serif">{shown}</span>
        </div>
      ) : null}
      {children}
    </div>
  );
}
