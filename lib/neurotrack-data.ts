export type PlayerStatus = "Normal" | "Monitor" | "Review Recommended";
export type ConfidenceLevel = "Low" | "Medium" | "High";
export type SessionStatus = "Live" | "Completed";
export type EventDirection =
  | "Frontal"
  | "Left lateral"
  | "Right lateral"
  | "Posterior"
  | "Crown";

export type Team = {
  id: string;
  name: string;
  shortName: string;
  level: string;
};

export type Session = {
  id: string;
  teamId: string;
  label: string;
  phase: string;
  date: string;
  status: SessionStatus;
  venue: string;
  durationMinutes: number;
  activePlayers: number;
};

export type Athlete = {
  playerId: string;
  playerName: string;
  jerseyNumber: number;
  position: string;
  teamId: string;
  recentSessionLoads: number[];
};

export type ImpactEvent = {
  eventId: string;
  playerId: string;
  playerName: string;
  jerseyNumber: number;
  sessionId: string;
  timestamp: string;
  eventIntensity: number;
  eventDirection: EventDirection;
  eventType: string;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  cumulativeExposureScore: number;
  status: PlayerStatus;
};

export type PlayerSummary = {
  playerId: string;
  playerName: string;
  jerseyNumber: number;
  position: string;
  totalEvents: number;
  highConfidenceEvents: number;
  strongestEvent: number;
  lastEventTime: string;
  status: PlayerStatus;
  cumulativeExposureScore: number;
  baselineDelta: number;
};

export type AlertSummary = {
  eventId: string;
  playerId: string;
  playerName: string;
  jerseyNumber: number;
  timestamp: string;
  eventIntensity: number;
  eventDirection: EventDirection;
  confidenceScore: number;
  status: PlayerStatus;
  eventType: string;
};

export type TimelinePoint = {
  label: string;
  teamExposure: number;
  alertCount: number;
  eventCount: number;
};

export type LoadTrendPoint = {
  label: string;
  score: number;
};

type RawEventSeed = readonly [
  playerId: string,
  time: string,
  eventIntensity: number,
  eventDirection: EventDirection,
  eventType: string,
  confidenceLevel: ConfidenceLevel,
  confidenceScore: number,
  cumulativeExposureScore: number,
];

export type DashboardBundle = {
  team: Team;
  session: Session;
  availableSessions: Session[];
  players: PlayerSummary[];
  recentAlerts: AlertSummary[];
  exposureTimeline: TimelinePoint[];
  summary: {
    activePlayers: number;
    totalLoggedEvents: number;
    highConfidenceAlerts: number;
    playersRecommended: number;
    strongestEvent: number;
    elevatedTrendPercent: number;
    teamExposureAverage: number;
  };
  topRiskAthletes: PlayerSummary[];
  summaryBlock: string;
  // "upload" when built from a file uploaded in this browser, otherwise demo data
  source?: "demo" | "upload";
  // False when there are no earlier sessions to compare against
  baselineAvailable?: boolean;
};

export type AthleteDetailBundle = {
  athlete: Athlete;
  session: Session;
  summary: PlayerSummary;
  events: ImpactEvent[];
  highConfidenceAlerts: AlertSummary[];
  directionDistribution: Array<{ name: EventDirection; value: number }>;
  cumulativeLoadTrend: LoadTrendPoint[];
  note: string;
  // "upload" when built from a file uploaded in this browser, otherwise demo data
  source?: "demo" | "upload";
  // False when there are no earlier sessions to compare against
  baselineAvailable?: boolean;
};

export type SessionSummaryBundle = {
  team: Team;
  session: Session;
  totals: DashboardBundle["summary"];
  strongestEvent: AlertSummary;
  exposureTimeline: TimelinePoint[];
  topLoadAthletes: PlayerSummary[];
  summaryBlock: string;
  // "upload" when built from a file uploaded in this browser, otherwise demo data
  source?: "demo" | "upload";
  // False when there are no earlier sessions to compare against
  baselineAvailable?: boolean;
};

const liveSessionId = "spring-scrimmage-2026-04-13";
const defaultTeamId = "bu-womens";

