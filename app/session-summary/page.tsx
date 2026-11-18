import { SessionSummaryRoute } from "@/components/neurotrack/data-routes";
import { getSessionSummaryBundle } from "@/lib/neurotrack-data";

export default function SessionSummaryPage() {
  // The client route swaps in the active uploaded session when there is one
  return <SessionSummaryRoute demoSummary={getSessionSummaryBundle()} />;
}
