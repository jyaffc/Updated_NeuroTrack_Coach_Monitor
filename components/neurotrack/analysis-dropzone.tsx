"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
} from "react";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  FileSearch,
  FileUp,
  LoaderCircle,
  ScanSearch,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { ActionButton, CoachStatusPill, EmptyState, SectionSurface } from "@/components/neurotrack/surface";
import {
  analyzeSessionUpload,
  buildDemoUploadCsv,
  type UploadedFileAnalysis,
} from "@/lib/session-upload-analysis";
import { saveUploadedSession } from "@/lib/uploaded-session";
import { cn } from "@/lib/utils";

const textFriendlyExtensions = new Set(["csv", "json", "txt", "tsv", "log", "ndjson"]);

const confidenceBandStyles = {
  "Coach-ready":
    "border-cyan-300/20 bg-cyan-300/10 text-cyan-50 ring-1 ring-inset ring-cyan-300/15",
  "Partial mapping":
    "border-amber-300/20 bg-amber-300/10 text-amber-50 ring-1 ring-inset ring-amber-300/15",
  "Metadata only":
    "border-white/10 bg-white/6 text-slate-200 ring-1 ring-inset ring-white/8",
} satisfies Record<UploadedFileAnalysis["confidenceBand"], string>;

function getExtension(name: string) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts.at(-1) ?? "" : "";
}

async function readFileText(file: File) {
  const extension = getExtension(file.name);
  const canReadAsText =
    file.type.startsWith("text/") ||
    file.type.includes("json") ||
    textFriendlyExtensions.has(extension);

  if (!canReadAsText) {
    return undefined;
  }

  try {
    return await file.text();
  } catch {
    return undefined;
  }
}

function MetricTile({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="border-l border-white/10 pl-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">{helper}</p>
    </div>
  );
}