export const reviewThreshold = 70;
export const monitorThreshold = 55;

export const teams: Team[] = [
  {
    id: "bu-womens",
    name: "BU Women's Soccer",
    shortName: "First Team",
    level: "Collegiate match prep",
  },
  {
    id: "bu-development",
    name: "BU Women's Soccer",
    shortName: "Development Squad",
    level: "Technical repetition block",
  },
];

export const sessions: Session[] = [
  {
    id: liveSessionId,
    teamId: "bu-womens",
    label: "Spring Scrimmage",
    phase: "Live demo stream",
    date: "2026-04-13T18:00:00-04:00",
    status: "Live",
    venue: "Nickerson Field",
    durationMinutes: 92,
    activePlayers: 11,
  },
  {
    id: "heading-block-2026-04-09",
    teamId: "bu-womens",
    label: "Heading Load Block",
    phase: "Completed session",
    date: "2026-04-09T16:30:00-04:00",
    status: "Completed",
    venue: "Track & Soccer Annex",
    durationMinutes: 64,
    activePlayers: 10,
  },
  {
    id: "technical-repeaters-2026-04-11",
    teamId: "bu-development",
    label: "Technical Repeaters",
    phase: "Completed session",
    date: "2026-04-11T14:00:00-04:00",
    status: "Completed",
    venue: "New Balance Field",
    durationMinutes: 58,
    activePlayers: 8,
  },
];

export const athletes: Athlete[] = [
  {
    playerId: "maya-chen",
    playerName: "Maya Chen",
    jerseyNumber: 4,
    position: "CB",
    teamId: "bu-womens",
    recentSessionLoads: [42, 47, 53, 58, 78],
  },
  {
    playerId: "sofia-alvarez",
    playerName: "Sofia Alvarez",
    jerseyNumber: 9,
    position: "FW",
    teamId: "bu-womens",
    recentSessionLoads: [38, 41, 46, 51, 73],
  },
  {
    playerId: "jordan-brooks",
    playerName: "Jordan Brooks",
    jerseyNumber: 11,
    position: "CM",
    teamId: "bu-womens",
    recentSessionLoads: [35, 39, 42, 45, 58],
  },
  {
    playerId: "lena-patel",
    playerName: "Lena Patel",
    jerseyNumber: 6,
    position: "CB",
    teamId: "bu-womens",
    recentSessionLoads: [32, 35, 39, 43, 64],
  },
  {
    playerId: "ava-thompson",
    playerName: "Ava Thompson",
    jerseyNumber: 3,
    position: "FB",
    teamId: "bu-womens",
    recentSessionLoads: [19, 24, 28, 32, 49],
  },
  {
    playerId: "riley-kim",
    playerName: "Riley Kim",
    jerseyNumber: 14,
    position: "CM",
    teamId: "bu-womens",
    recentSessionLoads: [27, 33, 38, 44, 72],
  },
  {
    playerId: "emma-osei",
    playerName: "Emma Osei",
    jerseyNumber: 17,
    position: "FW",
    teamId: "bu-womens",
    recentSessionLoads: [21, 25, 29, 34, 52],
  },
  {
    playerId: "grace-sullivan",
    playerName: "Grace Sullivan",
    jerseyNumber: 1,
    position: "GK",
    teamId: "bu-womens",
    recentSessionLoads: [8, 10, 11, 13, 18],
  },
  {
    playerId: "nia-campbell",
    playerName: "Nia Campbell",
    jerseyNumber: 22,
    position: "FB",
    teamId: "bu-womens",
    recentSessionLoads: [20, 22, 24, 29, 45],
  },
  {
    playerId: "chloe-martin",
    playerName: "Chloe Martin",
    jerseyNumber: 8,
    position: "CM",
    teamId: "bu-womens",
    recentSessionLoads: [16, 18, 22, 28, 43],
  },
  {
    playerId: "dani-park",
    playerName: "Dani Park",
    jerseyNumber: 12,
    position: "FW",
    teamId: "bu-womens",
    recentSessionLoads: [18, 21, 25, 31, 59],
  },
  {
    playerId: "priya-shah",
    playerName: "Priya Shah",
    jerseyNumber: 5,
    position: "CB",
    teamId: "bu-womens",
    recentSessionLoads: [23, 27, 30, 36, 51],
  },
  {
    playerId: "tessa-nguyen",
    playerName: "Tessa Nguyen",
    jerseyNumber: 2,
    position: "FB",
    teamId: "bu-womens",
    recentSessionLoads: [15, 17, 20, 25, 46],
  },
  {
    playerId: "zoe-hart",
    playerName: "Zoe Hart",
    jerseyNumber: 18,
    position: "FW",
    teamId: "bu-development",
    recentSessionLoads: [17, 19, 22, 25, 37],
  },
  {
    playerId: "ivy-rodriguez",
    playerName: "Ivy Rodriguez",
    jerseyNumber: 10,
    position: "CM",
    teamId: "bu-development",
    recentSessionLoads: [14, 16, 18, 22, 33],
  },
  {
    playerId: "harper-finn",
    playerName: "Harper Finn",
    jerseyNumber: 15,
    position: "CB",
    teamId: "bu-development",
    recentSessionLoads: [19, 21, 24, 27, 41],
  },
  {
    playerId: "elise-young",
    playerName: "Elise Young",
    jerseyNumber: 7,
    position: "FB",
    teamId: "bu-development",
    recentSessionLoads: [12, 14, 16, 19, 29],
  },
  {
    playerId: "naomi-scott",
    playerName: "Naomi Scott",
    jerseyNumber: 13,
    position: "FW",
    teamId: "bu-development",
    recentSessionLoads: [16, 18, 21, 23, 39],
  },
  {
    playerId: "lily-barnes",
    playerName: "Lily Barnes",
    jerseyNumber: 20,
    position: "GK",
    teamId: "bu-development",
    recentSessionLoads: [7, 8, 9, 11, 16],
  },
];

