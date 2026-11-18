"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Clock3,
  Download,
  Filter,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CoachShell } from "@/components/neurotrack/coach-shell";
import { DashboardSkeleton } from "@/components/neurotrack/loading-skeleton";
import { MountedChart } from "@/components/neurotrack/mounted-chart";
import { PlayerTable, type SortKey } from "@/components/neurotrack/player-table";
import {
  ActionButton,
  CoachStatusPill,
  LiveBadge,
  SectionSurface,
  StatTile,
} from "@/components/neurotrack/surface";
import {
  defaultDashboardSessionId,
  defaultDashboardTeamId,
  formatSessionDate,
  formatTime,
  getDashboardBundle,
  getSessionsForTeam,
  type PlayerStatus,
  type PlayerSummary,
} from "@/lib/neurotrack-data";
import {
  buildUploadedDashboardBundle,
  clearUploadedSessions,
  getActiveSession,
  setActiveUploadedSession,
  useUploadStore,
} from "@/lib/uploaded-session";
import { jerseyLabel } from "@/lib/utils";

const containerMotion = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      staggerChildren: 0.08,
    },
  },
};

const itemMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const statusOrder: Record<PlayerStatus, number> = {
  "Review Recommended": 3,
  Monitor: 2,
  Normal: 1,
};

function formatDelta(value: number) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function getPriorityNote(player?: PlayerSummary, baselineAvailable = true) {
  if (!player) {
    return "Review queue stays quiet until an athlete moves above baseline or triggers a higher-confidence event.";
  }

  if (!baselineAvailable) {
    return "No earlier sessions to compare against yet. Use the load index and strongest event, and upload more sessions to build a baseline.";
  }

  if (player.baselineDelta >= 12) {
    return "Higher-than-usual session load relative to recent baseline. Review video and consider reducing heading dose in the next block.";
  }

  if (player.baselineDelta >= 6) {
    return "Session load is rising versus recent baseline. Keep this athlete in the monitor group through the end of the session.";
  }

  return "Current session load remains close to recent baseline. Continue normal observation unless sideline context suggests a closer look.";
}

