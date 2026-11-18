import { CoachShell } from "@/components/neurotrack/coach-shell";
import { DashboardSkeleton } from "@/components/neurotrack/loading-skeleton";

export default function DashboardLoading() {
  return (
    <CoachShell
      eyebrow="Loading dashboard"
      title="Syncing the live session view"
      description="Pulling coach-facing metrics, rankings, and alerts."
    >
      <DashboardSkeleton />
    </CoachShell>
  );
}
