import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Activity, ArrowUpRight, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlayerStatus } from "@/lib/neurotrack-data";

export function CoachStatusPill({
  status,
  className,
}: {
  status: PlayerStatus;
  className?: string;
}) {
  const tones: Record<PlayerStatus, string> = {
    Normal:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-100 ring-1 ring-inset ring-emerald-400/15",
    Monitor:
      "border-amber-300/20 bg-amber-300/10 text-amber-100 ring-1 ring-inset ring-amber-300/15",
    "Review Recommended":
      "border-rose-300/20 bg-rose-300/10 text-rose-100 ring-1 ring-inset ring-rose-300/15",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium",
        tones[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

export function LiveBadge({ live = false }: { live?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium",
        live
          ? "border-cyan-300/18 bg-cyan-300/8 text-cyan-100"
          : "border-white/8 bg-white/[0.04] text-slate-200",
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          live ? "bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.7)]" : "bg-slate-500",
        )}
      />
      {live ? "Prototype mode" : "Stored summary"}
    </span>
  );
}

export function SectionSurface({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-lg border border-white/6 bg-[rgba(9,16,27,0.72)] p-5 shadow-[0_18px_48px_rgba(2,6,23,0.14)] backdrop-blur-md md:p-6",
        className,
      )}
    >
      {(eyebrow || title || description || actions) && (
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            {eyebrow ? (
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-cyan-200/80">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h2 className="text-xl font-semibold text-white md:text-[1.45rem]">{title}</h2> : null}
            {description ? (
              <p className="max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
            ) : null}
          </div>

          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      )}

      {children}
    </section>
  );
}

export function StatTile({
  label,
  value,
  helper,
  accent = "cyan",
}: {
  label: string;
  value: string;
  helper: string;
  accent?: "cyan" | "amber" | "rose" | "emerald";
}) {
  const accentMap = {
    cyan: "text-cyan-100",
    amber: "text-amber-100",
    rose: "text-rose-100",
    emerald: "text-emerald-100",
  };

  return (
    <div className="rounded-lg border border-white/6 bg-white/[0.028] p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <div className={cn("mt-3 text-3xl font-semibold", accentMap[accent])}>{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{helper}</p>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  icon = "activity",
}: {
  title: string;
  body: string;
  icon?: "activity" | "review";
}) {
  const Icon = icon === "review" ? ShieldAlert : Activity;

  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-white/8 bg-white/[0.025] px-6 text-center">
      <Icon className="h-8 w-8 text-slate-400" />
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{body}</p>
    </div>
  );
}

export function ActionButton({
  children,
  emphasis = "secondary",
  className,
  icon,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  emphasis?: "primary" | "secondary" | "critical";
  icon?: ReactNode;
}) {
  const emphasisMap = {
    primary:
      "border-cyan-300/20 bg-cyan-300 text-slate-950 hover:bg-cyan-200",
    secondary:
      "border-white/10 bg-white/6 text-white hover:bg-white/10",
    critical:
      "border-rose-300/20 bg-rose-300/12 text-rose-50 hover:bg-rose-300/16",
  };

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition",
        emphasisMap[emphasis],
        className,
      )}
      {...props}
    >
      {children}
      {icon ?? <ArrowUpRight className="h-4 w-4" />}
    </button>
  );
}
