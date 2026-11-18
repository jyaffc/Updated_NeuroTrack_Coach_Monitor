import { CoachShell } from "@/components/neurotrack/coach-shell";
import { DashboardSkeleton } from "@/components/neurotrack/loading-skeleton";

export default function SessionSummaryLoading() {
  return (
    <CoachShell
      eyebrow="Loading summary"
      title="Preparing session recap"
      description="Assembling the presentation-ready coach brief."
    >
      <DashboardSkeleton />
    </CoachShell>
  );
}
