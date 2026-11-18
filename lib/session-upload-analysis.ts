import {
  defaultDashboardSessionId,
  impactEvents,
  monitorThreshold,
  reviewThreshold,
  type EventDirection,
  type PlayerStatus,
} from "@/lib/neurotrack-data";

type UploadedRow = Record<string, string>;

// Samples closer together than this (same athlete) are treated as one impact.
// The headband streams at 100 Hz, so a single hit usually spans 3-5 rows.
export const impactMergeWindowMs = 100;

// The BNO055 locks its accelerometer to +/-4 g in fusion (NDOF) mode, so
// readings near 4 g are probably clipped and the true peak may be higher.
const sensorLimitG = 4;

export type UploadedEvent = {
  playerId: string;
  playerName: string;
  jerseyNumber?: number;
  sessionId?: string;
  timestamp?: string;
  // Milliseconds used for ordering and merging (device clock or parsed timestamp)
  timeMs?: number;
  eventIntensity: number;
  eventDirection: EventDirection;
  eventType: string;
  confidenceScore: number;
  confidenceLevel: "Low" | "Medium" | "High";
  cumulativeExposureScore: number;
  loadValue: number;
  status: PlayerStatus;
  // Number of raw sensor rows folded into this impact (1 when not merged)
  samplesMerged: number;
  // True when the reading sits at the sensor's 4 g ceiling
  atSensorLimit: boolean;
};

type UploadedAthlete = {
  playerId: string;
  playerName: string;
  jerseyNumber?: number;
  events: number;
  strongestEvent: number;
  highConfidenceEvents: number;
  cumulativeExposureScore: number;
  status: PlayerStatus;
};

type UploadMetadata = {
  sessionId?: string;
  playerName?: string;
  playerId?: string;
  thresholdG?: number;
  totalEvents?: number;
  metadataFields: string[];
};

type ParsedUpload = {
  columns: string[];
  rows: UploadedRow[];
  metadata?: UploadMetadata;
};

export type UploadConfidenceBand =
  | "Coach-ready"
  | "Partial mapping"
  | "Metadata only";

export type UploadedFileAnalysis = {
  fileName: string;
  detectedFormat: string;
  sizeLabel: string;
  ingestRoute: string;
  confidenceBand: UploadConfidenceBand;
  acceptedEvents: number;
  totalRows: number;
  playersDetected: number;
  highConfidenceAlerts: number;
  playersRecommended: number;
  strongestEvent: number | null;
  recognizedColumns: string[];
  issues: string[];
  topAthletes: UploadedAthlete[];
  directionMix: Array<{ label: EventDirection; value: number }>;
  note: string;
  helperText: string;
  // Full list of accepted impacts, used to build the dashboard from this upload
  events: UploadedEvent[];
  sessionId?: string;
};

type UploadInput = {
  name: string;
  type: string;
  size: number;
  text?: string;
};

const fieldAliases = {
  playerId: [
    "playerid",
    "athleteid",
    "player_id",
    "athlete_id",
    "id",
    "playeresp32",
  ],
  playerName: [
    "playername",
    "athletename",
    "player_name",
    "athlete_name",
    "player",
    "athlete",
    "name",
    "playerpython",
  ],
  jerseyNumber: ["jerseynumber", "jersey", "number", "shirt"],
  timestamp: [
    "timestamp",
    "time",
    "datetime",
    "date",
    "eventtime",
    "event_time",
  ],
  sessionId: ["sessionid", "session", "session_id"],
  // Device clock in ms (head_impact_receiver.py writes esp32_timestamp_ms)
  deviceTimeMs: ["esp32timestampms", "devicetimestampms", "timestampms", "devicetimems", "tms"],
  eventIntensity: [
    "eventintensity",
    "intensity",
    "g",
    "peakg",
    "gforce",
    "g_force",
    "peak_g",
    // head_impact_receiver.py column names
    "accelmagnitudeg",
    "magnitudeg",
    "peakaccelg",
    "linearaccelg",
  ],
  magnitudeMs2: [
    "magnitudems2",
    "magnitude",
    "magnitude_ms2",
    "accelms2",
    "accelmagnitudems2",
    "peakaccelms2",
  ],
  // Unit acceleration vector components in head axes (+X right, +Y forward, +Z up)
  directionX: ["directionx", "dirx", "unitx"],
  directionY: ["directiony", "diry", "unity"],
  directionZ: ["directionz", "dirz", "unitz"],
  eventDirection: [
    "eventdirection",
    "direction",
    "impactdirection",
    "impact_direction",
    "vector",
  ],
  eventType: ["eventtype", "event", "type", "event_type", "impacttype"],
  confidenceLevel: ["confidencelevel", "level", "alertlevel", "alert_level"],
  confidenceScore: [
    "confidencescore",
    "confidence_score",
    "probability",
    "score",
    "confidencepct",
    "confidence",
  ],
  cumulativeExposureScore: [
    "cumulativeexposurescore",
    "cumulativeexposure",
    "exposure",
    "exposurescore",
    "load",
    "loadscore",
    "cumulative_load",
    "sessionload",
    "loadindex",
  ],
  status: ["status", "coachstatus", "coach_status"],
} satisfies Record<string, string[]>;