export function DashboardView() {
  const [teamId, setTeamId] = useState(defaultDashboardTeamId());
  const [requestedSessionId, setRequestedSessionId] = useState(
    defaultDashboardSessionId(),
  );
  const [statusFilter, setStatusFilter] = useState<PlayerStatus | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("cumulativeExposureScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [liveClock, setLiveClock] = useState(
    new Date("2026-04-13T19:24:00-04:00"),
  );

  const availableSessions = useMemo(() => getSessionsForTeam(teamId), [teamId]);
  const activeSessionId = availableSessions.some(
    (session) => session.id === requestedSessionId,
  )
    ? requestedSessionId
    : availableSessions[0]?.id ?? defaultDashboardSessionId();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLiveClock((current) => new Date(current.getTime() + 60_000));
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  // Sessions uploaded on the intake page (null until the browser store is read)
  const uploadStore = useUploadStore();
  const activeUpload = getActiveSession(uploadStore);

  const dashboard = useMemo(
    () =>
      uploadStore && activeUpload
        ? buildUploadedDashboardBundle(uploadStore, activeUpload)
        : getDashboardBundle(teamId, activeSessionId),
    [activeSessionId, activeUpload, teamId, uploadStore],
  );
  const isUpload = dashboard.source === "upload";
  const baselineAvailable = dashboard.baselineAvailable !== false;

  // Switches between uploaded sessions and the two demo teams
  function handleSourceChange(value: string) {
    if (value === "uploaded") {
      const newest = uploadStore?.sessions.at(-1)?.id ?? null;
      setActiveUploadedSession(newest);
      return;
    }
    setActiveUploadedSession(null);
    setTeamId(value);
  }

  const filteredPlayers = useMemo(() => {
    const nextPlayers =
      statusFilter === "All"
        ? [...dashboard.players]
        : dashboard.players.filter((player) => player.status === statusFilter);

    return nextPlayers.sort((left, right) => {
      const order = sortDirection === "desc" ? -1 : 1;

      if (sortKey === "playerName") {
        return left.playerName.localeCompare(right.playerName) * order;
      }

      if (sortKey === "lastEventTime") {
        return (
          (+new Date(left.lastEventTime) - +new Date(right.lastEventTime)) * order
        );
      }

      if (sortKey === "status") {
        return (statusOrder[left.status] - statusOrder[right.status]) * order;
      }

      return ((left[sortKey] as number) - (right[sortKey] as number)) * order;
    });
  }, [dashboard.players, sortDirection, sortKey, statusFilter]);

  const activeSelectedPlayerId = filteredPlayers.some(
    (player) => player.playerId === selectedPlayerId,
  )
    ? selectedPlayerId
    : filteredPlayers[0]?.playerId ?? dashboard.players[0]?.playerId ?? "";

  const selectedPlayer =
    dashboard.players.find((player) => player.playerId === activeSelectedPlayerId) ??
    dashboard.players[0];

  const reviewQueue = dashboard.players
    .filter((player) => player.status !== "Normal")
    .slice(0, 4);

  const selectedAlerts = useMemo(() => {
    if (!selectedPlayer) {
      return dashboard.recentAlerts.slice(0, 3);
    }

    const playerAlerts = dashboard.recentAlerts.filter(
      (alert) => alert.playerId === selectedPlayer.playerId,
    );

    return (playerAlerts.length ? playerAlerts : dashboard.recentAlerts).slice(0, 3);
  }, [dashboard.recentAlerts, selectedPlayer]);

  function handleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === "playerName" ? "asc" : "desc");
  }

  function downloadSummary() {
    const blob = new Blob([dashboard.summaryBlock], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${dashboard.session.label.toLowerCase().replaceAll(" ", "-")}-summary.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  // Wait until the browser store has been read so uploaded data does not
  // flash in after the demo data
  if (uploadStore === null) {
    return (
      <CoachShell
        eyebrow="Coach dashboard"
        title="Loading session"
        description="Checking this browser for uploaded headband sessions."
      >
        <DashboardSkeleton />
      </CoachShell>
    );
  }

  return (
    <CoachShell
      eyebrow={isUpload ? "Coach dashboard | Uploaded data" : "Coach dashboard | Demo data"}
      title={dashboard.session.label}
      description={`${dashboard.team.name} | ${formatSessionDate(dashboard.session.date)} | ${dashboard.summary.playersRecommended} athletes in the review queue`}
      headerActions={
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                Data
              </span>
              <select
                value={isUpload ? "uploaded" : teamId}
                onChange={(event) => handleSourceChange(event.target.value)}
                className="w-full rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300/25"
              >
                {uploadStore.sessions.length ? (
                  <option value="uploaded">
                    Uploaded headband sessions ({uploadStore.sessions.length})
                  </option>
                ) : null}
                <option value="bu-womens">Demo: BU Women&apos;s Soccer - First Team</option>
                <option value="bu-development">
                  Demo: BU Women&apos;s Soccer - Development Squad
                </option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                Session
              </span>
              <select
                value={dashboard.session.id}
                onChange={(event) =>
                  isUpload
                    ? setActiveUploadedSession(event.target.value)
                    : setRequestedSessionId(event.target.value)
                }
                className="w-full rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300/25"
              >
                {(isUpload ? dashboard.availableSessions : availableSessions).map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.label} - {formatSessionDate(session.date)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LiveBadge live={dashboard.session.status === "Live"} />
            <div className="rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
              {isUpload && activeUpload
                ? `Uploaded ${formatSessionDate(activeUpload.uploadedAt)}, ${formatTime(activeUpload.uploadedAt)}`
                : `Last sync ${formatTime(liveClock.toISOString())}`}
            </div>
            {uploadStore.sessions.length ? (
              <button
                type="button"
                onClick={() => {
                  // Removes every uploaded session from this browser
                  if (window.confirm("Remove all uploaded sessions from this browser?")) {
                    clearUploadedSessions();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07]"
              >
                Clear uploads
              </button>
            ) : null}
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/[0.07]"
            >
              Analyze export
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      }
    >
      <motion.div
        variants={containerMotion}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div
          variants={itemMotion}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <StatTile
            label="Active players"
            value={String(dashboard.summary.activePlayers)}
            helper={
              isUpload
                ? "Athletes found in the uploaded file."
                : "Paired devices included in the live session view."
            }
            accent="cyan"
          />
          <StatTile
            label="Total logged events"
            value={String(dashboard.summary.totalLoggedEvents)}
            helper="Probable events stored in this session."
            accent="emerald"
          />
          <StatTile
            label="High-confidence alerts"
            value={String(dashboard.summary.highConfidenceAlerts)}
            helper="Only the events escalated for coach review."
            accent="amber"
          />
          <StatTile
            label="Review recommended"
            value={String(dashboard.summary.playersRecommended)}
            helper="Athletes currently above the review threshold."
            accent="rose"
          />
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1.48fr_0.92fr]">
          <motion.div variants={itemMotion}>
            <SectionSurface
              eyebrow="Athlete ranking"
              title="Who needs the closest look right now"
              description="Session load, strongest events, and timing in one scan."
              actions={
                <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
                  <Filter className="h-4 w-4" />
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as PlayerStatus | "All")
                    }
                    className="bg-transparent text-sm text-white outline-none"
                  >
                    <option value="All">All athletes</option>
                    <option value="Normal">Normal</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Review Recommended">Review Recommended</option>
                  </select>
                </div>
              }
            >
              <PlayerTable
                players={filteredPlayers}
                selectedPlayerId={activeSelectedPlayerId}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSelect={setSelectedPlayerId}
                onSort={handleSort}
                baselineAvailable={baselineAvailable}
              />
            </SectionSurface>
          </motion.div>

          <div className="space-y-6">
            <motion.div variants={itemMotion}>
              <SectionSurface
                eyebrow="Review queue"
                title={
                  selectedPlayer
                    ? `${selectedPlayer.playerName} is the current priority view`
                    : "Current review queue"
                }
                description={getPriorityNote(selectedPlayer, baselineAvailable)}
              >
                <div className="space-y-5">
                  <div className="space-y-2">
                    {reviewQueue.length ? (
                      reviewQueue.map((player) => (
                        <button
                          key={player.playerId}
                          type="button"
                          onClick={() => setSelectedPlayerId(player.playerId)}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition ${
                            player.playerId === activeSelectedPlayerId
                              ? "border-cyan-300/18 bg-cyan-300/8"
                              : "border-white/8 bg-white/[0.025] hover:bg-white/[0.05]"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-white">
                              {player.playerName}
                              {jerseyLabel(player.jerseyNumber)}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Load index {player.cumulativeExposureScore} |{" "}
                              {baselineAvailable
                                ? `${formatDelta(player.baselineDelta)} vs baseline`
                                : "No baseline yet"}
                            </p>
                          </div>
                          <CoachStatusPill status={player.status} />
                        </button>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-white/8 bg-white/[0.02] px-4 py-5 text-sm text-slate-400">
                        No athletes are above the current review line in this session view.
                      </div>
                    )}
                  </div>

                  {selectedPlayer ? (
                    <div className="grid gap-4 border-t border-white/8 pt-4 sm:grid-cols-2">
                      <div className="border-l border-white/10 pl-4">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                          Current status
                        </p>
                        <div className="mt-2">
                          <CoachStatusPill status={selectedPlayer.status} />
                        </div>
                      </div>
                      <div className="border-l border-white/10 pl-4">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                          Load vs baseline
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {baselineAvailable ? formatDelta(selectedPlayer.baselineDelta) : "None yet"}
                        </p>
                      </div>
                      <div className="border-l border-white/10 pl-4">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                          Strongest event
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {selectedPlayer.strongestEvent} g
                        </p>
                      </div>
                      <div className="border-l border-white/10 pl-4">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                          Last logged event
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {formatTime(selectedPlayer.lastEventTime)}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-3 border-t border-white/8 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <ShieldAlert className="h-4 w-4 text-amber-200" />
                      Recent high-confidence events
                    </div>

                    {selectedAlerts.length ? (
                      selectedAlerts.map((alert) => (
                        <div
                          key={alert.eventId}
                          className="rounded-lg border border-white/8 bg-white/[0.025] px-3 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {alert.playerName}
                                {jerseyLabel(alert.jerseyNumber)}
                              </p>
                              <p className="mt-1 text-sm text-slate-300">
                                {alert.eventType} | {alert.eventDirection} | {alert.eventIntensity} g
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Clock3 className="h-4 w-4" />
                              {formatTime(alert.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-white/8 bg-white/[0.02] px-4 py-5 text-sm text-slate-400">
                        No higher-confidence events are visible with the current filter.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <ActionButton
                      emphasis="primary"
                      onClick={downloadSummary}
                      icon={<Download className="h-4 w-4" />}
                    >
                      Export summary
                    </ActionButton>
                    <Link
                      href={selectedPlayer ? `/athletes/${selectedPlayer.playerId}` : "/dashboard"}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.07]"
                    >
                      View athlete details
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </SectionSurface>
            </motion.div>

            <motion.div variants={itemMotion}>
              <SectionSurface
                eyebrow="Team trend"
                title="Cumulative load through the session"
                description={
                  baselineAvailable
                    ? `${dashboard.summary.elevatedTrendPercent}% versus recent baseline during the current block.`
                    : "Running total of impact load through the session. Baseline comparison starts with the next uploaded session."
                }
              >
                <MountedChart className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <AreaChart data={dashboard.exposureTimeline}>
                      <defs>
                        <linearGradient id="teamExposureGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.38} />
                          <stop offset="100%" stopColor="#67e8f9" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(8,15,26,0.96)",
                          color: "#fff",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="teamExposure"
                        stroke="#67e8f9"
                        strokeWidth={2.5}
                        fill="url(#teamExposureGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </MountedChart>
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                  <TrendingUp className="h-4 w-4 text-cyan-200" />
                  {isUpload
                    ? `${dashboard.summary.totalLoggedEvents} impacts logged, strongest ${dashboard.summary.strongestEvent} g.`
                    : "Strongest climb came late in the session, where the review queue also filled fastest."}
                </div>
              </SectionSurface>
            </motion.div>
          </div>
        </div>

        <motion.div variants={itemMotion}>
          <SectionSurface
            eyebrow="Coach brief"
            title="What to do with this session"
            description="Clean enough to present, export, or use for next-day planning."
            actions={
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/session-summary"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.07]"
                >
                  End session
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/intake"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.07]"
                >
                  Analyze new file
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            }
          >
            <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
              <div className="space-y-4 text-sm leading-7 text-slate-300">
                <p>
                  {dashboard.summary.playersRecommended} athletes sit above the review
                  threshold, and {dashboard.summary.highConfidenceAlerts} higher-confidence
                  alerts shaped the current queue.
                </p>
                <p>
                  {baselineAvailable
                    ? `Team load is ${dashboard.summary.elevatedTrendPercent}% versus recent baseline. `
                    : "No earlier sessions yet, so there is no baseline comparison. "}
                  Strongest logged event: {dashboard.summary.strongestEvent} g.
                </p>
                <p>
                  Use athlete detail for video review, then adjust the next heading block
                  with cumulative load in mind.
                </p>
              </div>

              <div className="rounded-lg border border-white/6 bg-[#08111b] p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-200">
                  {dashboard.summaryBlock}
                </pre>
              </div>
            </div>
          </SectionSurface>
        </motion.div>
      </motion.div>
    </CoachShell>
  );
}
