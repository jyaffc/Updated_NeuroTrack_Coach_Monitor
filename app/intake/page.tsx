import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AnalysisDropzone } from "@/components/neurotrack/analysis-dropzone";
import { CoachShell } from "@/components/neurotrack/coach-shell";
import { LiveBadge, SectionSurface } from "@/components/neurotrack/surface";

export default function IntakePage() {
  return (
    <CoachShell
      eyebrow="Session intake"
      title="Analyze a fresh export"
      description="Upload a CSV or JSON export when you want a quick coach-facing readout from new prototype data."
      headerActions={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/[0.07]"
            >
              Open dashboard
            </Link>
            <Link
              href="/session-summary"
              className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/[0.07]"
            >
              Open session summary
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <LiveBadge live={false} />
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
          <AnalysisDropzone />

          <SectionSurface
            eyebrow="What works now"
            title="Headband logs load straight into the dashboard"
            description="Upload the CSV from head_impact_receiver.py or any coach export with player and intensity columns."
          >
            <div className="space-y-4 text-sm leading-7 text-slate-300">
              <p>
                Headband logs are read as written: accel_magnitude_g, esp32_timestamp_ms, and
                direction_x/y/z are recognized, and samples from one hit are merged into a single
                impact.
              </p>
              <p>
                Files with usable impacts are saved in this browser and become the session shown on
                the dashboard, athlete pages, and summary. Each new upload is compared against the
                earlier ones to build a baseline.
              </p>
              <p>
                Readings at the BNO055&apos;s 4 g fusion-mode limit are flagged, since the true peak
                may be higher.
              </p>
            </div>
          </SectionSurface>
        </div>
      </div>
    </CoachShell>
  );
}