export function AnalysisDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<UploadedFileAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  // True once the analyzed file has been stored for the dashboard pages
  const [savedForDashboard, setSavedForDashboard] = useState(false);

  async function processFile(file: File) {
    setError(null);
    setIsAnalyzing(true);

    try {
      const text = await readFileText(file);
      const result = analyzeSessionUpload({
        name: file.name,
        type: file.type,
        size: file.size,
        text,
      });

      await new Promise((resolve) => window.setTimeout(resolve, 720));
      setAnalysis(result);
      // Files with usable impacts become the active session on the dashboard
      setSavedForDashboard(Boolean(saveUploadedSession(result)));
    } catch {
      setError("That file could not be analyzed cleanly. Try a CSV, JSON, or tabular text export.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function openPicker(event?: MouseEvent<HTMLButtonElement>) {
    event?.stopPropagation();
    inputRef.current?.click();
  }

  async function loadDemoFile(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    const csv = buildDemoUploadCsv();
    const file = new File([csv], "neurotrack-demo-session.csv", {
      type: "text/csv",
    });

    await processFile(file);
  }

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) {
      return;
    }

    await processFile(file);
  }

  async function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    await handleFiles(event.target.files);
    event.target.value = "";
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    await handleFiles(event.dataTransfer.files);
  }

  return (
    <SectionSurface
      eyebrow="Session intake"
      title="Analyze a session export"
      description="Upload a fresh export to surface athlete load, higher-confidence events, and parser readiness in one pass."
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleInputChange}
      />

      <div className="grid gap-5 xl:grid-cols-[1.04fr_0.96fr]">
        <div className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => openPicker()}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openPicker();
              }
            }}
            className={cn(
              "group rounded-lg border border-dashed px-6 py-6 transition duration-200",
              isDragging
                ? "border-cyan-300/45 bg-cyan-300/8 shadow-[0_0_0_1px_rgba(103,232,249,0.14)]"
                : "border-white/10 bg-white/[0.02] hover:border-cyan-300/25 hover:bg-white/[0.035]",
            )}
          >
            <div className="space-y-5">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/6 px-3 py-1.5 text-sm text-slate-200">
                  <ScanSearch className="h-4 w-4 text-cyan-200" />
                  CSV and JSON ready
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    Drop in a session export and get the coach brief immediately.
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                    CSV event logs and JSON session metadata are parsed right away. Other files are
                    still accepted, profiled, and staged for the next adapter.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton
                  emphasis="primary"
                  icon={<FileUp className="h-4 w-4" />}
                  onClick={openPicker}
                >
                  Choose file
                </ActionButton>
                <ActionButton
                  emphasis="secondary"
                  icon={<Sparkles className="h-4 w-4" />}
                  onClick={loadDemoFile}
                >
                  Use demo CSV
                </ActionButton>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/8 pt-4 text-sm text-slate-400">
                <span className="text-slate-300">
                  Primary support: CSV, JSON
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-600" />
                <span>Staged support: TSV, TXT, XLSX, ZIP, BIN</span>
              </div>
            </div>
          </div>

          {error ? (
            <div className="inline-flex items-center gap-2 rounded-lg border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-sm text-rose-50">
              <TriangleAlert className="h-4 w-4" />
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-white/8 bg-white/[0.02] p-5 md:p-6">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <LoaderCircle className="h-5 w-5 animate-spin text-cyan-200" />
                  Analyzing file structure and coach-facing risk signals...
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-lg border border-white/8 bg-white/[0.04]"
                    />
                  ))}
                </div>
                <div className="h-32 animate-pulse rounded-lg border border-white/8 bg-white/[0.04]" />
              </motion.div>
            ) : analysis ? (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                      Latest intake
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-white">
                      {analysis.fileName}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {analysis.detectedFormat} | {analysis.sizeLabel} | {analysis.ingestRoute}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium",
                      confidenceBandStyles[analysis.confidenceBand],
                    )}
                  >
                    {analysis.confidenceBand}
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-200">{analysis.note}</p>

                {savedForDashboard ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-300/20 bg-cyan-300/8 px-4 py-3">
                    <p className="text-sm text-cyan-50">
                      Saved in this browser. The dashboard, athlete pages, and summary now show
                      this session.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
                      >
                        Open dashboard
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/session-summary"
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/[0.07]"
                      >
                        Session summary
                      </Link>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricTile
                    label="Accepted events"
                    value={String(analysis.acceptedEvents)}
                    helper={`${analysis.totalRows} rows inspected`}
                  />
                  <MetricTile
                    label="High-confidence"
                    value={String(analysis.highConfidenceAlerts)}
                    helper="Escalated events surfaced from the upload"
                  />
                  <MetricTile
                    label="Athletes surfaced"
                    value={String(analysis.playersDetected)}
                    helper="Unique athletes recognized in the file"
                  />
                  <MetricTile
                    label="Review group"
                    value={String(analysis.playersRecommended)}
                    helper={
                      analysis.strongestEvent
                        ? `Strongest event ${analysis.strongestEvent} g`
                        : "Waiting for mapped intensity fields"
                    }
                  />
                </div>

                <div className="grid gap-6 border-t border-white/8 pt-5 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <FileSearch className="h-4 w-4 text-cyan-200" />
                      Athletes surfaced from the upload
                    </div>

                    {analysis.topAthletes.length ? (
                      <div className="space-y-3">
                        {analysis.topAthletes.map((athlete) => (
                          <div
                            key={athlete.playerId}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-white">
                                {athlete.playerName}
                                {athlete.jerseyNumber ? ` #${athlete.jerseyNumber}` : ""}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {athlete.events} events | strongest {athlete.strongestEvent} g
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right text-xs text-slate-400">
                                <p>Load index {athlete.cumulativeExposureScore}</p>
                                <p>{athlete.highConfidenceEvents} high-confidence</p>
                              </div>
                              <CoachStatusPill status={athlete.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-white/8 bg-white/[0.025] p-4">
                        <p className="text-sm text-slate-300">
                          Athlete rows will appear here once the file includes player and intensity
                          fields.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-medium text-slate-200">Direction mix</p>
                      {analysis.directionMix.length ? (
                        <div className="mt-3 space-y-3 rounded-lg border border-white/8 bg-white/[0.025] p-4">
                          {analysis.directionMix.map((item) => {
                            const maxValue = Math.max(
                              ...analysis.directionMix.map((entry) => entry.value),
                            );
                            const width = maxValue ? (item.value / maxValue) * 100 : 0;

                            return (
                              <div key={item.label} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                  <span>{item.label}</span>
                                  <span>{item.value}</span>
                                </div>
                                <div className="h-2 rounded-full bg-white/6">
                                  <div
                                    className="h-full rounded-full bg-cyan-300 transition-[width]"
                                    style={{ width: `${width}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          Direction distribution appears once structured events are detected.
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-200">Parser notes</p>
                      {analysis.issues.length ? (
                        <div className="mt-3 space-y-2">
                          {analysis.issues.map((issue) => (
                            <div
                              key={issue}
                              className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-sm leading-6 text-slate-300"
                            >
                              {issue}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          Core fields mapped cleanly. This file is ready for a full session import.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-200">Recognized fields</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.recognizedColumns.length ? (
                      analysis.recognizedColumns.map((column) => (
                        <span
                          key={column}
                          className="rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-slate-300"
                        >
                          {column}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-slate-400">
                        Waiting for mapped fields
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-5 text-slate-500">{analysis.helperText}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <EmptyState
                  title="No file analyzed yet"
                  body="Drop a session file here to surface athlete load, higher-confidence events, and parser readiness before a full import."
                  icon="activity"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionSurface>
  );
}
