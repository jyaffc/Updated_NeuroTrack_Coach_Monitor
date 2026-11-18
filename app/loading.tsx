import { CoachShell } from "@/components/neurotrack/coach-shell";
import { DashboardSkeleton } from "@/components/neurotrack/loading-skeleton";

export default function Loading() {
  return (
    <CoachShell
      eyebrow="Loading"
      title="Preparing NeuroTrack"
      description="Bringing the demo data and coach workspace online."
    >
      <DashboardSkeleton />
    </CoachShell>
  );
}
