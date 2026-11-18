"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-3 text-white transition hover:opacity-90",
        className,
      )}
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/14 bg-white/6 shadow-[0_12px_30px_rgba(6,14,28,0.24)]">
        <span className="absolute inset-[7px] rounded-md border border-cyan-300/35" />
        <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.55)]" />
      </span>

      <span className="flex flex-col">
        <span
          className={cn(
            "font-semibold text-white",
            compact ? "text-base" : "text-lg",
          )}
        >
          NeuroTrack
        </span>
        <span className="text-xs text-slate-400">
          Cumulative head-impact monitoring
        </span>
      </span>
    </Link>
  );
}
