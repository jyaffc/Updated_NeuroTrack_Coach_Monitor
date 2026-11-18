import { CoachShell } from "@/components/neurotrack/coach-shell";
import { DashboardSkeleton } from "@/components/neurotrack/loading-skeleton";

export default function AthleteLoading() {
  return (
    <CoachShell
      eyebrow="Loading athlete"
      title="Preparing athlete detail"
      description="Bringing timeline, direction distribution, and recent baseline into view."
    >
      <DashboardSkeleton />
    </CoachShell>
  );
}