const rawEventsBySession: Record<string, RawEventSeed[]> = {
  [liveSessionId]: [
    ["maya-chen", "18:07", 46, "Frontal", "Defensive header", "Medium", 0.71, 36],
    ["riley-kim", "18:11", 29, "Frontal", "Midfield reset", "Low", 0.42, 18],
    ["sofia-alvarez", "18:14", 33, "Frontal", "Attacking header", "Low", 0.38, 24],
    ["ava-thompson", "18:16", 26, "Left lateral", "Clearance", "Low", 0.35, 16],
    ["emma-osei", "18:18", 38, "Frontal", "Attacking header", "Medium", 0.62, 22],
    ["chloe-martin", "18:20", 25, "Frontal", "Midfield redirect", "Low", 0.36, 14],
    ["jordan-brooks", "18:22", 31, "Posterior", "Shoulder challenge", "Low", 0.33, 20],
    ["tessa-nguyen", "18:24", 24, "Posterior", "Recovery touch", "Low", 0.31, 12],
    ["nia-campbell", "18:27", 34, "Right lateral", "Defensive header", "Medium", 0.58, 24],
    ["dani-park", "18:31", 39, "Frontal", "Attacking header", "Medium", 0.67, 26],
    ["lena-patel", "18:33", 42, "Right lateral", "Defensive header", "Medium", 0.69, 29],
    ["riley-kim", "18:37", 54, "Left lateral", "Midfield duel", "Medium", 0.73, 38],
    ["priya-shah", "18:40", 44, "Crown", "Defensive header", "Medium", 0.68, 30],
    ["maya-chen", "18:41", 72, "Right lateral", "Aerial duel", "High", 0.88, 58],
    ["grace-sullivan", "18:44", 21, "Posterior", "Goal box recovery", "Low", 0.22, 10],
    ["tessa-nguyen", "18:46", 51, "Left lateral", "Aerial duel", "Medium", 0.7, 31],
    ["jordan-brooks", "18:48", 57, "Frontal", "Midfield challenge", "Medium", 0.77, 41],
    ["chloe-martin", "18:50", 47, "Left lateral", "Aerial duel", "Medium", 0.66, 29],
    ["ava-thompson", "18:52", 49, "Right lateral", "Clearance", "Medium", 0.64, 33],
    ["sofia-alvarez", "18:55", 64, "Crown", "Attacking header", "Medium", 0.79, 51],
    ["dani-park", "18:57", 71, "Frontal", "Box challenge", "High", 0.86, 47],
    ["emma-osei", "18:59", 74, "Crown", "Box challenge", "High", 0.9, 49],
    ["lena-patel", "19:03", 67, "Frontal", "Set-piece clearance", "High", 0.84, 64],
    ["nia-campbell", "19:07", 58, "Right lateral", "Aerial duel", "Medium", 0.74, 45],
    ["jordan-brooks", "19:09", 63, "Frontal", "Aerial duel", "Medium", 0.8, 58],
    ["sofia-alvarez", "19:11", 69, "Left lateral", "Attacking header", "High", 0.87, 73],
    ["tessa-nguyen", "19:12", 59, "Left lateral", "Recovery header", "Medium", 0.76, 46],
    ["riley-kim", "19:14", 66, "Crown", "Aerial duel", "High", 0.85, 72],
    ["chloe-martin", "19:16", 53, "Frontal", "Header drill", "Medium", 0.72, 43],
    ["maya-chen", "19:18", 81, "Frontal", "Set-piece clearance", "High", 0.93, 78],
    ["ava-thompson", "19:22", 61, "Frontal", "Aerial duel", "Medium", 0.77, 49],
    ["priya-shah", "19:24", 62, "Right lateral", "Aerial duel", "Medium", 0.78, 51],
  ],
  "heading-block-2026-04-09": [
    ["maya-chen", "16:08", 51, "Frontal", "Heading repetition", "Medium", 0.7, 28],
    ["sofia-alvarez", "16:13", 48, "Frontal", "Attacking header", "Medium", 0.67, 24],
    ["jordan-brooks", "16:16", 41, "Left lateral", "Midfield reset", "Medium", 0.61, 21],
    ["lena-patel", "16:21", 58, "Frontal", "Defensive header", "Medium", 0.79, 34],
    ["riley-kim", "16:27", 63, "Crown", "Aerial duel", "High", 0.84, 38],
    ["dani-park", "16:34", 66, "Frontal", "Finishing drill", "High", 0.82, 31],
    ["ava-thompson", "16:39", 44, "Right lateral", "Clearance", "Medium", 0.63, 19],
    ["emma-osei", "16:44", 52, "Crown", "Attacking header", "Medium", 0.7, 24],
    ["priya-shah", "16:50", 57, "Frontal", "Defensive header", "Medium", 0.76, 26],
    ["maya-chen", "16:55", 73, "Right lateral", "Set-piece clearance", "High", 0.89, 58],
    ["sofia-alvarez", "17:02", 61, "Frontal", "Attacking header", "Medium", 0.78, 51],
    ["riley-kim", "17:09", 59, "Crown", "Aerial duel", "Medium", 0.77, 44],
    ["lena-patel", "17:14", 64, "Frontal", "Set-piece clearance", "High", 0.83, 43],
    ["jordan-brooks", "17:18", 47, "Frontal", "Midfield challenge", "Medium", 0.66, 30],
    ["dani-park", "17:23", 54, "Frontal", "Finishing drill", "Medium", 0.73, 31],
  ],
  "technical-repeaters-2026-04-11": [
    ["zoe-hart", "14:05", 36, "Frontal", "Receiving pattern", "Medium", 0.58, 18],
    ["ivy-rodriguez", "14:11", 31, "Left lateral", "Midfield recycle", "Low", 0.37, 14],
    ["harper-finn", "14:18", 42, "Frontal", "Defensive header", "Medium", 0.66, 22],
    ["naomi-scott", "14:25", 47, "Crown", "Attacking header", "Medium", 0.7, 23],
    ["elise-young", "14:31", 29, "Right lateral", "Clearance", "Low", 0.34, 11],
    ["zoe-hart", "14:39", 53, "Frontal", "Aerial duel", "Medium", 0.75, 27],
    ["harper-finn", "14:46", 61, "Frontal", "Defensive header", "High", 0.83, 41],
    ["ivy-rodriguez", "14:53", 39, "Frontal", "Midfield challenge", "Medium", 0.59, 21],
    ["naomi-scott", "15:01", 58, "Crown", "Attacking header", "Medium", 0.79, 39],
    ["elise-young", "15:08", 33, "Right lateral", "Clearance", "Low", 0.39, 16],
  ],
};

