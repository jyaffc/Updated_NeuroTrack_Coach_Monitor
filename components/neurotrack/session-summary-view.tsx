"use client";

import { useMemo } from "react";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CoachShell } from "@/components/neurotrack/coach-shell";
import { MountedChart } from "@/components/neurotrack/mounted-chart";
import {
  ActionButton,
  LiveBadge,
  SectionSurface,
  StatTile,
} from "@/components/neurotrack/surface";
import { formatSessionDate, type SessionSummaryBundle } from "@/lib/neurotrack-data";

export function SessionSummaryView({ summary }: { summary: SessionSummaryBundle }) {
  const summaryLines = useMemo(
    () => summary.summaryBlock.split("\n"),
    [summary.summaryBlock],
  );

  function downloadSummary() {
    const blob = new Blob([summary.summaryBlock], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${summary.session.label.toLowerCase().replaceAll(" ", "-")}-brief.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <CoachShell
      eyebrow={summary.source === "upload" ? "Presentation-ready recap | Uploaded data" : "Presentation-ready recap | Demo data"}
      title={`${summary.session.label} summary`}
      description={`${summary.team.name} | ${formatSessionDate(summary.session.date)} | ${summary.session.venue}`}
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
            <ActionButton
              emphasis="primary"
              onClick={downloadSummary}
              icon={<Download className="h-4 w-4" />}
            >
              Export summary
            </ActionButton>
          </div>

          <LiveBadge live={false} />
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatTile
            label="Athletes monitored"
            value={String(summary.totals.activePlayers)}
            helper="Athletes included in the recap."
          />
          <StatTile
            label="Total events"
            value={String(summary.totals.totalLoggedEvents)}
            helper="Probable events captured."
            accent="emerald"
          />
          <StatTile
            label="High-confidence alerts"
            value={String(summary.totals.highConfidenceAlerts)}
            helper="Escalated events for coach review."
            accent="amber"
          />
          <StatTile
            label="Flagged for review"
            value={String(summary.totals.playersRecommended)}
            helper="Athletes above the review threshold."
            accent="rose"
          />
          <StatTile
            label="Strongest event"
            value={`${summary.totals.strongestEvent} g`}
            helper={`${summary.strongestEvent.playerName} recorded the peak.`}
            accent="cyan"
          />
        </div>

        <SectionSurface
          eyebrow="Session timeline"
          title="How exposure built across the session"
          description={
            summary.source === "upload"
              ? "Running total of impact load, alerts, and impacts from the uploaded file."
              : "The late-session jump aligns with the period where alerts clustered."
          }
        >
          <MountedChart className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <AreaChart data={summary.exposureTimeline}>
                <defs>
                  <linearGradient id="summaryExposureGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#67e8f9" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
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
                <Area
                  type="monotone"
                  dataKey="teamExposure"
                  stroke="#67e8f9"
                  strokeWidth={2.5}
                  fill="url(#summaryExposureGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </MountedChart>
        </SectionSurface>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionSurface
            eyebrow="Top five highest-load athletes"
            title="Highest cumulative exposure scores"
            description="Use this ranking to guide next-day heading dose or video review."
          >
            <MountedChart className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart
                  data={summary.topLoadAthletes}
                  layout="vertical"
                  margin={{ top: 10, right: 14, left: 22, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="rgba(148,163,184,0.12)" />
                  <XAxis type="number" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="playerName"
                    width={100}
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(8,15,26,0.96)",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="cumulativeExposureScore" fill="#67e8f9" radius={[8, 8, 8, 8]} />
                </BarChart>
              </ResponsiveContainer>
            </MountedChart>
          </SectionSurface>

          <SectionSurface
            eyebrow="Export-ready block"
            title="Coach brief"
            description="Short enough to drop into a slide or share right away."
          >
            <div className="rounded-lg border border-white/10 bg-[#09111c] p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-200">
                {summaryLines.join("\n")}
              </pre>
            </div>
          </SectionSurface>
        </div>
      </div>
    </CoachShell>
  );
}
