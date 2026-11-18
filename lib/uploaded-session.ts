// Keeps sessions uploaded on the intake page in this browser and turns them
// into the same bundles the dashboard, athlete, and summary pages already use.
// Nothing leaves the browser: sessions live in localStorage only.

import { useSyncExternalStore } from "react";

import {
  monitorThreshold,
  reviewThreshold,
  type AlertSummary,
  type AthleteDetailBundle,
  type DashboardBundle,
  type EventDirection,
  type ImpactEvent,
  type PlayerStatus,
  type PlayerSummary,
  type Session,
  type SessionSummaryBundle,
  type Team,
  type TimelinePoint,
} from "@/lib/neurotrack-data";
import {
  computeAthleteLoadIndex,
  type UploadedEvent,
  type UploadedFileAnalysis,
} from "@/lib/session-upload-analysis";

export type StoredSession = {
  id: string;
  label: string;
  fileName: string;
  uploadedAt: string;
  events: UploadedEvent[];
};

export type UploadStore = {
  // Session shown on the dashboard; null means "show demo data"
  activeId: string | null;
  // Oldest first, so earlier sessions act as each athlete's baseline
  sessions: StoredSession[];
};

const storageKey = "neurotrack.uploaded-sessions.v1";
const changeEvent = "neurotrack-uploads-changed";
const maxStoredSessions = 20;
const emptyStore: UploadStore = { activeId: null, sessions: [] };

const uploadTeam: Team = {
  id: "uploaded",
  name: "Headband sessions",
  shortName: "Uploaded",
  level: "Device export",
};

// ---------------------------------------------------------------------------
// Storage (wrapped in try/catch: storage can be full, blocked, or unavailable)
// ---------------------------------------------------------------------------

let cachedRaw: string | null = null;
let cachedStore: UploadStore = emptyStore;

function readStore(): UploadStore {
  try {
    const raw = window.localStorage.getItem(storageKey);
    // Return the same object while the stored text is unchanged so React
    // does not re-render on every read
    if (raw === cachedRaw) {
      return cachedStore;
    }
    cachedRaw = raw;
    cachedStore = raw ? (JSON.parse(raw) as UploadStore) : emptyStore;
  } catch {
    cachedStore = emptyStore;
  }
  return cachedStore;
}

function writeStore(store: UploadStore) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(store));
  } catch {
    // Storage full or blocked: the upload still shows on the intake page
  }
  window.dispatchEvent(new Event(changeEvent));
}