const exposureTimelineBySession: Record<string, TimelinePoint[]> = {
  [liveSessionId]: [
    { label: "17:55", teamExposure: 0, alertCount: 0, eventCount: 0 },
    { label: "18:10", teamExposure: 18, alertCount: 0, eventCount: 4 },
    { label: "18:25", teamExposure: 46, alertCount: 0, eventCount: 9 },
    { label: "18:40", teamExposure: 73, alertCount: 1, eventCount: 14 },
    { label: "18:55", teamExposure: 112, alertCount: 2, eventCount: 20 },
    { label: "19:10", teamExposure: 154, alertCount: 5, eventCount: 26 },
    { label: "19:20", teamExposure: 184, alertCount: 7, eventCount: 30 },
    { label: "19:30", teamExposure: 198, alertCount: 7, eventCount: 32 },
  ],
  "heading-block-2026-04-09": [
    { label: "16:00", teamExposure: 0, alertCount: 0, eventCount: 0 },
    { label: "16:15", teamExposure: 24, alertCount: 0, eventCount: 3 },
    { label: "16:30", teamExposure: 52, alertCount: 1, eventCount: 6 },
    { label: "16:45", teamExposure: 79, alertCount: 2, eventCount: 8 },
    { label: "17:00", teamExposure: 108, alertCount: 3, eventCount: 11 },
    { label: "17:15", teamExposure: 131, alertCount: 4, eventCount: 14 },
    { label: "17:30", teamExposure: 137, alertCount: 4, eventCount: 15 },
  ],
  "technical-repeaters-2026-04-11": [
    { label: "14:00", teamExposure: 0, alertCount: 0, eventCount: 0 },
    { label: "14:15", teamExposure: 16, alertCount: 0, eventCount: 2 },
    { label: "14:30", teamExposure: 33, alertCount: 0, eventCount: 4 },
    { label: "14:45", teamExposure: 54, alertCount: 1, eventCount: 7 },
    { label: "15:00", teamExposure: 71, alertCount: 1, eventCount: 9 },
    { label: "15:10", teamExposure: 78, alertCount: 1, eventCount: 10 },
  ],
};

