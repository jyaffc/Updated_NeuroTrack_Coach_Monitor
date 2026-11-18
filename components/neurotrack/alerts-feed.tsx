import { AlertTriangle, Clock3 } from "lucide-react";

import { CoachStatusPill, EmptyState } from "@/components/neurotrack/surface";
import { formatTime, type AlertSummary } from "@/lib/neurotrack-data";
import { cn, jerseyLabel } from "@/lib/utils";

export function AlertsFeed({
  alerts,
  highlightedEventId,
}: {
  alerts: AlertSummary[];
  highlightedEventId?: string;
}) {
  if (!alerts.length) {
    return (
      <EmptyState
        title="No higher-confidence alerts in this view"
        body="The current filter set has no events above the higher-confidence threshold."
        icon="review"
      />
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const highlighted = alert.eventId === highlightedEventId;

        return (
          <div
            key={alert.eventId}
            className={cn(
              "rounded-lg border border-white/8 bg-white/4 p-4 transition",
              highlighted
                ? "border-cyan-300/25 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(103,232,249,0.08)]"
                : "hover:bg-white/6",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-200" />
                  <span className="font-medium text-white">
                    {alert.playerName}{jerseyLabel(alert.jerseyNumber)}
                  </span>
                  <CoachStatusPill status={alert.status} />
                  {highlighted ? (
                    <span className="rounded-lg bg-cyan-300 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-950">
                      New
                    </span>
                  ) : null}
                </div>

                <p className="text-sm text-slate-300">
                  {alert.eventType} • {alert.eventDirection} • {alert.eventIntensity} g
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock3 className="h-4 w-4" />
                {formatTime(alert.timestamp)}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span>Confidence {(alert.confidenceScore * 100).toFixed(0)}%</span>
              <span className="h-1 w-1 rounded-full bg-slate-500" />
              <span>Coach review queue updated</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