function subscribe(onChange: () => void) {
  window.addEventListener(changeEvent, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// Returns null during server rendering and the first client render, so pages
// can show a loading state instead of flashing demo data
export function useUploadStore(): UploadStore | null {
  return useSyncExternalStore<UploadStore | null>(subscribe, readStore, () => null);
}

export function saveUploadedSession(analysis: UploadedFileAnalysis) {
  if (!analysis.events.length) {
    return undefined;
  }

  const uploadedAt = new Date().toISOString();
  const baseName = analysis.fileName.replace(/\.[^.]+$/, "");
  const session: StoredSession = {
    id: `${analysis.sessionId ?? baseName}-${Date.now()}`,
    label: analysis.sessionId ?? baseName,
    fileName: analysis.fileName,
    uploadedAt,
    events: analysis.events,
  };

  const current = readStore();
  // Keep the newest sessions; drop the oldest beyond the cap
  const sessions = [...current.sessions, session].slice(-maxStoredSessions);
  writeStore({ activeId: session.id, sessions });
  return session;
}

export function setActiveUploadedSession(id: string | null) {
  writeStore({ ...readStore(), activeId: id });
}

export function clearUploadedSessions() {
  writeStore(emptyStore);
}

export function getActiveSession(store: UploadStore | null) {
  if (!store?.activeId) {
    return undefined;
  }
  return store.sessions.find((session) => session.id === store.activeId);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatus(score: number): PlayerStatus {
  if (score >= reviewThreshold) {
    return "Review Recommended";
  }
  if (score >= monitorThreshold) {
    return "Monitor";
  }
  return "Normal";
}

function average(values: number[]) {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

// Gives every event a real clock time. Timestamps from the file are used when
// they parse; device-clock-only rows are placed relative to the upload time.
function eventTimes(session: StoredSession) {
  const firstDeviceMs = session.events.find((event) => event.timeMs !== undefined)?.timeMs ?? 0;
  const uploadMs = Date.parse(session.uploadedAt);

  return session.events.map((event, index) => {
    const parsed = event.timestamp ? Date.parse(event.timestamp) : Number.NaN;
    if (Number.isFinite(parsed)) {
      return parsed;
    }
    if (event.timeMs !== undefined) {
      return uploadMs + (event.timeMs - firstDeviceMs);
    }
    // No timing at all: space rows a minute apart in file order
    return uploadMs + index * 60_000;
  });
}

function toSession(stored: StoredSession, athleteCount: number): Session {
  const times = eventTimes(stored);
  const start = times.length ? Math.min(...times) : Date.parse(stored.uploadedAt);
  const end = times.length ? Math.max(...times) : start;

  return {
    id: stored.id,
    teamId: uploadTeam.id,
    label: stored.label,
    phase: "Uploaded headband export",
    date: new Date(start).toISOString(),
    status: "Completed",
    venue: stored.fileName,
    durationMinutes: Math.max(1, Math.round((end - start) / 60_000)),
    activePlayers: athleteCount,
  };
}

function groupByPlayer(events: UploadedEvent[]) {
  const groups = new Map<string, UploadedEvent[]>();
  for (const event of events) {
    const list = groups.get(event.playerId) ?? [];
    list.push(event);
    groups.set(event.playerId, list);
  }
  return groups;
}

// Load index for one athlete in one stored session (undefined if absent)
function playerLoadInSession(stored: StoredSession, playerId: string) {
  const events = stored.events.filter((event) => event.playerId === playerId);
  return events.length ? computeAthleteLoadIndex(events) : undefined;
}

// Earlier sessions (by position in the store) that include this athlete
function previousLoads(store: UploadStore, stored: StoredSession, playerId: string) {
  const index = store.sessions.findIndex((session) => session.id === stored.id);
  return store.sessions
    .slice(0, Math.max(index, 0))
    .map((session) => playerLoadInSession(session, playerId))
    .filter((value): value is number => value !== undefined);
}

// Converts uploaded events into the ImpactEvent shape used by the pages.
// Each event carries the athlete's running load index up to that moment.
function toImpactEvents(stored: StoredSession) {
  const times = eventTimes(stored);
  const seenByPlayer = new Map<string, UploadedEvent[]>();

  return stored.events.map((event, index): ImpactEvent => {
    const seen = seenByPlayer.get(event.playerId) ?? [];
    seen.push(event);
    seenByPlayer.set(event.playerId, seen);
    const runningLoad = computeAthleteLoadIndex(seen);

    return {
      eventId: `${stored.id}-${index + 1}`,
      playerId: event.playerId,
      playerName: event.playerName,
      jerseyNumber: event.jerseyNumber ?? 0,
      sessionId: stored.id,
      timestamp: new Date(times[index]).toISOString(),
      eventIntensity: event.eventIntensity,
      eventDirection: event.eventDirection,
      eventType: event.atSensorLimit ? `${event.eventType} (at 4 g sensor limit)` : event.eventType,
      confidenceLevel: event.confidenceLevel,
      confidenceScore: event.confidenceScore,
      cumulativeExposureScore: runningLoad,
      status: getStatus(runningLoad),
    };
  });
}

function toAlert(event: ImpactEvent): AlertSummary {
  return {
    eventId: event.eventId,
    playerId: event.playerId,
    playerName: event.playerName,
    jerseyNumber: event.jerseyNumber,
    timestamp: event.timestamp,
    eventIntensity: event.eventIntensity,
    eventDirection: event.eventDirection,
    confidenceScore: event.confidenceScore,
    status: event.status,
    eventType: event.eventType,
  };
}

// Splits the session into up to 8 time steps and accumulates load, alerts, and events
function buildTimeline(events: ImpactEvent[], stored: StoredSession): TimelinePoint[] {
  if (!events.length) {
    return [];
  }

  const contributions = stored.events.map((event) => event.cumulativeExposureScore);
  const times = events.map((event) => Date.parse(event.timestamp));
  const start = Math.min(...times);
  const end = Math.max(...times);
  const steps = Math.min(8, Math.max(2, events.length));
  const stepSize = (end - start) / (steps - 1) || 1;
  const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

  return Array.from({ length: steps }, (_, step) => {
    const cutoff = start + stepSize * step;
    let teamExposure = 0;
    let alertCount = 0;
    let eventCount = 0;

    events.forEach((event, index) => {
      if (times[index] <= cutoff + 1) {
        teamExposure += contributions[index];
        eventCount += 1;
        if (event.confidenceLevel === "High") {
          alertCount += 1;
        }
      }
    });

    return { label: clock.format(new Date(cutoff)), teamExposure, alertCount, eventCount };
  });
}

function buildSummaryBlock(session: Session, players: PlayerSummary[], highAlerts: number) {
  const reviewList = players
    .filter((player) => player.status === "Review Recommended")
    .map((player) => player.playerName)
    .join(", ");
  const totalEvents = players.reduce((total, player) => total + player.totalEvents, 0);
  const strongest = Math.max(0, ...players.map((player) => player.strongestEvent));

  return [
    `${uploadTeam.name} - ${session.label}`,
    `${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(session.date))} | ${session.venue}`,
    ``,
    `${players.length} athlete${players.length === 1 ? "" : "s"} monitored`,
    `${totalEvents} logged impacts`,
    `${highAlerts} higher-confidence alerts`,
    `Strongest recorded event: ${strongest} g`,
    `Recommended review: ${reviewList || "None"}`,
    `Coach note: treat these signals as workload context, then pair them with video and sideline observation.`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Bundle builders (same shapes as the demo data in lib/neurotrack-data.ts)
// ---------------------------------------------------------------------------

function buildPlayers(store: UploadStore, stored: StoredSession, events: ImpactEvent[]) {
  const groups = groupByPlayer(stored.events);

  return Array.from(groups.entries())
    .map(([playerId, playerEvents]): PlayerSummary => {
      const load = computeAthleteLoadIndex(playerEvents);
      const history = previousLoads(store, stored, playerId);
      const playerImpacts = events.filter((event) => event.playerId === playerId);

      return {
        playerId,
        playerName: playerEvents[0].playerName,
        jerseyNumber: playerEvents[0].jerseyNumber ?? 0,
        position: "Headband",
        totalEvents: playerEvents.length,
        highConfidenceEvents: playerEvents.filter((event) => event.confidenceLevel === "High").length,
        strongestEvent: Math.max(...playerEvents.map((event) => event.eventIntensity)),
        lastEventTime: playerImpacts.at(-1)?.timestamp ?? stored.uploadedAt,
        status: getStatus(load),
        cumulativeExposureScore: load,
        // Change versus the athlete's earlier uploaded sessions (0 when none)
        baselineDelta: history.length ? Math.round(load - average(history)) : 0,
      };
    })
    .sort((a, b) => b.cumulativeExposureScore - a.cumulativeExposureScore);
}

export function buildUploadedDashboardBundle(
  store: UploadStore,
  stored: StoredSession,
): DashboardBundle {
  const events = toImpactEvents(stored);
  const players = buildPlayers(store, stored, events);
  const session = toSession(stored, players.length);
  const recentAlerts = events
    .filter((event) => event.confidenceLevel === "High")
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
    .map(toAlert);
  const highConfidenceAlerts = players.reduce((total, player) => total + player.highConfidenceEvents, 0);
  const teamExposureAverage = Math.round(average(players.map((player) => player.cumulativeExposureScore)));

  // Team baseline = average athlete load across earlier uploaded sessions
  const index = store.sessions.findIndex((entry) => entry.id === stored.id);
  const earlierAverages = store.sessions.slice(0, Math.max(index, 0)).map((entry) =>
    average(Array.from(groupByPlayer(entry.events).values()).map(computeAthleteLoadIndex)),
  );
  const baselineReference = average(earlierAverages);
  const baselineAvailable = earlierAverages.length > 0 && baselineReference > 0;

  return {
    team: uploadTeam,
    session,
    availableSessions: store.sessions.map((entry) =>
      toSession(entry, groupByPlayer(entry.events).size),
    ),
    players,
    recentAlerts,
    exposureTimeline: buildTimeline(events, stored),
    summary: {
      activePlayers: players.length,
      totalLoggedEvents: events.length,
      highConfidenceAlerts,
      playersRecommended: players.filter((player) => player.status === "Review Recommended").length,
      strongestEvent: Math.max(0, ...players.map((player) => player.strongestEvent)),
      elevatedTrendPercent: baselineAvailable
        ? Math.round(((teamExposureAverage - baselineReference) / baselineReference) * 100)
        : 0,
      teamExposureAverage,
    },
    topRiskAthletes: players.slice(0, 5),
    summaryBlock: buildSummaryBlock(session, players, highConfidenceAlerts),
    source: "upload",
    baselineAvailable,
  };
}

export function buildUploadedAthleteDetail(
  store: UploadStore,
  stored: StoredSession,
  playerId: string,
): AthleteDetailBundle | undefined {
  const dashboard = buildUploadedDashboardBundle(store, stored);
  const summary = dashboard.players.find((player) => player.playerId === playerId);
  if (!summary) {
    return undefined;
  }

  const events = toImpactEvents(stored).filter((event) => event.playerId === playerId);
  const directionMap = new Map<EventDirection, number>();
  events.forEach((event) => {
    directionMap.set(event.eventDirection, (directionMap.get(event.eventDirection) ?? 0) + 1);
  });

  // Trend across this athlete's uploaded sessions, oldest to newest
  const index = store.sessions.findIndex((entry) => entry.id === stored.id);
  const sessionTrend = store.sessions
    .slice(0, index + 1)
    .map((entry) => ({ entry, score: playerLoadInSession(entry, playerId) }))
    .filter((point): point is { entry: StoredSession; score: number } => point.score !== undefined)
    .map(({ entry, score }) => ({
      label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
        new Date(entry.uploadedAt),
      ),
      score,
    }));
  // With a single session, show how load built up event by event instead
  const cumulativeLoadTrend =
    sessionTrend.length > 1
      ? sessionTrend
      : events.map((event) => ({
          label: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
            new Date(event.timestamp),
          ),
          score: event.cumulativeExposureScore,
        }));

  const history = previousLoads(store, stored, playerId);
  const note = !history.length
    ? "This is the first uploaded session for this athlete, so there is no baseline yet. Later uploads will be compared against it."
    : summary.baselineDelta >= 12
      ? "This athlete has shown elevated cumulative exposure compared with their earlier uploaded sessions."
      : summary.baselineDelta >= 6
        ? "This athlete is tracking modestly above their earlier uploaded sessions and may benefit from closer monitoring."
        : "This athlete is tracking near their earlier uploaded sessions for cumulative exposure.";

  return {
    athlete: {
      playerId,
      playerName: summary.playerName,
      jerseyNumber: summary.jerseyNumber,
      position: summary.position,
      teamId: uploadTeam.id,
      recentSessionLoads: sessionTrend.map((point) => point.score),
    },
    session: dashboard.session,
    summary,
    events,
    highConfidenceAlerts: dashboard.recentAlerts.filter((alert) => alert.playerId === playerId),
    directionDistribution: Array.from(directionMap.entries()).map(([name, value]) => ({ name, value })),
    cumulativeLoadTrend,
    note,
    source: "upload",
    baselineAvailable: history.length > 0,
  };
}

export function buildUploadedSummaryBundle(
  store: UploadStore,
  stored: StoredSession,
): SessionSummaryBundle {
  const dashboard = buildUploadedDashboardBundle(store, stored);
  const events = toImpactEvents(stored);
  // Strongest impact of the session, whatever its confidence
  const strongest = events.reduce<ImpactEvent | undefined>(
    (best, event) => (!best || event.eventIntensity > best.eventIntensity ? event : best),
    undefined,
  );

  return {
    team: dashboard.team,
    session: dashboard.session,
    totals: dashboard.summary,
    strongestEvent: strongest
      ? toAlert(strongest)
      : {
          eventId: `${stored.id}-none`,
          playerId: "none",
          playerName: "No impacts",
          jerseyNumber: 0,
          timestamp: dashboard.session.date,
          eventIntensity: 0,
          eventDirection: "Frontal",
          confidenceScore: 0,
          status: "Normal",
          eventType: "No impacts recorded",
        },
    exposureTimeline: dashboard.exposureTimeline,
    topLoadAthletes: dashboard.topRiskAthletes,
    summaryBlock: dashboard.summaryBlock,
    source: "upload",
    baselineAvailable: dashboard.baselineAvailable,
  };
}