const athleteLookup = new Map(athletes.map((athlete) => [athlete.playerId, athlete]));

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
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getSessionById(sessionId: string) {
  return sessions.find((session) => session.id === sessionId);
}

function buildTimestamp(sessionId: string, time: string) {
  const session = getSessionById(sessionId);

  if (!session) {
    return new Date().toISOString();
  }

  const day = session.date.slice(0, 10);
  return `${day}T${time}:00-04:00`;
}

export const impactEvents: ImpactEvent[] = Object.entries(rawEventsBySession).flatMap(
  ([sessionId, seeds]) =>
    seeds.map((seed, index) => {
      const athlete = athleteLookup.get(seed[0]);
      const cumulativeScore = seed[7];
      const status = getStatus(cumulativeScore);

      if (!athlete) {
        throw new Error(`Missing athlete profile for ${seed[0]}`);
      }

      return {
        eventId: `${sessionId}-${athlete.playerId}-${index + 1}`,
        playerId: athlete.playerId,
        playerName: athlete.playerName,
        jerseyNumber: athlete.jerseyNumber,
        sessionId,
        timestamp: buildTimestamp(sessionId, seed[1]),
        eventIntensity: seed[2],
        eventDirection: seed[3],
        eventType: seed[4],
        confidenceLevel: seed[5],
        confidenceScore: seed[6],
        cumulativeExposureScore: cumulativeScore,
        status,
      };
    }),
);