const textExtensions = new Set(["csv", "json", "txt", "tsv", "log", "ndjson"]);
const structuredExtensions = new Set(["xlsx", "xls"]);
const likelyBinaryExtensions = new Set([
  "pdf",
  "mp4",
  "mov",
  "avi",
  "zip",
  "bin",
  "dat",
]);
const directionValues = [
  "Frontal",
  "Left lateral",
  "Right lateral",
  "Posterior",
  "Crown",
] as const;

function getExtension(name: string) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts.at(-1) ?? "" : "";
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeKey(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundImpact(value: number) {
  return value >= 10 ? Math.round(value) : Number(value.toFixed(3));
}

function parseNumber(input?: string) {
  if (!input) {
    return undefined;
  }

  const cleaned = input.replace(/[^0-9.\-]/g, "");
  if (!cleaned) {
    return undefined;
  }

  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function mapDirection(input?: string): EventDirection {
  const value = input?.toLowerCase() ?? "";

  if (value.includes("left")) {
    return "Left lateral";
  }

  if (value.includes("right")) {
    return "Right lateral";
  }

  if (
    value.includes("back") ||
    value.includes("rear") ||
    value.includes("posterior")
  ) {
    return "Posterior";
  }

  if (value.includes("crown") || value.includes("top")) {
    return "Crown";
  }

  if (
    value.includes("front") ||
    value.includes("frontal") ||
    value.includes("chin") ||
    value.includes("face")
  ) {
    return "Frontal";
  }

  return "Frontal";
}

// Converts an acceleration vector into the side of the head the hit came from.
// Axes follow the headband model: +X = right, +Y = forward, +Z = up.
// A hit pushes the head away from the contact point, so the impact side is
// opposite to the acceleration (a hit to the forehead accelerates the head backward).
function directionFromVector(x: number, y: number, z: number): EventDirection | undefined {
  const impact = { x: -x, y: -y, z: -z };
  const ax = Math.abs(impact.x);
  const ay = Math.abs(impact.y);
  const az = Math.abs(impact.z);

  if (ax === 0 && ay === 0 && az === 0) {
    return undefined;
  }

  // Pick the dominant axis of the impact direction
  if (ax >= ay && ax >= az) {
    return impact.x > 0 ? "Right lateral" : "Left lateral";
  }

  if (ay >= ax && ay >= az) {
    return impact.y > 0 ? "Frontal" : "Posterior";
  }

  // Contact from above is a crown hit; contact from below (chin) is grouped with frontal
  return impact.z > 0 ? "Crown" : "Frontal";
}

// Reads a millisecond time for ordering: the device clock first, then the timestamp text
function extractTimeMs(row: UploadedRow) {
  const deviceMs = parseNumber(getValue(row, "deviceTimeMs"));
  if (deviceMs !== undefined) {
    return deviceMs;
  }

  const stamp = getValue(row, "timestamp");
  if (!stamp) {
    return undefined;
  }

  const parsed = Date.parse(stamp);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getStatus(score: number): PlayerStatus {
  if (score >= reviewThreshold) {
    return "Review Recommended";
  }

  if (score >= monitorThreshold) {
    return "Monitor";
  }

  return "Normal";
}

function normalizeIntensity(value: number) {
  if (value > 12) {
    return clamp(value / 90, 0, 1);
  }

  return clamp(value / 5.5, 0, 1);
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function parseConfidence(
  levelValue?: string,
  scoreValue?: string,
  intensity?: number,
): Pick<UploadedEvent, "confidenceLevel" | "confidenceScore"> {
  const explicitScore = parseNumber(scoreValue);
  const numericLevelScore = parseNumber(levelValue);
  const normalizedLevel = numericLevelScore === undefined ? (levelValue ?? "").toLowerCase() : "";

  let confidenceScore = explicitScore ?? numericLevelScore;
  let confidenceLevel: UploadedEvent["confidenceLevel"] = "Low";

  if (normalizedLevel.includes("high")) {
    confidenceLevel = "High";
  } else if (
    normalizedLevel.includes("med") ||
    normalizedLevel.includes("moderate")
  ) {
    confidenceLevel = "Medium";
  } else if (normalizedLevel.includes("low")) {
    confidenceLevel = "Low";
  }

  if (confidenceScore !== undefined && confidenceScore > 1) {
    confidenceScore = confidenceScore / 100;
  }

  if (confidenceScore === undefined) {
    const severity = intensity ? normalizeIntensity(intensity) : 0.35;
    confidenceScore = 0.38 + severity * 0.52;
  }

  confidenceScore = clamp(confidenceScore, 0, 0.99);

  if (confidenceScore >= 0.82) {
    confidenceLevel = "High";
  } else if (confidenceScore >= 0.64) {
    confidenceLevel = "Medium";
  } else {
    confidenceLevel = "Low";
  }

  return { confidenceLevel, confidenceScore };
}

function parseStatus(input?: string) {
  const value = input?.toLowerCase() ?? "";

  if (value.includes("review")) {
    return "Review Recommended" as const;
  }

  if (value.includes("monitor")) {
    return "Monitor" as const;
  }

  if (value.includes("normal")) {
    return "Normal" as const;
  }

  return undefined;
}

function inferFormat(input: UploadInput) {
  const extension = getExtension(input.name);
  const mime = input.type.toLowerCase();

  if (extension === "json" || mime.includes("json")) {
    return "JSON";
  }

  if (extension === "csv" || mime.includes("csv")) {
    return "CSV";
  }

  if (extension === "tsv") {
    return "Delimited text";
  }

  if (structuredExtensions.has(extension)) {
    return "Spreadsheet export";
  }

  if (likelyBinaryExtensions.has(extension)) {
    return "Binary export";
  }

  if (extension === "log" || extension === "txt") {
    return "Text log";
  }

  return input.text?.trim() ? "Session file" : "Unknown file";
}

function getMatchedKey(column: string, target: keyof typeof fieldAliases) {
  const normalizedColumn = normalizeKey(column);
  return fieldAliases[target].includes(normalizedColumn);
}

function getValue(row: UploadedRow, target: keyof typeof fieldAliases) {
  const entries = Object.entries(row);
  const match = entries.find(([key]) => getMatchedKey(key, target));
  return match?.[1];
}

function pickDelimitedSeparator(text: string) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const candidates = [",", "\t", ";", "|"];

  return candidates.reduce(
    (best, candidate) => {
      const count = firstLine.split(candidate).length;
      return count > best.count ? { separator: candidate, count } : best;
    },
    { separator: ",", count: 0 },
  ).separator;
}

function parseDelimitedText(text: string, separator: string) {
  const rows: string[][] = [];
  let current = "";
  let line: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === separator) {
      line.push(current.trim());
      current = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      if (current.length || line.length) {
        line.push(current.trim());
        rows.push(line);
      }

      current = "";
      line = [];
      continue;
    }

    current += char;
  }

  if (current.length || line.length) {
    line.push(current.trim());
    rows.push(line);
  }

  const [headerRow, ...valueRows] = rows.filter((row) =>
    row.some((cell) => cell.length > 0),
  );

  if (!headerRow?.length) {
    return { columns: [], rows: [] as UploadedRow[] };
  }

  const columns = headerRow.map((header, index) => header || `column_${index + 1}`);
  const parsedRows = valueRows
    .map((row) =>
      Object.fromEntries(columns.map((column, index) => [column, row[index] ?? ""])),
    )
    .filter((row) => Object.values(row).some(Boolean));

  return { columns, rows: parsedRows };
}

function parseJsonPayload(text: string): ParsedUpload {
  const parsed = JSON.parse(text) as unknown;

  if (Array.isArray(parsed)) {
    const rows = parsed
      .filter(
        (entry): entry is Record<string, unknown> =>
          typeof entry === "object" && entry !== null && !Array.isArray(entry),
      )
      .map((record) =>
        Object.fromEntries(
          Object.entries(record).map(([key, value]) => [
            key,
            value === null || value === undefined ? "" : String(value),
          ]),
        ),
      );

    return {
      rows,
      columns: Array.from(new Set(rows.flatMap((row) => Object.keys(row)).filter(Boolean))),
    };
  }

  if (parsed && typeof parsed === "object") {
    const record = parsed as Record<string, unknown>;
    const arrayEntry = Object.values(record).find(
      (value) =>
        Array.isArray(value) &&
        value.every(
          (entry) => typeof entry === "object" && entry !== null && !Array.isArray(entry),
        ),
    );

    const metadataFields = Object.entries(record)
      .filter(([, value]) => !Array.isArray(value) && typeof value !== "object")
      .map(([key]) => key);
    const metadata = {
      sessionId:
        typeof record.session_id === "string" ? record.session_id : undefined,
      playerName:
        typeof record.player_python === "string"
          ? record.player_python
          : typeof record.player_esp32 === "string"
            ? record.player_esp32
            : undefined,
      playerId:
        typeof record.player_esp32 === "string"
          ? record.player_esp32
          : typeof record.player_python === "string"
            ? record.player_python
            : undefined,
      thresholdG:
        typeof record.threshold_g === "number"
          ? record.threshold_g
          : parseNumber(String(record.threshold_g ?? "")),
      totalEvents:
        typeof record.total_events === "number"
          ? record.total_events
          : parseNumber(String(record.total_events ?? "")),
      metadataFields,
    } satisfies UploadMetadata;

    if (Array.isArray(arrayEntry)) {
      const rows = arrayEntry.map((entry) =>
        Object.fromEntries(
          Object.entries(entry).map(([key, value]) => [
            key,
            value === null || value === undefined ? "" : String(value),
          ]),
        ),
      );

      return {
        rows,
        columns: Array.from(new Set(rows.flatMap((row) => Object.keys(row)).filter(Boolean))),
        metadata,
      };
    }

    return { rows: [], columns: [], metadata };
  }

  return { rows: [], columns: [] };
}

function parseUpload(input: UploadInput, detectedFormat: string): ParsedUpload {
  if (detectedFormat === "JSON") {
    return parseJsonPayload(input.text ?? "");
  }

  const separator =
    detectedFormat === "Delimited text" ? "\t" : pickDelimitedSeparator(input.text ?? "");
  const parsed = parseDelimitedText(input.text ?? "", separator);
  return { rows: parsed.rows, columns: parsed.columns };
}

function extractIntensity(row: UploadedRow) {
  const primary = parseNumber(getValue(row, "eventIntensity"));
  if (primary !== undefined) {
    return primary;
  }

  const magnitudeMs2 = parseNumber(getValue(row, "magnitudeMs2"));
  if (magnitudeMs2 !== undefined) {
    return magnitudeMs2 / 9.80665;
  }

  return undefined;
}

function extractDirection(row: UploadedRow): EventDirection {
  // A text label (e.g. "Frontal") wins when the file has one
  const label = getValue(row, "eventDirection");
  if (label?.trim()) {
    return mapDirection(label);
  }

  // Otherwise derive the label from the x/y/z acceleration direction
  const x = parseNumber(getValue(row, "directionX"));
  const y = parseNumber(getValue(row, "directionY"));
  const z = parseNumber(getValue(row, "directionZ"));
  if (x !== undefined && y !== undefined && z !== undefined) {
    return directionFromVector(x, y, z) ?? "Frontal";
  }

  return "Frontal";
}

function normalizeEvent(
  row: UploadedRow,
  fallbackPlayerName?: string,
): UploadedEvent | undefined {
  // Single-headband logs often have no player column, so fall back to the
  // athlete named in the session metadata (or a generic wearer label)
  const playerName =
    getValue(row, "playerName")?.trim() ||
    getValue(row, "playerId")?.trim() ||
    fallbackPlayerName;
  const playerId =
    getValue(row, "playerId")?.trim() || (playerName ? slugify(playerName) : "");
  const intensity = extractIntensity(row);

  if (!playerName || !playerId || intensity === undefined) {
    return undefined;
  }

  const loadValue =
    parseNumber(getValue(row, "cumulativeExposureScore")) ?? intensity;
  const confidence = parseConfidence(
    getValue(row, "confidenceLevel"),
    getValue(row, "confidenceScore"),
    intensity,
  );
  const eventLoadContribution = normalizeIntensity(intensity) * (0.55 + confidence.confidenceScore * 0.45);
  const cumulativeExposureScore = Math.max(
    1,
    Math.round(eventLoadContribution * 100),
  );
  const status =
    parseStatus(getValue(row, "status")) ?? getStatus(cumulativeExposureScore);

  return {
    playerId,
    playerName,
    jerseyNumber: parseNumber(getValue(row, "jerseyNumber")),
    sessionId: getValue(row, "sessionId")?.trim() || undefined,
    timestamp: getValue(row, "timestamp"),
    timeMs: extractTimeMs(row),
    eventIntensity: roundImpact(intensity),
    eventDirection: extractDirection(row),
    eventType: getValue(row, "eventType")?.trim() || "Headband impact",
    confidenceScore: confidence.confidenceScore,
    confidenceLevel: confidence.confidenceLevel,
    cumulativeExposureScore,
    loadValue,
    status,
    samplesMerged: 1,
    atSensorLimit: false,
  } satisfies UploadedEvent;
}

// Folds consecutive above-threshold samples from one hit into a single impact.
// The receiver logs every 10 ms sample above threshold, so one header can
// appear as several rows; keeping only the peak row stops double counting.
function mergeImpactSamples(events: UploadedEvent[]) {
  const byPlayer = new Map<string, UploadedEvent[]>();
  for (const event of events) {
    const list = byPlayer.get(event.playerId) ?? [];
    list.push(event);
    byPlayer.set(event.playerId, list);
  }

  const merged: UploadedEvent[] = [];

  for (const list of byPlayer.values()) {
    // Without timing we cannot tell samples apart, so leave rows as they are
    if (list.some((event) => event.timeMs === undefined)) {
      merged.push(...list);
      continue;
    }

    const ordered = [...list].sort((a, b) => (a.timeMs ?? 0) - (b.timeMs ?? 0));
    let cluster: UploadedEvent[] = [];

    const flush = () => {
      if (!cluster.length) {
        return;
      }
      // Keep the strongest sample of the cluster as the impact
      const peak = cluster.reduce((best, event) =>
        event.eventIntensity > best.eventIntensity ? event : best,
      );
      merged.push({ ...peak, samplesMerged: cluster.length });
      cluster = [];
    };

    for (const event of ordered) {
      const previous = cluster.at(-1);
      if (previous && (event.timeMs ?? 0) - (previous.timeMs ?? 0) > impactMergeWindowMs) {
        flush();
      }
      cluster.push(event);
    }
    flush();
  }

  return merged.sort((a, b) => (a.timeMs ?? 0) - (b.timeMs ?? 0));
}

// Flags impacts that sit at the BNO055's 4 g ceiling. Only applied when the
// whole file stays under ~4.2 g, i.e. it came from the fusion-mode headband
// rather than a high-g accelerometer.
function flagSensorLimit(events: UploadedEvent[]) {
  const strongest = Math.max(0, ...events.map((event) => event.eventIntensity));
  if (strongest > sensorLimitG * 1.05) {
    return events;
  }

  return events.map((event) => ({
    ...event,
    atSensorLimit: event.eventIntensity >= sensorLimitG * 0.975,
  }));
}

export function computeAthleteLoadIndex(events: UploadedEvent[]) {
  const normalizedImpacts = events.map((event) => normalizeIntensity(event.eventIntensity));
  const weightedSeverity = events.reduce((total, event) => {
    const severity = normalizeIntensity(event.eventIntensity);
    return total + severity * (0.55 + event.confidenceScore * 0.45);
  }, 0);
  const highConfidenceRatio =
    events.filter((event) => event.confidenceLevel === "High").length / events.length;
  const repeatedLoadFactor = Math.min(
    events.length / (events.some((event) => event.eventIntensity > 12) ? 18 : 32),
    1,
  );

  return Math.round(
    clamp(
      weightedSeverity / (events.some((event) => event.eventIntensity > 12) ? 2.6 : 4.4) +
        average(normalizedImpacts) * 18 +
        Math.max(...normalizedImpacts) * 18 +
        highConfidenceRatio * 12 +
        repeatedLoadFactor * 10,
      0,
      100,
    ),
  );
}

function buildAthleteSummaries(events: UploadedEvent[]) {
  const eventsByAthlete = new Map<string, UploadedEvent[]>();

  for (const event of events) {
    const current = eventsByAthlete.get(event.playerId) ?? [];
    current.push(event);
    eventsByAthlete.set(event.playerId, current);
  }

  return Array.from(eventsByAthlete.entries())
    .map(([playerId, playerEvents]) => {
      const firstEvent = playerEvents[0];
      const strongestEvent = Math.max(...playerEvents.map((event) => event.eventIntensity));
      const loadIndex = computeAthleteLoadIndex(playerEvents);

      return {
        playerId,
        playerName: firstEvent.playerName,
        jerseyNumber: firstEvent.jerseyNumber,
        events: playerEvents.length,
        strongestEvent: roundImpact(strongestEvent),
        highConfidenceEvents: playerEvents.filter(
          (event) => event.confidenceLevel === "High",
        ).length,
        cumulativeExposureScore: loadIndex,
        status: getStatus(loadIndex),
      } satisfies UploadedAthlete;
    })
    .sort(
      (left, right) =>
        right.cumulativeExposureScore - left.cumulativeExposureScore ||
        right.strongestEvent - left.strongestEvent,
    );
}

function buildDirectionMix(events: UploadedEvent[]) {
  const counts = new Map<EventDirection, number>();

  for (const direction of directionValues) {
    counts.set(direction, 0);
  }

  for (const event of events) {
    counts.set(event.eventDirection, (counts.get(event.eventDirection) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([, value]) => value > 0)
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value);
}

function buildMetadataAnalysis(
  input: UploadInput,
  detectedFormat: string,
  issues: string[],
): UploadedFileAnalysis {
  const route =
    detectedFormat === "Spreadsheet export"
      ? "Structured file queued for parser adapter"
      : detectedFormat === "Binary export"
        ? "Binary export queued for offline analysis"
        : "Metadata intake only";

  return {
    fileName: input.name,
    detectedFormat,
    sizeLabel: formatFileSize(input.size),
    ingestRoute: route,
    confidenceBand: "Metadata only",
    acceptedEvents: 0,
    totalRows: 0,
    playersDetected: 0,
    highConfidenceAlerts: 0,
    playersRecommended: 0,
    strongestEvent: null,
    recognizedColumns: [],
    issues: issues.length
      ? issues
      : [
          "This file type is accepted, but the intake parser still needs mapped event fields before athlete-level analysis can run.",
        ],
    topAthletes: [],
    directionMix: [],
    note: "File staged successfully. Add mapped event fields to unlock coach-facing analysis.",
    helperText:
      "CSV and JSON files with event rows are parsed immediately. Other exports are profiled and staged for the next analysis step.",
    events: [],
  };
}

function buildMetadataSummary(
  input: UploadInput,
  detectedFormat: string,
  metadata: UploadMetadata,
): UploadedFileAnalysis {
  const playerLabel = metadata.playerName ?? metadata.playerId ?? "Session metadata";
  const thresholdText =
    metadata.thresholdG !== undefined ? `Threshold ${metadata.thresholdG.toFixed(3)} g.` : "";

  return {
    fileName: input.name,
    detectedFormat,
    sizeLabel: formatFileSize(input.size),
    ingestRoute: "Session metadata summary",
    confidenceBand: "Partial mapping",
    acceptedEvents: metadata.totalEvents ?? 0,
    totalRows: 0,
    playersDetected: metadata.playerName || metadata.playerId ? 1 : 0,
    highConfidenceAlerts: 0,
    playersRecommended: 0,
    strongestEvent: null,
    recognizedColumns: metadata.metadataFields,
    issues: [
      "This JSON file contains session metadata only. Upload the paired CSV log for athlete ranking, direction mix, and review status.",
    ],
    topAthletes:
      metadata.playerName || metadata.playerId
        ? [
            {
              playerId: metadata.playerId ?? slugify(playerLabel),
              playerName: playerLabel,
              events: metadata.totalEvents ?? 0,
              strongestEvent: 0,
              highConfidenceEvents: 0,
              cumulativeExposureScore: 0,
              status: "Normal",
            },
          ]
        : [],
    directionMix: [],
    note: `${playerLabel} metadata loaded successfully. ${thresholdText}`.trim(),
    helperText:
      "Metadata uploads are useful for session context, but the CSV event log is still needed for coach-facing risk analysis.",
    events: [],
    sessionId: metadata.sessionId,
  };
}

export function analyzeSessionUpload(input: UploadInput): UploadedFileAnalysis {
  const detectedFormat = inferFormat(input);
  const extension = getExtension(input.name);
  const text = input.text?.trim() ?? "";

  if (!text && (structuredExtensions.has(extension) || likelyBinaryExtensions.has(extension))) {
    return buildMetadataAnalysis(input, detectedFormat, []);
  }

  if (!text && !textExtensions.has(extension)) {
    return buildMetadataAnalysis(input, detectedFormat, [
      "No text payload was available for parsing. The file was accepted and staged for a future adapter.",
    ]);
  }

  let parsed: ParsedUpload;

  try {
    parsed = parseUpload(input, detectedFormat);
  } catch {
    return buildMetadataAnalysis(input, detectedFormat, [
      "The file could not be parsed cleanly. It has been accepted and staged for manual mapping.",
    ]);
  }

  if (!parsed.rows.length && parsed.metadata) {
    return buildMetadataSummary(input, detectedFormat, parsed.metadata);
  }

  if (!parsed.rows.length) {
    return buildMetadataAnalysis(input, detectedFormat, [
      "No structured rows were detected in the file. Add a header row or JSON event array to generate a coach summary.",
    ]);
  }

  const recognizedColumns = Object.keys(fieldAliases).filter((field) =>
    parsed.columns.some((column) => getMatchedKey(column, field as keyof typeof fieldAliases)),
  );
  const hasPlayerColumn =
    recognizedColumns.includes("playerName") || recognizedColumns.includes("playerId");
  // A one-headband log with no player column is still usable: attribute it to one wearer
  const fallbackPlayerName = hasPlayerColumn
    ? undefined
    : parsed.metadata?.playerName ?? "Headband wearer";
  const rawEvents = parsed.rows
    .map((row) => normalizeEvent(row, fallbackPlayerName))
    .filter((event): event is UploadedEvent => Boolean(event));
  // Collapse repeated samples from the same hit, then flag clipped readings
  const normalizedEvents = flagSensorLimit(mergeImpactSamples(rawEvents));
  const mergedSampleCount = rawEvents.length - normalizedEvents.length;
  const sensorLimitCount = normalizedEvents.filter((event) => event.atSensorLimit).length;
  const issues: string[] = [];

  if (!hasPlayerColumn) {
    issues.push(
      rawEvents.length
        ? `No player column was found, so every impact is assigned to "${fallbackPlayerName}". Add playerName to rank several athletes.`
        : "Player identifiers were not mapped. Add playerName or playerId to rank athletes.",
    );
  }

  if (mergedSampleCount > 0) {
    issues.push(
      `${rawEvents.length} above-threshold samples were merged into ${normalizedEvents.length} impacts (samples within ${impactMergeWindowMs} ms count as one hit).`,
    );
  }

  if (sensorLimitCount > 0) {
    issues.push(
      `${sensorLimitCount} impact${sensorLimitCount === 1 ? "" : "s"} reached about ${sensorLimitG} g, the BNO055's limit in fusion mode. The true peak may be higher.`,
    );
  }

  if (
    !recognizedColumns.includes("eventDirection") &&
    recognizedColumns.includes("directionX")
  ) {
    issues.push(
      "Impact side was derived from direction_x/y/z assuming head axes (+X right, +Y forward, +Z up). Raw sensor-frame vectors need a tare before these labels are reliable.",
    );
  }

  if (!recognizedColumns.includes("eventIntensity") && !recognizedColumns.includes("magnitudeMs2")) {
    issues.push(
      "Event intensity was not detected. Add eventIntensity, g, or magnitude_ms2 to unlock alert scoring.",
    );
  }

  if (!recognizedColumns.includes("timestamp")) {
    issues.push("Timestamp was not detected. Session ordering will stay approximate.");
  }

  if (!recognizedColumns.includes("confidenceScore") && !recognizedColumns.includes("confidenceLevel")) {
    issues.push(
      "Confidence values were inferred. Add a confidence or confidenceScore column for cleaner coach triage.",
    );
  }

  if (!recognizedColumns.includes("cumulativeExposureScore")) {
    issues.push(
      "Session load index was inferred from repeated event intensity and confidence because no direct load column was found.",
    );
  }

  const athletes = buildAthleteSummaries(normalizedEvents);
  const highConfidenceAlerts = normalizedEvents.filter(
    (event) => event.confidenceLevel === "High",
  ).length;
  const playersRecommended = athletes.filter(
    (athlete) => athlete.status === "Review Recommended",
  ).length;
  const strongestEvent =
    normalizedEvents.length > 0
      ? Math.max(...normalizedEvents.map((event) => event.eventIntensity))
      : null;
  const confidenceBand: UploadConfidenceBand =
    normalizedEvents.length >= 5 && recognizedColumns.length >= 4
      ? "Coach-ready"
      : normalizedEvents.length >= 1 || recognizedColumns.length >= 3
        ? "Partial mapping"
        : "Metadata only";

  const ingestRoute =
    confidenceBand === "Coach-ready"
      ? "Client-side session analysis"
      : confidenceBand === "Partial mapping"
        ? "Partial coach summary with inferred fields"
        : "Metadata intake only";

  const note =
    normalizedEvents.length === 0
      ? "File accepted, but more event fields are needed before the dashboard can recommend a coaching response."
      : playersRecommended > 0
        ? `${playersRecommended} athlete${playersRecommended === 1 ? "" : "s"} surfaced for closer review from the uploaded file.`
        : highConfidenceAlerts > 0
          ? "Uploaded session contains higher-confidence rows, but overall cumulative load remains below the current review threshold."
          : "Uploaded session load looks manageable against the current coach thresholds.";

  return {
    fileName: input.name,
    detectedFormat,
    sizeLabel: formatFileSize(input.size),
    ingestRoute,
    confidenceBand,
    acceptedEvents: normalizedEvents.length,
    totalRows: parsed.rows.length,
    playersDetected: athletes.length,
    highConfidenceAlerts,
    playersRecommended,
    strongestEvent: strongestEvent !== null ? roundImpact(strongestEvent) : null,
    recognizedColumns: [
      ...recognizedColumns,
      ...(parsed.metadata?.metadataFields ?? []),
    ].filter((value, index, array) => array.indexOf(value) === index),
    issues,
    topAthletes: athletes.slice(0, 4),
    directionMix: buildDirectionMix(normalizedEvents),
    note,
    helperText:
      "Reads headband receiver logs and coach exports, merges repeated samples from one hit, and builds the review signal from cumulative session load.",
    events: normalizedEvents,
    sessionId:
      parsed.metadata?.sessionId ??
      normalizedEvents.find((event) => event.sessionId)?.sessionId,
  };
}

export function buildDemoUploadCsv() {
  const headers = [
    "playerName",
    "jerseyNumber",
    "sessionId",
    "timestamp",
    "eventIntensity",
    "eventDirection",
    "eventType",
    "confidenceLevel",
    "confidenceScore",
    "cumulativeExposureScore",
    "status",
  ];
  const sampleRows = impactEvents
    .filter((event) => event.sessionId === defaultDashboardSessionId())
    .slice(6, 16);

  return [
    headers.join(","),
    ...sampleRows.map((event) =>
      [
        event.playerName,
        String(event.jerseyNumber),
        event.sessionId,
        event.timestamp,
        String(event.eventIntensity),
        event.eventDirection,
        event.eventType,
        event.confidenceLevel,
        event.confidenceScore.toFixed(2),
        String(event.cumulativeExposureScore),
        event.status,
      ]
        .map((value) => `"${value.replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n");
}
