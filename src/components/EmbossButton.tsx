"use client";
import { cn } from "@/lib/cn";

export default function EmbossButton({
  children,
  className = "",
  variant = "primary",
  onClick,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  const base =
    "btn-stamp select-none rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.995] disabled:opacity-50 disabled:cursor-not-allowed";

  const styles =
    variant === "primary"
      ? "bg-[var(--accent)] text-white"
      : variant === "danger"
      ? "bg-red-700 text-white"
      : "bg-white/35 text-[var(--ink)]";

  // Inline fallback so the button is still readable even if arbitrary Tailwind
  // utilities fail to compile in some setups.
  const fallbackStyle: React.CSSProperties =
    variant === "primary"
      ? { background: "var(--accent)", color: "#fff" }
      : variant === "danger"
      ? { background: "#b91c1c", color: "#fff" }
      : { background: "rgba(255,255,255,.35)", color: "var(--ink)" };

  const mergedStyle: React.CSSProperties = { ...fallbackStyle, ...(style || {}) };

  return (
    <button
      {...props}
      style={mergedStyle}
      className={cn(base, styles, className)}
      onClick={(e) => {
        navigator.vibrate?.(8);
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