function buildPlayerSummaries(sessionId: string) {
  const session = getSessionById(sessionId);

  if (!session) {
    return [];
  }

  const roster = athletes.filter((athlete) => athlete.teamId === session.teamId);

  return roster
    .map((athlete) => {
      const events = impactEvents
        .filter((event) => event.sessionId === sessionId && event.playerId === athlete.playerId)
        .sort((left, right) => +new Date(left.timestamp) - +new Date(right.timestamp));

      if (!events.length) {
        return null;
      }

      const latestScore = athlete.recentSessionLoads.at(-1) ?? 0;
      const baselineDelta = Math.round(
        latestScore - average(athlete.recentSessionLoads.slice(0, -1)),
      );

      return {
        playerId: athlete.playerId,
        playerName: athlete.playerName,
        jerseyNumber: athlete.jerseyNumber,
        position: athlete.position,
        totalEvents: events.length,
        highConfidenceEvents: events.filter((event) => event.confidenceLevel === "High").length,
        strongestEvent: Math.max(...events.map((event) => event.eventIntensity)),
        lastEventTime: events.at(-1)?.timestamp ?? session.date,
        status: getStatus(latestScore),
        cumulativeExposureScore: latestScore,
        baselineDelta,
      } satisfies PlayerSummary;
    })
    .filter((entry): entry is PlayerSummary => Boolean(entry));
}

function buildRecentAlerts(sessionId: string) {
  return impactEvents
    .filter((event) => event.sessionId === sessionId && event.confidenceLevel === "High")
    .sort((left, right) => +new Date(right.timestamp) - +new Date(left.timestamp))
    .map((event) => ({
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
    }));
}

function buildSummaryBlock(team: Team, session: Session, players: PlayerSummary[]) {
  const reviewList = players
    .filter((player) => player.status === "Review Recommended")
    .map((player) => player.playerName)
    .join(", ");

  const totalEvents = players.reduce((total, player) => total + player.totalEvents, 0);
  const totalHigh = players.reduce(
    (total, player) => total + player.highConfidenceEvents,
    0,
  );
  const strongestEvent = Math.max(...players.map((player) => player.strongestEvent));

  return [
    `${team.name} - ${session.label}`,
    `${new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(session.date))} | ${session.venue}`,
    ``,
    `${session.activePlayers} athletes monitored`,
    `${totalEvents} logged events`,
    `${totalHigh} higher-confidence alerts`,
    `Strongest recorded event: ${strongestEvent} g`,
    `Recommended review: ${reviewList || "None"}`,
    `Coach note: treat these signals as workload context, then pair them with video and sideline observation.`,
  ].join("\n");
}

export function getSessionsForTeam(teamId: string) {
  return sessions.filter((session) => session.teamId === teamId);
}

export function getDashboardBundle(
  teamId: string = defaultTeamId,
  sessionId: string = liveSessionId,
): DashboardBundle {
  const team = teams.find((entry) => entry.id === teamId) ?? teams[0];
  const availableSessions = getSessionsForTeam(team.id);
  const activeSession =
    availableSessions.find((entry) => entry.id === sessionId) ?? availableSessions[0];
  const players = buildPlayerSummaries(activeSession.id).sort(
    (left, right) => right.cumulativeExposureScore - left.cumulativeExposureScore,
  );
  const recentAlerts = buildRecentAlerts(activeSession.id);
  const totalLoggedEvents = players.reduce((total, player) => total + player.totalEvents, 0);
  const highConfidenceAlerts = players.reduce(
    (total, player) => total + player.highConfidenceEvents,
    0,
  );
  const strongestEvent = Math.max(...players.map((player) => player.strongestEvent));
  const teamExposureAverage = Math.round(
    average(players.map((player) => player.cumulativeExposureScore)),
  );
  const baselineReference = team.id === "bu-development" ? 28 : 41;
  const elevatedTrendPercent = Math.round(
    ((teamExposureAverage - baselineReference) / baselineReference) * 100,
  );

  return {
    team,
    session: activeSession,
    availableSessions,
    players,
    recentAlerts,
    exposureTimeline: exposureTimelineBySession[activeSession.id] ?? [],
    summary: {
      activePlayers: activeSession.activePlayers,
      totalLoggedEvents,
      highConfidenceAlerts,
      playersRecommended: players.filter(
        (player) => player.status === "Review Recommended",
      ).length,
      strongestEvent,
      elevatedTrendPercent,
      teamExposureAverage,
    },
    topRiskAthletes: players.slice(0, 5),
    summaryBlock: buildSummaryBlock(team, activeSession, players),
  };
}

