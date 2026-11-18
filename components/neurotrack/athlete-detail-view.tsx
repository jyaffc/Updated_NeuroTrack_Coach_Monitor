"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, ShieldAlert, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CoachShell } from "@/components/neurotrack/coach-shell";
import { MountedChart } from "@/components/neurotrack/mounted-chart";
import {
  CoachStatusPill,
  LiveBadge,
  SectionSurface,
  StatTile,
} from "@/components/neurotrack/surface";
import {
  formatSessionDate,
  formatTime,
  type AthleteDetailBundle,
} from "@/lib/neurotrack-data";
import { jerseyLabel } from "@/lib/utils";

const directionColors = ["#67e8f9", "#fbbf24", "#38bdf8", "#c084fc", "#34d399"];

function formatDelta(value: number) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function getAccent(status: AthleteDetailBundle["summary"]["status"]) {
  if (status === "Review Recommended") {
    return "rose" as const;
  }

  if (status === "Monitor") {
    return "amber" as const;
  }

  return "emerald" as const;
}

export function AthleteDetailView({ detail }: { detail: AthleteDetailBundle }) {
  // Uploaded athletes have no baseline until a second session is uploaded
  const hasBaseline = detail.baselineAvailable !== false;
  const baselineText = hasBaseline ? formatDelta(detail.summary.baselineDelta) : "No baseline yet";
  const timelineData = detail.events.map((event) => ({
    label: formatTime(event.timestamp),
    eventIntensity: event.eventIntensity,
    cumulativeExposureScore: event.cumulativeExposureScore,
  }));

  return (
    <CoachShell
      eyebrow="Athlete detail"
      title={`${detail.athlete.playerName}${jerseyLabel(detail.athlete.jerseyNumber)}`}
      description={`${detail.athlete.position} | ${detail.session.label} | ${formatSessionDate(detail.session.date)}`}
      headerActions={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/[0.07]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <Link
              href="/session-summary"
              className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/[0.07]"
            >
              <FileText className="h-4 w-4" />
              Session summary
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CoachStatusPill status={detail.summary.status} />
            <LiveBadge live={detail.session.status === "Live"} />
          </div>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Session events"
            value={String(detail.summary.totalEvents)}
            helper="Probable events logged in this session."
          />
          <StatTile
            label="High-confidence alerts"
            value={String(detail.summary.highConfidenceEvents)}
            helper="Escalated events for coach review."
            accent="amber"
          />
          <StatTile
            label="Strongest event"
            value={`${detail.summary.strongestEvent} g`}
            helper="Highest recorded intensity this session."
            accent="rose"
          />
          <StatTile
            label="Current status"
            value={detail.summary.status}
            helper={`Load index ${detail.summary.cumulativeExposureScore} | ${hasBaseline ? `${baselineText} vs baseline` : baselineText}`}
            accent={getAccent(detail.summary.status)}
          />
        </div>

        <SectionSurface
          eyebrow="Coach note"
          title="Context for the current session"
          description={detail.note}
          actions={
            <div className="rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
              Last event {formatTime(detail.summary.lastEventTime)}
            </div>
          }
        >
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <MountedChart className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="athleteTimelineGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.42} />
                      <stop offset="100%" stopColor="#67e8f9" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(8,15,26,0.96)",
                      color: "#fff",
                    }}
                  />
                  <ReferenceLine
                    y={65}
                    stroke="#fbbf24"
                    strokeDasharray="4 4"
                    label={{ value: "Alert threshold", fill: "#fbbf24", position: "top" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="eventIntensity"
                    stroke="#67e8f9"
                    strokeWidth={2.5}
                    fill="url(#athleteTimelineGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </MountedChart>

            <div className="grid gap-4">
              <div className="rounded-lg border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <TrendingUp className="h-4 w-4 text-cyan-200" />
                  Session snapshot
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="border-l border-white/10 pl-4">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                      Load index
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {detail.summary.cumulativeExposureScore}
                    </p>
                  </div>
                  <div className="border-l border-white/10 pl-4">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                      Change vs baseline
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {baselineText}
                    </p>
                  </div>
                  <div className="border-l border-white/10 pl-4">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                      Current status
                    </p>
                    <div className="mt-2">
                      <CoachStatusPill status={detail.summary.status} />
                    </div>
                  </div>
                  <div className="border-l border-white/10 pl-4">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                      High-confidence events
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {detail.summary.highConfidenceEvents}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/8 bg-white/[0.03] p-4">
                <div className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <ShieldAlert className="h-4 w-4 text-cyan-200" />
                  Direction distribution
                </div>
                <div className="mt-4 flex items-center gap-5">
                  <MountedChart className="h-[160px] w-[160px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={detail.directionDistribution}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={42}
                          outerRadius={74}
                          paddingAngle={3}
                        >
                          {detail.directionDistribution.map((segment, index) => (
                            <Cell
                              key={segment.name}
                              fill={directionColors[index % directionColors.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(8,15,26,0.96)",
                            color: "#fff",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </MountedChart>
                  <div className="space-y-3">
                    {detail.directionDistribution.map((segment, index) => (
                      <div key={segment.name} className="flex items-center gap-3 text-sm text-slate-300">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: directionColors[index % directionColors.length],
                          }}
                        />
                        <span>{segment.name}</span>
                        <span className="text-slate-500">{segment.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionSurface>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionSurface
            eyebrow={detail.source === "upload" && detail.athlete.recentSessionLoads.length < 2 ? "This session" : "Recent sessions"}
            title="Cumulative load trend"
            description={
              detail.source === "upload" && detail.athlete.recentSessionLoads.length < 2
                ? "How the load index built up impact by impact. Upload more sessions to compare across sessions."
                : "Compare the current session with recent monitored sessions."
            }
          >
            <MountedChart className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={detail.cumulativeLoadTrend}>
                  <defs>
                    <linearGradient id="loadTrendGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(8,15,26,0.96)",
                      color: "#fff",
                    }}
                  />
                  <ReferenceLine
                    y={65}
                    stroke="#fbbf24"
                    strokeDasharray="4 4"
                    label={{ value: "Coach review line", fill: "#fbbf24", position: "top" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    fill="url(#loadTrendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </MountedChart>
          </SectionSurface>

          <SectionSurface
            eyebrow="Recent high-confidence moments"
            title="Events most likely to merit review"
            description="Use these timestamps to jump into video review."
          >
            <div className="space-y-3">
              {detail.highConfidenceAlerts.length ? (
                detail.highConfidenceAlerts.map((alert) => (
                  <div
                    key={alert.eventId}
                    className="rounded-lg border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">
                          {alert.eventType} | {alert.eventIntensity} g
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {alert.eventDirection} | Confidence{" "}
                          {(alert.confidenceScore * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="text-sm text-slate-400">
                        {formatTime(alert.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-white/8 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">
                  No higher-confidence alerts were recorded for this athlete in the
                  current session.
                </div>
              )}
            </div>
          </SectionSurface>
        </div>
      </motion.div>
    </CoachShell>
  );
}
