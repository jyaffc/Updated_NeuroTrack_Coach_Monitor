"use client";

// Client wrappers for the athlete and summary routes. They show the active
// uploaded session when there is one in this browser, otherwise the demo data
// that the server page passes in.

import Link from "next/link";

import { AthleteDetailView } from "@/components/neurotrack/athlete-detail-view";
import { CoachShell } from "@/components/neurotrack/coach-shell";
import { DashboardSkeleton } from "@/components/neurotrack/loading-skeleton";
import { SessionSummaryView } from "@/components/neurotrack/session-summary-view";
import type { AthleteDetailBundle, SessionSummaryBundle } from "@/lib/neurotrack-data";
import {
  buildUploadedAthleteDetail,
  buildUploadedSummaryBundle,
  getActiveSession,
  useUploadStore,
} from "@/lib/uploaded-session";

function LoadingShell({ title }: { title: string }) {
  return (
    <CoachShell eyebrow="Loading" title={title} description="Reading session data in this browser.">
      <DashboardSkeleton />
    </CoachShell>
  );
}

export function AthleteDetailRoute({
  playerId,
  demoDetail,
}: {
  playerId: string;
  demoDetail?: AthleteDetailBundle;
}) {
  const store = useUploadStore();

  if (store === null) {
    return <LoadingShell title="Loading athlete" />;
  }

  // Prefer the active uploaded session when it contains this athlete
  const active = getActiveSession(store);
  const uploaded = active ? buildUploadedAthleteDetail(store, active, playerId) : undefined;
  const detail = uploaded ?? demoDetail;

  if (!detail) {
    return (
      <CoachShell
        eyebrow="Athlete detail"
        title="Athlete not found"
        description="This athlete is not in the selected session. Pick a session on the dashboard and try again."
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.07]"
        >
          Back to dashboard
        </Link>
      </CoachShell>
    );
  }

  return <AthleteDetailView detail={detail} />;
}

export function SessionSummaryRoute({ demoSummary }: { demoSummary?: SessionSummaryBundle }) {
  const store = useUploadStore();

  if (store === null) {
    return <LoadingShell title="Loading summary" />;
  }

  const active = getActiveSession(store);
  const summary = active ? buildUploadedSummaryBundle(store, active) : demoSummary;

  return summary ? <SessionSummaryView summary={summary} /> : null;
}