export function getAthleteDetailBundle(
  playerId: string,
  sessionId: string = liveSessionId,
): AthleteDetailBundle | undefined {
  const athlete = athleteLookup.get(playerId);
  const session = getSessionById(sessionId);

  if (!athlete || !session) {
    return undefined;
  }

  const summary = buildPlayerSummaries(sessionId).find((player) => player.playerId === playerId);

  if (!summary) {
    return undefined;
  }

  const events = impactEvents
    .filter((event) => event.sessionId === sessionId && event.playerId === playerId)
    .sort((left, right) => +new Date(left.timestamp) - +new Date(right.timestamp));

  const directionMap = new Map<EventDirection, number>();
  events.forEach((event) => {
    directionMap.set(
      event.eventDirection,
      (directionMap.get(event.eventDirection) ?? 0) + 1,
    );
  });

  const baselineAverage = average(athlete.recentSessionLoads.slice(0, -1));
  const note =
    summary.cumulativeExposureScore - baselineAverage >= 12
      ? "This athlete has shown elevated cumulative exposure compared with their recent baseline."
      : summary.cumulativeExposureScore - baselineAverage >= 6
        ? "This athlete is tracking modestly above their recent baseline and may benefit from closer monitoring."
        : "This athlete is currently tracking near their recent baseline for cumulative exposure.";

  return {
    athlete,
    session,
    summary,
    events,
    highConfidenceAlerts: buildRecentAlerts(sessionId).filter(
      (alert) => alert.playerId === playerId,
    ),
    directionDistribution: Array.from(directionMap.entries()).map(([name, value]) => ({
      name,
      value,
    })),
    cumulativeLoadTrend: athlete.recentSessionLoads.map((score, index) => ({
      label: ["Mar 19", "Mar 26", "Apr 2", "Apr 9", "Today"][index] ?? `S${index + 1}`,
      score,
    })),
    note,
  };
}

export function getSessionSummaryBundle(
  sessionId: string = liveSessionId,
): SessionSummaryBundle | undefined {
  const session = getSessionById(sessionId);

  if (!session) {
    return undefined;
  }

  const team = teams.find((entry) => entry.id === session.teamId);

  if (!team) {
    return undefined;
  }

  const dashboard = getDashboardBundle(team.id, sessionId);
  const fallbackAlert = {
    eventId: `${sessionId}-fallback`,
    playerId: dashboard.topRiskAthletes[0]?.playerId ?? "unknown",
    playerName: dashboard.topRiskAthletes[0]?.playerName ?? "No alert",
    jerseyNumber: dashboard.topRiskAthletes[0]?.jerseyNumber ?? 0,
    timestamp: session.date,
    eventIntensity: dashboard.summary.strongestEvent,
    eventDirection: "Frontal" as const,
    confidenceScore: 0,
    status: dashboard.topRiskAthletes[0]?.status ?? "Normal",
    eventType: "No higher-confidence alert recorded",
  };
  const strongestEvent = dashboard.recentAlerts.reduce(
    (current, alert) =>
      alert.eventIntensity > current.eventIntensity ? alert : current,
    fallbackAlert,
  );

  return {
    team,
    session,
    totals: dashboard.summary,
    strongestEvent,
    exposureTimeline: dashboard.exposureTimeline,
    topLoadAthletes: dashboard.topRiskAthletes,
    summaryBlock: dashboard.summaryBlock,
  };
}

export function formatSessionDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function defaultDashboardSessionId() {
  return liveSessionId;
}

export function defaultDashboardTeamId() {
  return defaultTeamId;
}
