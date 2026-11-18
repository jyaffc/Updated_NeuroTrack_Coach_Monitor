import Link from "next/link";
import { ArrowUpDown } from "lucide-react";

import { CoachStatusPill, EmptyState } from "@/components/neurotrack/surface";
import { formatTime, type PlayerSummary } from "@/lib/neurotrack-data";
import { athleteBadge, cn } from "@/lib/utils";

export type SortKey =
  | "playerName"
  | "totalEvents"
  | "strongestEvent"
  | "lastEventTime"
  | "status"
  | "cumulativeExposureScore";

export function PlayerTable({
  players,
  selectedPlayerId,
  sortKey,
  sortDirection,
  onSelect,
  onSort,
  baselineAvailable = true,
}: {
  players: PlayerSummary[];
  selectedPlayerId?: string;
  sortKey: SortKey;
  sortDirection: "asc" | "desc";
  onSelect: (playerId: string) => void;
  onSort: (key: SortKey) => void;
  // False for a first uploaded session, where there is nothing to compare against
  baselineAvailable?: boolean;
}) {
  const headingClass =
    "inline-flex items-center gap-2 text-left text-xs font-medium uppercase tracking-[0.12em] text-slate-400";
  const formatBaselineDelta = (value: number) =>
    `${value >= 0 ? "+" : ""}${value}`;

  if (!players.length) {
    return (
      <EmptyState
        title="No athletes match this filter"
        body="Reset the current status filter to restore the full session ranking."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/8 text-sm">
          <thead className="bg-white/[0.025]">
            <tr>
              {[
                { key: "playerName", label: "Player" },
                { key: "totalEvents", label: "Events" },
                { key: "strongestEvent", label: "Highest intensity" },
                { key: "lastEventTime", label: "Last event" },
                { key: "status", label: "Status" },
              ].map((column) => (
                <th key={column.key} className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onSort(column.key as SortKey)}
                    className={headingClass}
                    aria-label={
                      sortKey === column.key
                        ? `${column.label}, sorted ${sortDirection}`
                        : `Sort by ${column.label}`
                    }
                  >
                    {column.label}
                    <ArrowUpDown
                      className={cn(
                        "h-3.5 w-3.5 transition",
                        sortKey === column.key ? "text-cyan-200" : "text-slate-500",
                      )}
                    />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/8">
            {players.map((player) => {
              const selected = player.playerId === selectedPlayerId;

              return (
                <tr
                  key={player.playerId}
                  onClick={() => onSelect(player.playerId)}
                  className={cn(
                    "cursor-pointer bg-transparent transition hover:bg-white/[0.04]",
                    selected ? "bg-cyan-300/7" : "",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-sm font-medium text-white">
                        {athleteBadge(player.playerName, player.jerseyNumber)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{player.playerName}</div>
                        <div className="text-slate-400">{player.position}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          Load index {player.cumulativeExposureScore} |{" "}
                          {baselineAvailable
                            ? `${formatBaselineDelta(player.baselineDelta)} vs baseline`
                            : "No baseline yet"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white">{player.totalEvents}</td>
                  <td className="px-4 py-3 text-white">{player.strongestEvent} g</td>
                  <td className="px-4 py-3 text-slate-300">{formatTime(player.lastEventTime)}</td>
                  <td className="px-4 py-3">
                    <CoachStatusPill status={player.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/athletes/${player.playerId}`}
                      className="inline-flex rounded-lg border border-white/10 bg-white/6 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
