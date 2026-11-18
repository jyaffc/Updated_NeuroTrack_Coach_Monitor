export type TrackId =
  | "python"
  | "cpp"
  | "javascript"
  | "sql"
  | "html-css"
  | "ai";

export type LevelId = "beginner" | "intermediate" | "advanced";

export type LearningGoalId =
  | "career-launch"
  | "ship-projects"
  | "ai-fluency"
  | "interview-power";

export type IconKey =
  | "python"
  | "cpp"
  | "javascript"
  | "sql"
  | "html"
  | "ai"
  | "track";

export type AvatarDefinition = {
  id: string;
  name: string;
  role: string;
  perk: string;
  energy: string;
  description: string;
  colors: [string, string];
};

export type LevelDefinition = {
  id: LevelId;
  label: string;
  tone: string;
  description: string;
  coachStyle: string;
};

export type PathNode = {
  id: string;
  title: string;
  type: "lesson" | "challenge" | "preview";
  xp: number;
  duration: string;
  summary: string;
  linkedId?: string;
};

export type TrackPath = {
  levelId: LevelId;
  worldName: string;
  mood: string;
  dailyQuest: string;
  capstone: string;
  nodes: PathNode[];
};

export type TrackDefinition = {
  id: TrackId;
  name: string;
  icon: IconKey;
  tagline: string;
  description: string;
  accent: string;
  surface: string;
  glow: string;
  stats: { label: string; value: string }[];
  topics: Record<LevelId, string[]>;
  paths: Record<LevelId, TrackPath>;
  badges: string[];
};

type BaseExercise = {
  id: string;
  prompt: string;
};

export type MultipleChoiceExercise = BaseExercise & {
  type: "multiple-choice";
  options: string[];
  answer: string;
  feedback: string;
};

export type FillBlankExercise = BaseExercise & {
  type: "fill-blank";
  snippet: string;
  answer: string;
  hint: string;
  feedback: string;
};

export type ReorderExercise = BaseExercise & {
  type: "reorder";
  tokens: string[];
  answer: string[];
  feedback: string;
};

export type MatchExercise = BaseExercise & {
  type: "match";
  pairs: { left: string; right: string }[];
  feedback: string;
};

export type OutputExercise = BaseExercise & {
  type: "output";
  code: string;
  options: string[];
  answer: string;
  feedback: string;
};

export type ExerciseDefinition =
  | MultipleChoiceExercise
  | FillBlankExercise
  | ReorderExercise
  | MatchExercise
  | OutputExercise;

export type LessonDefinition = {
  id: string;
  trackId: TrackId;
  levelId: LevelId;
  title: string;
  subtitle: string;
  intro: string;
  conceptCard: string;
  duration: string;
  xp: number;
  objective: string;
  rewardLabel: string;
  challengeId: string;
  exercises: ExerciseDefinition[];
};

export type ChallengeRound =
  | {
      id: string;
      type: "rapid";
      prompt: string;
      options: string[];
      answer: string;
      feedback: string;
    }
  | {
      id: string;
      type: "sort";
      prompt: string;
      categories: string[];
      cards: { id: string; label: string; answer: string }[];
      feedback: string;
    }
  | {
      id: string;
      type: "sequence";
      prompt: string;
      steps: string[];
      answer: string[];
      feedback: string;
    };

export type ChallengeDefinition = {
  id: string;
  trackId: TrackId;
  levelId: LevelId;
  title: string;
  subtitle: string;
  description: string;
  xp: number;
  rounds: ChallengeRound[];
};

export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
  icon: IconKey;
  unlockText: string;
};

export type OrbitaProfile = {
  trackId: TrackId;
  levelId: LevelId;
  goalId: LearningGoalId;
  avatarId: string;
  xp: number;
  streak: number;
  dailyGoal: number;
  onboardingComplete: boolean;
  completedLessonIds: string[];
  completedChallengeIds: string[];
  lessonPerformance: Record<string, number>;
  challengePerformance: Record<string, number>;
  awardedCredentialDates: Record<string, string>;
};

export const levels: LevelDefinition[] = [
  {
    id: "beginner",
    label: "Beginner",
    tone: "Warm onboarding, visual metaphors, quick wins",
    description:
      "Short, friendly lessons with simple wording, visual intuition, and celebration after every step.",
    coachStyle: "Supportive and confidence-building",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    tone: "Applied logic, code reading, and tactical practice",
    description:
      "More real problem solving, pattern recognition, and decision-making with moderate pace.",
    coachStyle: "Practical and momentum-focused",
  },
  {
    id: "advanced",
    label: "Advanced",
    tone: "Systems thinking, tradeoffs, debugging, and optimization",
    description:
      "Sharper prompts, higher stakes, and deeper reasoning for architecture-minded learners.",
    coachStyle: "Demanding but still encouraging",
  },
];

export const avatars: AvatarDefinition[] = [
  {
    id: "nova",
    name: "Nova Glide",
    role: "Pattern Scout",
    perk: "Turns first misses into bonus hints.",
    energy: "Bright, calm, impossible to rattle",
    description:
      "A navigator who makes new concepts feel smaller by breaking them into glowing checkpoints.",
    colors: ["#ffcb7f", "#ff7d57"],
  },
  {
    id: "patch",
    name: "Patch Pulse",
    role: "Repair Bard",
    perk: "Keeps your combo alive when you retry.",
    energy: "Playful and hands-on",
    description:
      "Loves fixing bugs mid-flight and celebrating tiny improvements like they are boss wins.",
    colors: ["#87f3e0", "#2eb9af"],
  },
  {
    id: "echo",
    name: "Echo Byte",
    role: "Stealth Debugger",
    perk: "Highlights the most likely answer first.",
    energy: "Cool and razor-focused",
    description:
      "A quiet operator who spots patterns in logs, outputs, and edge cases before anyone else.",
    colors: ["#9db0ff", "#4f65f2"],
  },
  {
    id: "mira",
    name: "Mira Flux",
    role: "Prompt Whisperer",
    perk: "Earns extra XP in AI missions.",
    energy: "Curious, lyrical, inventive",
    description:
      "Collects language fragments, turns them into prompts, and finds the hidden structure in ideas.",
    colors: ["#ffb0be", "#ff6980"],
  },
  {
    id: "orbit",
    name: "Orbit Ram",
    role: "Systems Builder",
    perk: "Unlocks advanced map previews early.",
    energy: "Steady and architect-minded",
    description:
      "Builds sturdy flows, loves performance gains, and thinks in layers rather than lines.",
    colors: ["#ffe78c", "#ffbf4d"],
  },
  {
    id: "lumen",
    name: "Lumen Vale",
    role: "Interface Mage",
    perk: "Doubles style badges from frontend tracks.",
    energy: "Elegant and optimistic",
    description:
      "Turns rough prototypes into polished worlds with rhythm, color, and intuitive feedback.",
    colors: ["#b0f0ff", "#58cef5"],
  },
];

export const defaultProfile: OrbitaProfile = {
  trackId: "ai",
  levelId: "beginner",
  goalId: "ai-fluency",
  avatarId: "nova",
  xp: 360,
  streak: 6,
  dailyGoal: 3,
  onboardingComplete: false,
  completedLessonIds: ["ai-beginner-pattern-sense"],
  completedChallengeIds: [],
  lessonPerformance: {
    "ai-beginner-pattern-sense": 87,
  },
  challengePerformance: {},
  awardedCredentialDates: {},
};

export const tracks: TrackDefinition[] = [
  {
    id: "python",
    name: "Python",
    icon: "python",
    tagline: "Readable power-ups for logic and automation",
    description:
      "Build confidence with clear syntax, fast experiments, and expressive little wins.",
    accent: "#ff9551",
    surface: "linear-gradient(135deg, #fff2df 0%, #ffe3cc 48%, #ffd4b2 100%)",
    glow: "#ffb37a",
    stats: [
      { label: "Starter combo", value: "Variables -> loops" },
      { label: "Mood", value: "Friendly and flexible" },
    ],
    topics: {
      beginner: ["Variables", "Loops", "Functions", "Lists"],
      intermediate: ["Functions", "Data shapes", "Debugging", "Scripts"],
      advanced: ["Automation", "Testing", "Comprehensions", "Optimization"],
    },
    paths: {
      beginner: {
        levelId: "beginner",
        worldName: "Variable Valley",
        mood: "Friendly prompts, visual metaphors, and tiny coding wins.",
        dailyQuest: "Finish one concept and one output check.",
        capstone: "Loop Rush",
        nodes: [
          {
            id: "python-b-node-1",
            title: "Variable Garden",
            type: "lesson",
            xp: 40,
            duration: "5 min",
            summary: "Label values like treasure jars and read them back with ease.",
            linkedId: "python-beginner-variable-garden",
          },
          {
            id: "python-b-node-2",
            title: "Loop Lagoon",
            type: "preview",
            xp: 35,
            duration: "4 min",
            summary: "Make the same action happen on purpose, not by repetition.",
          },
          {
            id: "python-b-node-3",
            title: "Function Fair",
            type: "preview",
            xp: 45,
            duration: "6 min",
            summary: "Bundle a move once and call it whenever you need it.",
          },
          {
            id: "python-b-node-4",
            title: "Loop Rush",
            type: "challenge",
            xp: 80,
            duration: "3 rounds",
            summary: "Race through repeatable patterns without losing your combo.",
            linkedId: "challenge-python-beginner-loop-rush",
          },
        ],
      },
      intermediate: {
        levelId: "intermediate",
        worldName: "Logic Rapids",
        mood: "Applied problem solving with practical scripts and control flow.",
        dailyQuest: "Read a snippet, predict it, then patch a bug.",
        capstone: "Debug Drift",
        nodes: [
          {
            id: "python-i-node-1",
            title: "Function Forecast",
            type: "lesson",
            xp: 55,
            duration: "6 min",
            summary: "Pass values cleanly, return useful results, and avoid repeated work.",
            linkedId: "python-intermediate-function-forecast",
          },
          {
            id: "python-i-node-2",
            title: "List Lab",
            type: "preview",
            xp: 45,
            duration: "5 min",
            summary: "Slice, append, and inspect data with confidence.",
          },
          {
            id: "python-i-node-3",
            title: "Branch Builder",
            type: "preview",
            xp: 55,
            duration: "5 min",
            summary: "Choose the right path when data changes shape.",
          },
          {
            id: "python-i-node-4",
            title: "Debug Drift",
            type: "challenge",
            xp: 90,
            duration: "3 rounds",
            summary: "Repair broken flows while the timer pressure climbs.",
            linkedId: "challenge-python-intermediate-debug-drift",
          },
        ],
      },
      advanced: {
        levelId: "advanced",
        worldName: "Automation Skyline",
        mood: "Sharper reasoning, tooling instincts, and code quality choices.",
        dailyQuest: "Compare two approaches and defend the cleaner one.",
        capstone: "Orchestrator Run",
        nodes: [
          {
            id: "python-a-node-1",
            title: "Automation Orbit",
            type: "lesson",
            xp: 70,
            duration: "7 min",
            summary: "Design small utilities that survive messy real inputs.",
            linkedId: "python-advanced-automation-orbit",
          },
          {
            id: "python-a-node-2",
            title: "Test Beacon",
            type: "preview",
            xp: 55,
            duration: "5 min",
            summary: "Guard important behavior with crisp, meaningful checks.",
          },
          {
            id: "python-a-node-3",
            title: "Refactor Ridge",
            type: "preview",
            xp: 60,
            duration: "5 min",
            summary: "Trade cleverness for clarity without losing capability.",
          },
          {
            id: "python-a-node-4",
            title: "Orchestrator Run",
            type: "challenge",
            xp: 110,
            duration: "4 rounds",
            summary: "Balance maintainability, speed, and resilience in live scenarios.",
            linkedId: "challenge-python-advanced-orchestrator-run",
          },
        ],
      },
    },
    badges: ["Clean syntax", "Tiny automations", "Readable wins"],
  },
  {
    id: "cpp",
    name: "C++",
    icon: "cpp",
    tagline: "Precision mode for performance-minded builders",
    description:
      "Learn the shape of memory, structure, and fast data handling without losing your rhythm.",
    accent: "#6f8aff",
    surface: "linear-gradient(135deg, #eef2ff 0%, #dce5ff 50%, #ccd8ff 100%)",
    glow: "#90a6ff",
    stats: [
      { label: "Core move", value: "Control your data" },
      { label: "Mood", value: "Tactical and exact" },
    ],
    topics: {
      beginner: ["Syntax", "Loops", "Functions", "Types"],
      intermediate: ["Vectors", "References", "Loops", "Structs"],
      advanced: ["Performance", "Ownership intuition", "Tradeoffs", "Debugging"],
    },
    paths: {
      beginner: {
        levelId: "beginner",
        worldName: "Launch Dock",
        mood: "Simple syntax reps with a strong feeling of control.",
        dailyQuest: "Read one snippet and build one tiny loop.",
        capstone: "Syntax Sprint",
        nodes: [
          {
            id: "cpp-b-node-1",
            title: "Loop Launch",
            type: "lesson",
            xp: 45,
            duration: "5 min",
            summary: "Print, repeat, and understand what each line is doing.",
            linkedId: "cpp-beginner-loop-launch",
          },
          {
            id: "cpp-b-node-2",
            title: "Type Tower",
            type: "preview",
            xp: 40,
            duration: "4 min",
            summary: "Keep track of the kind of data you are holding.",
          },
          {
            id: "cpp-b-node-3",
            title: "Function Lift",
            type: "preview",
            xp: 45,
            duration: "5 min",
            summary: "Package useful behavior behind named tools.",
          },
          {
            id: "cpp-b-node-4",
            title: "Syntax Sprint",
            type: "challenge",
            xp: 85,
            duration: "3 rounds",
            summary: "Lock in the basics through fast syntax decisions.",
            linkedId: "challenge-cpp-beginner-syntax-sprint",
          },
        ],
      },
      intermediate: {
        levelId: "intermediate",
        worldName: "Container Circuit",
        mood: "Dynamic collections, references, and more applied reasoning.",
        dailyQuest: "Predict a vector operation and inspect the outcome.",
        capstone: "Vector Arena",
        nodes: [
          {
            id: "cpp-i-node-1",
            title: "Vector Rally",
            type: "lesson",
            xp: 60,
            duration: "6 min",
            summary: "Store growing collections and inspect them without fear.",
            linkedId: "cpp-intermediate-vector-rally",
          },
          {
            id: "cpp-i-node-2",
            title: "Reference Route",
            type: "preview",
            xp: 55,
            duration: "5 min",
            summary: "Pass data around efficiently and with intent.",
          },
          {
            id: "cpp-i-node-3",
            title: "Struct Station",
            type: "preview",
            xp: 55,
            duration: "5 min",
            summary: "Group related values into tidy, meaningful shapes.",
          },
          {
            id: "cpp-i-node-4",
            title: "Vector Arena",
            type: "challenge",
            xp: 95,
            duration: "3 rounds",
            summary: "Sort the right container, operation, and result under pressure.",
            linkedId: "challenge-cpp-intermediate-vector-arena",
          },
        ],
      },
      advanced: {
        levelId: "advanced",
        worldName: "Performance Ridge",
        mood: "Optimization instincts without losing readability or control.",
        dailyQuest: "Choose the approach that scales and explain why.",
        capstone: "Performance Pit",
        nodes: [
          {
            id: "cpp-a-node-1",
            title: "Performance Pit",
            type: "lesson",
            xp: 70,
            duration: "7 min",
            summary: "Reason about copies, references, and fast paths.",
            linkedId: "cpp-advanced-performance-pit",
          },
          {
            id: "cpp-a-node-2",
            title: "Memory Mirror",
            type: "preview",
            xp: 60,
            duration: "5 min",
            summary: "Track where data lives and how long it lasts.",
          },
          {
            id: "cpp-a-node-3",
            title: "Tradeoff Track",
            type: "preview",
            xp: 60,
            duration: "5 min",
            summary: "Pick the safer design when speed and clarity collide.",
          },
          {
            id: "cpp-a-node-4",
            title: "Memory Maze",
            type: "challenge",
            xp: 115,
            duration: "4 rounds",
            summary: "Untangle data movement, references, and costly mistakes.",
            linkedId: "challenge-cpp-advanced-memory-maze",
          },
        ],
      },
    },
    badges: ["Vector tactician", "Reference runner", "Speed sense"],
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "javascript",
    tagline: "Reactive, fast, and made for playful interfaces",
    description:
      "Move from variables and arrays into DOM behavior, async flow, and interactive thinking.",
    accent: "#ffc94a",
    surface: "linear-gradient(135deg, #fff6d6 0%, #fff0bf 45%, #ffe89c 100%)",
    glow: "#ffd86d",
    stats: [
      { label: "Star move", value: "Make pages react" },
      { label: "Mood", value: "Snappy and expressive" },
    ],
    topics: {
      beginner: ["Variables", "Arrays", "Functions", "Conditions"],
      intermediate: ["DOM", "Events", "State", "Logic"],
      advanced: ["Async", "Rendering", "Architecture", "Optimization"],
    },
    paths: {
      beginner: {
        levelId: "beginner",
        worldName: "Array Arcade",
        mood: "Cheerful reps around variables, arrays, and outputs.",
        dailyQuest: "Read one line, predict one output, rearrange one snippet.",
        capstone: "Array Dash",
        nodes: [
          {
            id: "js-b-node-1",
            title: "Array Riff",
            type: "lesson",
            xp: 45,
            duration: "5 min",
            summary: "Use arrays to group values and pull out what you need.",
            linkedId: "javascript-beginner-array-riff",
          },
          {
            id: "js-b-node-2",
            title: "Function Flick",
            type: "preview",
            xp: 40,
            duration: "4 min",
            summary: "Give repeated actions a reusable name.",
          },
          {
            id: "js-b-node-3",
            title: "Condition Corner",
            type: "preview",
            xp: 45,
            duration: "5 min",
            summary: "React differently when input changes.",
          },
          {
            id: "js-b-node-4",
            title: "Array Dash",
            type: "challenge",
            xp: 85,
            duration: "3 rounds",
            summary: "Keep track of values, methods, and output order at speed.",
            linkedId: "challenge-javascript-beginner-array-dash",
          },
        ],
      },
      intermediate: {
        levelId: "intermediate",
        worldName: "Interface District",
        mood: "DOM decisions, event handling, and UI behavior.",
        dailyQuest: "Hook up one interaction and explain what changed on screen.",
        capstone: "DOM Rescue",
        nodes: [
          {
            id: "js-i-node-1",
            title: "DOM Beat",
            type: "lesson",
            xp: 60,
            duration: "6 min",
            summary: "Select elements, wire events, and update what users see.",
            linkedId: "javascript-intermediate-dom-beat",
          },
          {
            id: "js-i-node-2",
            title: "Event Echo",
            type: "preview",
            xp: 55,
            duration: "5 min",
            summary: "Translate clicks and input into useful state changes.",
          },
          {
            id: "js-i-node-3",
            title: "State Strip",
            type: "preview",
            xp: 55,
            duration: "5 min",
            summary: "Keep your UI honest by updating data in one clear place.",
          },
          {
            id: "js-i-node-4",
            title: "DOM Rescue",
            type: "challenge",
            xp: 95,
            duration: "3 rounds",
            summary: "Repair a broken interaction loop before the crowd notices.",
            linkedId: "challenge-javascript-intermediate-dom-rescue",
          },
        ],
      },
      advanced: {
        levelId: "advanced",
        worldName: "Async Skyline",
        mood: "Flow control, architecture, and responsive performance.",
        dailyQuest: "Choose the cleaner async path and explain the user impact.",
        capstone: "Latency League",
        nodes: [
          {
            id: "js-a-node-1",
            title: "Async Arcade",
            type: "lesson",
            xp: 72,
            duration: "7 min",
            summary: "Tame promises, keep interfaces responsive, and avoid tangled flows.",
            linkedId: "javascript-advanced-async-arcade",
          },
          {
            id: "js-a-node-2",
            title: "Render Relay",
            type: "preview",
            xp: 60,
            duration: "5 min",
            summary: "Update only what matters so your app feels quick.",
          },
          {
            id: "js-a-node-3",
            title: "State Splitter",
            type: "preview",
            xp: 60,
            duration: "5 min",
            summary: "Separate concerns before complexity starts to spread.",
          },
          {
            id: "js-a-node-4",
            title: "Latency League",
            type: "challenge",
            xp: 115,
            duration: "4 rounds",
            summary: "Balance responsiveness, correctness, and maintainability in motion.",
            linkedId: "challenge-javascript-advanced-latency-league",
          },
        ],
      },
    },
    badges: ["DOM DJ", "Async tactician", "UI rhythm"],
  },
  {
    id: "sql",
    name: "SQL",
    icon: "sql",
    tagline: "Question your data like a treasure hunter",
    description:
      "Write crisp queries, filter with intent, and reveal patterns hidden in tables.",
    accent: "#3db7d8",
    surface: "linear-gradient(135deg, #ddf7ff 0%, #c9f1ff 48%, #b4ebff 100%)",
    glow: "#7ddcf5",
    stats: [
      { label: "Signature move", value: "Ask better questions" },
      { label: "Mood", value: "Clear and analytical" },
    ],
    topics: {
      beginner: ["SELECT", "WHERE", "ORDER BY", "Basic tables"],
      intermediate: ["GROUP BY", "Aggregates", "Joins", "Filtering"],
      advanced: ["Windows", "CTEs", "Query tradeoffs", "Modeling intuition"],
    },
    paths: {
      beginner: {
        levelId: "beginner",
        worldName: "Query Quay",
        mood: "Fast wins from asking tables simple, powerful questions.",
        dailyQuest: "Pull one column and filter one result set.",
        capstone: "Query Sprint",
        nodes: [
          {
            id: "sql-b-node-1",
            title: "Select Sprint",
            type: "lesson",
            xp: 42,
            duration: "5 min",
            summary: "Pick columns, scan rows, and make your first useful query.",
            linkedId: "sql-beginner-select-sprint",
          },
          {
            id: "sql-b-node-2",
            title: "Filter Ferry",
            type: "preview",
            xp: 40,
            duration: "4 min",
            summary: "Use WHERE to keep only the rows you care about.",
          },
          {
            id: "sql-b-node-3",
            title: "Sort Harbor",
            type: "preview",
            xp: 45,
            duration: "5 min",
            summary: "Reorder your result set so the story is easy to read.",
          },
          {
            id: "sql-b-node-4",
            title: "Query Sprint",
            type: "challenge",
            xp: 85,
            duration: "3 rounds",
            summary: "Choose the right clauses before the data tide rolls out.",
            linkedId: "challenge-sql-beginner-query-sprint",
          },
        ],
      },
      intermediate: {
        levelId: "intermediate",
        worldName: "Insight Basin",
        mood: "Grouping, aggregates, and more tactical query thinking.",
        dailyQuest: "Summarize a table and explain what the metric means.",
        capstone: "Aggregate Ascent",
        nodes: [
          {
            id: "sql-i-node-1",
            title: "Group Grove",
            type: "lesson",
            xp: 58,
            duration: "6 min",
            summary: "Cluster rows together and compute clean summaries.",
            linkedId: "sql-intermediate-group-grove",
          },
          {
            id: "sql-i-node-2",
            title: "Join Jetty",
            type: "preview",
            xp: 55,
            duration: "5 min",
            summary: "Combine tables when one table is not enough.",
          },
          {
            id: "sql-i-node-3",
            title: "Metric Market",
            type: "preview",
            xp: 55,
            duration: "5 min",
            summary: "Choose counts, averages, and sums with purpose.",
          },
          {
            id: "sql-i-node-4",
            title: "Aggregate Ascent",
            type: "challenge",
            xp: 95,
            duration: "3 rounds",
            summary: "Use grouping logic to surface useful signals at speed.",
            linkedId: "challenge-sql-intermediate-aggregate-ascent",
          },
        ],
      },
      advanced: {
        levelId: "advanced",
        worldName: "Window Ridge",
        mood: "Analytical power moves and query-shape reasoning.",
        dailyQuest: "Compare two queries and defend the more scalable one.",
        capstone: "Window Wave",
        nodes: [
          {
            id: "sql-a-node-1",
            title: "Window Wave",
            type: "lesson",
            xp: 72,
            duration: "7 min",
            summary: "Use ranking and running insight without collapsing rows too soon.",
            linkedId: "sql-advanced-window-wave",
          },
          {
            id: "sql-a-node-2",
            title: "CTE Canyon",
            type: "preview",
            xp: 60,
            duration: "5 min",
            summary: "Break complex logic into readable stages.",
          },
          {
            id: "sql-a-node-3",
            title: "Plan Prism",
            type: "preview",
            xp: 60,
            duration: "5 min",
            summary: "Think about performance, not just correctness.",
          },
          {
            id: "sql-a-node-4",
            title: "Ranking Relay",
            type: "challenge",
            xp: 115,
            duration: "4 rounds",
            summary: "Read, rank, and optimize analytical queries under pressure.",
            linkedId: "challenge-sql-advanced-ranking-relay",
          },
        ],
      },
    },
    badges: ["Query diver", "Metric shaper", "Insight tracker"],
  },
  {
    id: "html-css",
    name: "HTML/CSS",
    icon: "html",
    tagline: "Turn structure and styling into polished worlds",
    description:
      "Learn how layout, spacing, and responsive systems make interfaces feel intentional.",
    accent: "#5ad2aa",
    surface: "linear-gradient(135deg, #e7fff7 0%, #d8fff0 45%, #bdf7e5 100%)",
    glow: "#8ee9c6",
    stats: [
      { label: "Signature move", value: "Shape the screen" },
      { label: "Mood", value: "Creative and crisp" },
    ],
    topics: {
      beginner: ["Tags", "Structure", "Flexbox", "Spacing"],
      intermediate: ["Layout systems", "Responsive thinking", "Components", "Hierarchy"],
      advanced: ["Motion", "Design systems", "Performance", "Polish"],
    },
    paths: {
      beginner: {
        levelId: "beginner",
        worldName: "Flex Forest",
        mood: "Friendly structure lessons with immediate visual payoff.",
        dailyQuest: "Wrap one section, align one row, and improve one spacing choice.",
        capstone: "Layout League",
        nodes: [
          {
            id: "html-b-node-1",
            title: "Flexbox Flow",
            type: "lesson",
            xp: 42,
            duration: "5 min",
            summary: "Line items up, space them well, and build confidence in layout.",
            linkedId: "html-css-beginner-flexbox-flow",
          },
          {
            id: "html-b-node-2",
            title: "Tag Trail",
            type: "preview",
            xp: 40,
            duration: "4 min",
            summary: "Use semantic tags so your page has a clean skeleton.",
          },
          {
            id: "html-b-node-3",
            title: "Spacing Springs",
            type: "preview",
            xp: 45,
            duration: "5 min",
            summary: "Create breathing room so interfaces feel calm and readable.",
          },
          {
            id: "html-b-node-4",
            title: "Layout League",
            type: "challenge",
            xp: 85,
            duration: "3 rounds",
            summary: "Arrange panels and style cues into a coherent screen fast.",
            linkedId: "challenge-html-css-beginner-layout-league",
          },
        ],
      },
      intermediate: {
        levelId: "intermediate",
        worldName: "Studio Strand",
        mood: "Responsive layout moves and stronger compositional judgment.",
        dailyQuest: "Improve one layout for desktop and mobile in the same pass.",
        capstone: "Responsive Rally",
        nodes: [
          {
            id: "html-i-node-1",
            title: "Layout Studio",
            type: "lesson",
            xp: 58,
            duration: "6 min",
            summary: "Build stronger section hierarchy and fluid layouts.",
            linkedId: "html-css-intermediate-layout-studio",
          },
          {
            id: "html-i-node-2",
            title: "Responsive Ramp",
            type: "preview",
            xp: 55,
            duration: "5 min",
            summary: "Keep the same idea working across different screen widths.",
          },
          {
            id: "html-i-node-3",
            title: "Component Cove",
            type: "preview",
            xp: 55,
            duration: "5 min",
            summary: "Repeat patterns without making the UI feel repetitive.",
          },
          {
            id: "html-i-node-4",
            title: "Responsive Rally",
            type: "challenge",
            xp: 95,
            duration: "3 rounds",
            summary: "Protect hierarchy while the viewport keeps shifting.",
            linkedId: "challenge-html-css-intermediate-responsive-rally",
          },
        ],
      },
      advanced: {
        levelId: "advanced",
        worldName: "Motion Terrace",
        mood: "Systematic polish, tasteful movement, and visual discipline.",
        dailyQuest: "Choose motion that clarifies rather than distracts.",
        capstone: "Polish Summit",
        nodes: [
          {
            id: "html-a-node-1",
            title: "Motion Masonry",
            type: "lesson",
            xp: 72,
            duration: "7 min",
            summary: "Blend design systems, motion, and restraint into premium surfaces.",
            linkedId: "html-css-advanced-motion-masonry",
          },
          {
            id: "html-a-node-2",
            title: "Token Terrace",
            type: "preview",
            xp: 60,
            duration: "5 min",
            summary: "Build reusable color, spacing, and type decisions.",
          },
          {
            id: "html-a-node-3",
            title: "Performance Porch",
            type: "preview",
            xp: 60,
            duration: "5 min",
            summary: "Keep rich interfaces lightweight and responsive.",
          },
          {
            id: "html-a-node-4",
            title: "Polish Summit",
            type: "challenge",
            xp: 115,
            duration: "4 rounds",
            summary: "Make styling choices that feel deliberate under constraints.",
            linkedId: "challenge-html-css-advanced-polish-summit",
          },
        ],
      },
    },
    badges: ["Layout poet", "Spacing sculptor", "Motion stylist"],
  },
  {
    id: "ai",
    name: "AI",
    icon: "ai",
    tagline: "Turn abstract machine learning ideas into playable intuition",
    description:
      "Learn how models, embeddings, prompts, training, and inference actually work through interactive mini-worlds.",
    accent: "#ff6b64",
    surface: "linear-gradient(135deg, #fff0e3 0%, #ffe1cf 42%, #ffd0c9 100%)",
    glow: "#ffa98c",
    stats: [
      { label: "Hero mechanic", value: "Concept mini-games" },
      { label: "Mood", value: "Warm, futuristic, and curious" },
    ],
    topics: {
      beginner: [
        "AI basics",
        "Machine learning intuition",
        "Neural networks",
        "Prompts and LLM basics",
      ],
      intermediate: [
        "Embeddings",
        "Classification",
        "Overfitting",
        "Supervised vs unsupervised",
      ],
      advanced: [
        "Deep learning tradeoffs",
        "Prompt pipelines",
        "Training vs inference",
        "Architecture intuition",
      ],
    },
    paths: {
      beginner: {
        levelId: "beginner",
        worldName: "Signal Garden",
        mood: "Playful concept building with supportive visual explanations.",
        dailyQuest: "Understand one new AI idea and finish one mini-game.",
        capstone: "Vector Vault",
        nodes: [
          {
            id: "ai-b-node-1",
            title: "Pattern Sense",
            type: "lesson",
            xp: 45,
            duration: "5 min",
            summary: "What AI really is: pattern recognition, not magic.",
            linkedId: "ai-beginner-pattern-sense",
          },
          {
            id: "ai-b-node-2",
            title: "Neural Garden",
            type: "lesson",
            xp: 50,
            duration: "6 min",
            summary: "See neurons as simple signal mixers that stack into networks.",
            linkedId: "ai-beginner-neural-garden",
          },
          {
            id: "ai-b-node-3",
            title: "Prompt Playground",
            type: "preview",
            xp: 45,
            duration: "5 min",
            summary: "Shape better answers by giving models better instructions.",
          },
          {
            id: "ai-b-node-4",
            title: "Vision Pebbles",
            type: "preview",
            xp: 40,
            duration: "4 min",
            summary: "How computer vision starts by turning pictures into useful signals.",
          },
          {
            id: "ai-b-node-5",
            title: "Vector Vault",
            type: "challenge",
            xp: 95,
            duration: "4 rounds",
            summary: "Play with meaning, prompts, and model stages in one burst.",
            linkedId: "challenge-ai-beginner-vector-vault",
          },
        ],
      },
      intermediate: {
        levelId: "intermediate",
        worldName: "Embedding Bay",
        mood: "Applied AI concepts, classification choices, and model behavior.",
        dailyQuest: "Solve one concept puzzle and explain one tradeoff.",
        capstone: "Overfit Escape",
        nodes: [
          {
            id: "ai-i-node-1",
            title: "Embedding Explorer",
            type: "lesson",
            xp: 58,
            duration: "6 min",
            summary: "Understand how meaning gets mapped into vectors.",
            linkedId: "ai-intermediate-embedding-explorer",
          },
          {
            id: "ai-i-node-2",
            title: "Classifier Clinic",
            type: "lesson",
            xp: 60,
            duration: "6 min",
            summary: "Practice features, labels, and evaluation in approachable ways.",
            linkedId: "ai-intermediate-classifier-clinic",
          },
          {
            id: "ai-i-node-3",
            title: "Cluster Coast",
            type: "preview",
            xp: 50,
            duration: "5 min",
            summary: "When you have no labels, structure still shows up in the data.",
          },
          {
            id: "ai-i-node-4",
            title: "Loss Lantern",
            type: "preview",
            xp: 50,
            duration: "5 min",
            summary: "See feedback as the signal that helps a model improve.",
          },
          {
            id: "ai-i-node-5",
            title: "Overfit Escape",
            type: "challenge",
            xp: 105,
            duration: "4 rounds",
            summary: "Rescue a model from memorizing instead of generalizing.",
            linkedId: "challenge-ai-intermediate-overfit-escape",
          },
        ],
      },
      advanced: {
        levelId: "advanced",
        worldName: "Model Forge",
        mood: "Architecture intuition, system design, and serious tradeoffs.",
        dailyQuest: "Compare two pipelines and defend the stronger one.",
        capstone: "Tradeoff Gauntlet",
        nodes: [
          {
            id: "ai-a-node-1",
            title: "Architecture Arena",
            type: "lesson",
            xp: 72,
            duration: "7 min",
            summary: "Reason about context windows, latency, model size, and capability.",
            linkedId: "ai-advanced-architecture-arena",
          },
          {
            id: "ai-a-node-2",
            title: "Training Relay",
            type: "lesson",
            xp: 74,
            duration: "7 min",
            summary: "Separate training from inference and place each cost where it belongs.",
            linkedId: "ai-advanced-training-relay",
          },
          {
            id: "ai-a-node-3",
            title: "Prompt Pipeline Forge",
            type: "preview",
            xp: 60,
            duration: "6 min",
            summary: "Chain retrieval, prompting, and evaluation into a reliable system.",
          },
          {
            id: "ai-a-node-4",
            title: "Vision Frontier",
            type: "preview",
            xp: 60,
            duration: "5 min",
            summary: "Think in modalities, not just text, when you design AI experiences.",
          },
          {
            id: "ai-a-node-5",
            title: "Tradeoff Gauntlet",
            type: "challenge",
            xp: 120,
            duration: "5 rounds",
            summary: "Pick the right model and architecture when constraints get real.",
            linkedId: "challenge-ai-advanced-tradeoff-gauntlet",
          },
        ],
      },
    },
    badges: ["Prompt pilot", "Vector mapper", "Model strategist"],
  },
];

export const lessons: LessonDefinition[] = [
  {
    id: "python-beginner-variable-garden",
    trackId: "python",
    levelId: "beginner",
    title: "Variable Garden",
    subtitle: "Every value needs a clear little home",
    intro:
      "Variables are labels for values. Once you name something clearly, you can reuse it without rewriting the value every time.",
    conceptCard:
      "Think of a variable as a glowing jar label. The value goes inside the jar, and the label lets you grab it later.",
    duration: "5 min",
    xp: 40,
    objective: "Store values and read them back without guessing.",
    rewardLabel: "Unlocked: Jar Keeper badge",
    challengeId: "challenge-python-beginner-loop-rush",
    exercises: [
      {
        id: "py-var-1",
        type: "multiple-choice",
        prompt: "Which line gives the value 8 a clear variable name?",
        options: ["8 = score", "score = 8", "score == 8", "let score: 8"],
        answer: "score = 8",
        feedback:
          "Exactly. In Python, the name comes first, then `=` assigns the value into it.",
      },
      {
        id: "py-var-2",
        type: "fill-blank",
        prompt: "Fill the missing variable name.",
        snippet: "___ = 'rocket fuel'",
        answer: "supplies",
        hint: "Use a readable plural noun.",
        feedback:
          "Readable names matter. `supplies` tells future-you what is stored there.",
      },
      {
        id: "py-var-3",
        type: "output",
        prompt: "What does this print?",
        code: "coins = 3\ncoins = coins + 2\nprint(coins)",
        options: ["3", "5", "32", "Error"],
        answer: "5",
        feedback:
          "Nice. The second line updates the same variable, so the final stored value is 5.",
      },
    ],
  },
  {
    id: "python-intermediate-function-forecast",
    trackId: "python",
    levelId: "intermediate",
    title: "Function Forecast",
    subtitle: "Turn repeated logic into reusable moves",
    intro:
      "Intermediate Python starts to feel good when repeated actions become functions with inputs and outputs.",
    conceptCard:
      "A function is a compact machine: values go in, useful work happens, and a result can come out.",
    duration: "6 min",
    xp: 55,
    objective: "Read, call, and return from functions with confidence.",
    rewardLabel: "Unlocked: Logic Loom",
    challengeId: "challenge-python-intermediate-debug-drift",
    exercises: [
      {
        id: "py-fn-1",
        type: "multiple-choice",
        prompt: "What does `return` do inside a function?",
        options: [
          "Repeats the function forever",
          "Sends a value back to where the function was called",
          "Creates a loop",
          "Prints text to the screen",
        ],
        answer: "Sends a value back to where the function was called",
        feedback:
          "Yes. `return` hands the result back so the caller can use it somewhere else.",
      },
      {
        id: "py-fn-2",
        type: "output",
        prompt: "Predict the result.",
        code: "def double(value):\n    return value * 2\n\nprint(double(4))",
        options: ["2", "4", "8", "Error"],
        answer: "8",
        feedback:
          "Exactly. The function receives 4, multiplies it by 2, and returns 8.",
      },
    ],
  },
  {
    id: "python-advanced-automation-orbit",
    trackId: "python",
    levelId: "advanced",
    title: "Automation Orbit",
    subtitle: "Build scripts that survive real-world mess",
    intro:
      "Advanced Python is often less about syntax and more about designing small, reliable systems that handle imperfect inputs.",
    conceptCard:
      "Good automation is a calm teammate: it names steps clearly, handles bad input, and leaves a readable trail.",
    duration: "7 min",
    xp: 70,
    objective: "Choose reliability and clarity when you automate repeated tasks.",
    rewardLabel: "Unlocked: Orbit Orchestrator",
    challengeId: "challenge-python-advanced-orchestrator-run",
    exercises: [
      {
        id: "py-auto-1",
        type: "multiple-choice",
        prompt: "Which addition makes an automation script safer?",
        options: [
          "Assume every file exists",
          "Add validation and a helpful error message",
          "Use shorter variable names everywhere",
          "Print less information",
        ],
        answer: "Add validation and a helpful error message",
        feedback:
          "Exactly. Real inputs are messy, so validation keeps the flow readable and resilient.",
      },
      {
        id: "py-auto-2",
        type: "reorder",
        prompt: "Arrange a reliable automation flow.",
        tokens: [
          "Log what happened",
          "Validate the input",
          "Perform the transformation",
          "Load the source data",
        ],
        answer: [
          "Load the source data",
          "Validate the input",
          "Perform the transformation",
          "Log what happened",
        ],
        feedback:
          "That order keeps the script honest: inspect first, then act, then leave a useful trace.",
      },
    ],
  },
  {
    id: "cpp-beginner-loop-launch",
    trackId: "cpp",
    levelId: "beginner",
    title: "Loop Launch",
    subtitle: "Repeat with purpose, not copy-paste",
    intro:
      "C++ can feel intense at first, but loops are one of the first places the language starts to feel empowering.",
    conceptCard:
      "A `for` loop is a repeat track with a built-in counter. It gives structure to repetition.",
    duration: "5 min",
    xp: 45,
    objective: "Recognize the structure of a simple `for` loop.",
    rewardLabel: "Unlocked: Launch Counter",
    challengeId: "challenge-cpp-beginner-syntax-sprint",
    exercises: [
      {
        id: "cpp-loop-1",
        type: "multiple-choice",
        prompt: "Which keyword starts a counting loop in C++?",
        options: ["loop", "repeat", "for", "count"],
        answer: "for",
        feedback:
          "Right. `for` is the classic counting loop structure in C++.",
      },
      {
        id: "cpp-loop-2",
        type: "output",
        prompt: "How many lines print?",
        code: "for (int i = 0; i < 3; i++) {\n  cout << i << endl;\n}",
        options: ["2", "3", "4", "It never stops"],
        answer: "3",
        feedback:
          "Exactly. `i` takes the values 0, 1, and 2, so the body runs three times.",
      },
    ],
  },
  {
    id: "cpp-intermediate-vector-rally",
    trackId: "cpp",
    levelId: "intermediate",
    title: "Vector Rally",
    subtitle: "Use dynamic collections without losing control",
    intro:
      "Vectors give C++ a comfortable way to store lists that can grow, shrink, and be indexed cleanly.",
    conceptCard:
      "A vector is like a smart row of lockers: each slot has an index, and the whole row can expand when needed.",
    duration: "6 min",
    xp: 60,
    objective: "Add to vectors and predict how they behave.",
    rewardLabel: "Unlocked: Container Compass",
    challengeId: "challenge-cpp-intermediate-vector-arena",
    exercises: [
      {
        id: "cpp-vector-1",
        type: "multiple-choice",
        prompt: "Which container is a good fit for a list that may grow over time?",
        options: ["vector<int>", "int", "bool", "char"],
        answer: "vector<int>",
        feedback:
          "Exactly. A vector is built to hold multiple values and expand when you add more.",
      },
      {
        id: "cpp-vector-2",
        type: "output",
        prompt: "What does this print?",
        code: "vector<int> scores = {4, 6, 9};\nscores.push_back(8);\ncout << scores.size();",
        options: ["3", "4", "8", "9"],
        answer: "4",
        feedback:
          "Nice. After `push_back(8)`, the vector contains four numbers.",
      },
    ],
  },
  {
    id: "cpp-advanced-performance-pit",
    trackId: "cpp",
    levelId: "advanced",
    title: "Performance Pit",
    subtitle: "Reason about copies before they slow you down",
    intro:
      "Advanced C++ rewards developers who notice when data is moving around more than it needs to.",
    conceptCard:
      "Performance intuition starts with one question: are you copying data, or are you reusing it safely?",
    duration: "7 min",
    xp: 70,
    objective: "Spot design choices that reduce unnecessary work.",
    rewardLabel: "Unlocked: Fast Path Emblem",
    challengeId: "challenge-cpp-advanced-memory-maze",
    exercises: [
      {
        id: "cpp-perf-1",
        type: "multiple-choice",
        prompt: "Why might a reference be helpful in performance-sensitive code?",
        options: [
          "It automatically sorts data",
          "It can avoid copying large objects",
          "It turns every loop into recursion",
          "It hides compile errors",
        ],
        answer: "It can avoid copying large objects",
        feedback:
          "Yes. Reusing existing data instead of copying it can cut unnecessary work.",
      },
      {
        id: "cpp-perf-2",
        type: "reorder",
        prompt: "Put these optimization instincts in a sane order.",
        tokens: [
          "Measure the real bottleneck",
          "Rewrite everything in one pass",
          "Pick the data flow that copies less",
          "Keep the code understandable",
        ],
        answer: [
          "Measure the real bottleneck",
          "Pick the data flow that copies less",
          "Keep the code understandable",
          "Rewrite everything in one pass",
        ],
        feedback:
          "Great call. Measure first, optimize intentionally, and never sacrifice clarity without evidence.",
      },
    ],
  },
  {
    id: "javascript-beginner-array-riff",
    trackId: "javascript",
    levelId: "beginner",
    title: "Array Riff",
    subtitle: "Group values into one playable list",
    intro:
      "Arrays are one of JavaScript’s first superpowers. They keep related values together so you can loop, inspect, and reuse them.",
    conceptCard:
      "An array is a playlist for data. Each value keeps its place, and you can cue up any slot when you need it.",
    duration: "5 min",
    xp: 45,
    objective: "Recognize, create, and read from arrays.",
    rewardLabel: "Unlocked: Playlist Protocol",
    challengeId: "challenge-javascript-beginner-array-dash",
    exercises: [
      {
        id: "js-array-1",
        type: "multiple-choice",
        prompt: "Which line creates an array of colors?",
        options: [
          "let colors = 'red', 'blue'",
          "let colors = ['red', 'blue']",
          "let colors = {'red', 'blue'}",
          "let colors = <red, blue>",
        ],
        answer: "let colors = ['red', 'blue']",
        feedback:
          "Exactly. Square brackets create an array in JavaScript.",
      },
      {
        id: "js-array-2",
        type: "output",
        prompt: "What does this print?",
        code: "const snacks = ['chips', 'fruit', 'tea'];\nconsole.log(snacks[1]);",
        options: ["chips", "fruit", "tea", "undefined"],
        answer: "fruit",
        feedback:
          "Right. Arrays start counting at 0, so index 1 is the second value.",
      },
    ],
  },
  {
    id: "javascript-intermediate-dom-beat",
    trackId: "javascript",
    levelId: "intermediate",
    title: "DOM Beat",
    subtitle: "Make the page react to the player",
    intro:
      "The DOM is how JavaScript reaches into the page. Once you can select an element and change it, interfaces become interactive.",
    conceptCard:
      "Think of the DOM as the page’s stage map. JavaScript is your lighting crew, swapping text, classes, and state live.",
    duration: "6 min",
    xp: 60,
    objective: "Select a page element and update it after an event.",
    rewardLabel: "Unlocked: Interface Instinct",
    challengeId: "challenge-javascript-intermediate-dom-rescue",
    exercises: [
      {
        id: "js-dom-1",
        type: "multiple-choice",
        prompt: "Which method grabs the first element matching a CSS selector?",
        options: [
          "document.querySelector()",
          "document.getNode()",
          "document.findElement()",
          "window.select()",
        ],
        answer: "document.querySelector()",
        feedback:
          "Exactly. `querySelector` is a flexible way to target an element on the page.",
      },
      {
        id: "js-dom-2",
        type: "match",
        prompt: "Match each DOM tool to its role.",
        pairs: [
          { left: "addEventListener", right: "Runs code when an event happens" },
          { left: "textContent", right: "Changes visible text inside an element" },
          { left: "classList.toggle", right: "Adds or removes a class based on current state" },
        ],
        feedback:
          "Perfect. Those three tools cover a huge amount of everyday UI behavior.",
      },
    ],
  },
  {
    id: "javascript-advanced-async-arcade",
    trackId: "javascript",
    levelId: "advanced",
    title: "Async Arcade",
    subtitle: "Keep interfaces responsive while work happens elsewhere",
    intro:
      "Advanced JavaScript means managing delayed work without letting the UI turn confusing or slow.",
    conceptCard:
      "Async flow is choreography: start the task, show the right state, then update calmly when results arrive.",
    duration: "7 min",
    xp: 72,
    objective: "Reason about async behavior from the user’s point of view.",
    rewardLabel: "Unlocked: Latency Lantern",
    challengeId: "challenge-javascript-advanced-latency-league",
    exercises: [
      {
        id: "js-async-1",
        type: "multiple-choice",
        prompt: "What is a good UI move while a request is still loading?",
        options: [
          "Freeze the whole page",
          "Show a loading state and keep the interface stable",
          "Hide all content forever",
          "Reload the browser",
        ],
        answer: "Show a loading state and keep the interface stable",
        feedback:
          "Exactly. Great async UX keeps people oriented while the work is happening.",
      },
      {
        id: "js-async-2",
        type: "reorder",
        prompt: "Arrange a healthy async interaction flow.",
        tokens: [
          "Render the result or error state",
          "Start the request",
          "Show loading feedback",
          "User triggers the action",
        ],
        answer: [
          "User triggers the action",
          "Show loading feedback",
          "Start the request",
          "Render the result or error state",
        ],
        feedback:
          "Nice. The user should feel informed immediately, long before the result arrives.",
      },
    ],
  },
  {
    id: "sql-beginner-select-sprint",
    trackId: "sql",
    levelId: "beginner",
    title: "Select Sprint",
    subtitle: "Ask tables simple questions first",
    intro:
      "SQL becomes approachable when you treat a table like a list of records you can inspect, filter, and sort.",
    conceptCard:
      "`SELECT` is the opening move. It tells the database which columns you want to see.",
    duration: "5 min",
    xp: 42,
    objective: "Read and write a small SELECT statement with confidence.",
    rewardLabel: "Unlocked: Table Tracker",
    challengeId: "challenge-sql-beginner-query-sprint",
    exercises: [
      {
        id: "sql-select-1",
        type: "multiple-choice",
        prompt: "Which clause narrows rows to only the ones you want?",
        options: ["WHERE", "ORDER BY", "GROUP BY", "FROM ALL"],
        answer: "WHERE",
        feedback:
          "Right. `WHERE` filters the table down to matching rows.",
      },
      {
        id: "sql-select-2",
        type: "reorder",
        prompt: "Put this query in the right order.",
        tokens: ["ORDER BY launches DESC", "SELECT name", "FROM rockets"],
        answer: ["SELECT name", "FROM rockets", "ORDER BY launches DESC"],
        feedback:
          "Perfect. SQL reads cleanly when the clauses stay in their usual order.",
      },
    ],
  },
  {
    id: "sql-intermediate-group-grove",
    trackId: "sql",
    levelId: "intermediate",
    title: "Group Grove",
    subtitle: "Turn rows into useful summaries",
    intro:
      "Once you can group records together, SQL starts to feel like a true analysis tool instead of just a lookup language.",
    conceptCard:
      "`GROUP BY` gathers rows that share a value, then lets aggregate functions summarize each group.",
    duration: "6 min",
    xp: 58,
    objective: "Read grouped queries and know what the results represent.",
    rewardLabel: "Unlocked: Signal Summoner",
    challengeId: "challenge-sql-intermediate-aggregate-ascent",
    exercises: [
      {
        id: "sql-group-1",
        type: "multiple-choice",
        prompt: "What does `COUNT(*)` usually tell you inside a grouped query?",
        options: [
          "The length of the SQL file",
          "The number of rows in each group",
          "The number of columns in the table",
          "The number of databases",
        ],
        answer: "The number of rows in each group",
        feedback:
          "Exactly. `COUNT(*)` tells you how many records ended up inside each grouped bucket.",
      },
      {
        id: "sql-group-2",
        type: "output",
        prompt: "What is this query trying to show?",
        code: "SELECT team, COUNT(*)\nFROM matches\nGROUP BY team;",
        options: [
          "A list of match IDs",
          "How many matches each team has",
          "The average match length",
          "The fastest team only",
        ],
        answer: "How many matches each team has",
        feedback:
          "Nice. Grouping by team and counting rows shows total matches per team.",
      },
    ],
  },
  {
    id: "sql-advanced-window-wave",
    trackId: "sql",
    levelId: "advanced",
    title: "Window Wave",
    subtitle: "Rank and compare without collapsing the rows",
    intro:
      "Window functions are one of SQL’s most satisfying advanced tools because they let you compute context while keeping detail.",
    conceptCard:
      "A window function looks across related rows while still returning each original row, which makes ranking and running metrics possible.",
    duration: "7 min",
    xp: 72,
    objective: "Build intuition for ranking and analytical windows.",
    rewardLabel: "Unlocked: Window Weaver",
    challengeId: "challenge-sql-advanced-ranking-relay",
    exercises: [
      {
        id: "sql-window-1",
        type: "multiple-choice",
        prompt: "Why is a window function useful?",
        options: [
          "It deletes rows automatically",
          "It keeps row detail while also calculating context",
          "It replaces every join",
          "It turns SQL into HTML",
        ],
        answer: "It keeps row detail while also calculating context",
        feedback:
          "Exactly. That is the special superpower of window functions.",
      },
      {
        id: "sql-window-2",
        type: "match",
        prompt: "Match each analytical need to the likely SQL tool.",
        pairs: [
          { left: "Rank top sellers", right: "ROW_NUMBER or RANK window" },
          { left: "Keep row detail", right: "Window function" },
          { left: "Break a long query into stages", right: "CTE" },
        ],
        feedback:
          "Strong. Advanced SQL gets easier when you know which tool fits the analytical job.",
      },
    ],
  },
  {
    id: "html-css-beginner-flexbox-flow",
    trackId: "html-css",
    levelId: "beginner",
    title: "Flexbox Flow",
    subtitle: "Give your layout a simple alignment engine",
    intro:
      "Flexbox is one of the fastest ways to make a UI feel intentional. It helps rows and columns line up without wrestling the page.",
    conceptCard:
      "A flex container is a guide rail. You decide the direction, spacing, and alignment, then the children follow the rule.",
    duration: "5 min",
    xp: 42,
    objective: "Understand what flexbox does and when to use it.",
    rewardLabel: "Unlocked: Alignment Aura",
    challengeId: "challenge-html-css-beginner-layout-league",
    exercises: [
      {
        id: "html-flex-1",
        type: "multiple-choice",
        prompt: "Which CSS declaration turns a container into a flex layout?",
        options: [
          "position: flex",
          "display: flex",
          "layout: flex",
          "flex: display",
        ],
        answer: "display: flex",
        feedback:
          "Exactly. `display: flex` activates the flex formatting context for the container.",
      },
      {
        id: "html-flex-2",
        type: "match",
        prompt: "Match each property to what it helps control.",
        pairs: [
          { left: "justify-content", right: "Space items along the main axis" },
          { left: "align-items", right: "Align items across the cross axis" },
          { left: "gap", right: "Add consistent space between items" },
        ],
        feedback:
          "Perfect. Those three controls alone can clean up a surprising amount of layout work.",
      },
    ],
  },
  {
    id: "html-css-intermediate-layout-studio",
    trackId: "html-css",
    levelId: "intermediate",
    title: "Layout Studio",
    subtitle: "Give each section one clear visual job",
    intro:
      "Intermediate interface design is less about adding things and more about controlling hierarchy, spacing, and section roles.",
    conceptCard:
      "Strong layout starts when every section has one purpose, one dominant idea, and enough whitespace to breathe.",
    duration: "6 min",
    xp: 58,
    objective: "Make structure and hierarchy more intentional.",
    rewardLabel: "Unlocked: Section Sculptor",
    challengeId: "challenge-html-css-intermediate-responsive-rally",
    exercises: [
      {
        id: "html-layout-1",
        type: "multiple-choice",
        prompt: "What usually improves a cluttered section fastest?",
        options: [
          "Add more cards",
          "Increase contrast and spacing around the main idea",
          "Use three accent colors",
          "Shrink all headings",
        ],
        answer: "Increase contrast and spacing around the main idea",
        feedback:
          "Exactly. Hierarchy often improves from composition first, not from extra UI chrome.",
      },
      {
        id: "html-layout-2",
        type: "reorder",
        prompt: "Arrange this section-building flow.",
        tokens: [
          "Refine spacing and alignment",
          "Decide the section’s main job",
          "Place the dominant visual or headline",
          "Add secondary support details",
        ],
        answer: [
          "Decide the section’s main job",
          "Place the dominant visual or headline",
          "Add secondary support details",
          "Refine spacing and alignment",
        ],
        feedback:
          "That order keeps layout purposeful instead of decorative.",
      },
    ],
  },
  {
    id: "html-css-advanced-motion-masonry",
    trackId: "html-css",
    levelId: "advanced",
    title: "Motion Masonry",
    subtitle: "Use motion to clarify, not distract",
    intro:
      "Advanced frontend polish comes from intentional systems: consistent tokens, careful motion, and restraint about what deserves emphasis.",
    conceptCard:
      "Great motion feels like choreography for attention. It should reveal hierarchy and state, not fight them.",
    duration: "7 min",
    xp: 72,
    objective: "Choose richer UI techniques without losing clarity.",
    rewardLabel: "Unlocked: Motion Mason crest",
    challengeId: "challenge-html-css-advanced-polish-summit",
    exercises: [
      {
        id: "html-motion-1",
        type: "multiple-choice",
        prompt: "What is a healthy rule for UI motion?",
        options: [
          "Animate everything the same way",
          "Use motion to reinforce hierarchy or state changes",
          "Never animate anything",
          "Add random bouncing for delight",
        ],
        answer: "Use motion to reinforce hierarchy or state changes",
        feedback:
          "Exactly. The best motion teaches users what just happened or what matters next.",
      },
      {
        id: "html-motion-2",
        type: "match",
        prompt: "Match the design system concept to its purpose.",
        pairs: [
          { left: "Color token", right: "Keeps accents consistent across surfaces" },
          { left: "Motion rule", right: "Makes interactions feel related and predictable" },
          { left: "Spacing scale", right: "Prevents random gaps and crowding" },
        ],
        feedback:
          "Strong. A premium-feeling interface usually rests on repeatable systems, not one-off styling flourishes.",
      },
    ],
  },
  {
    id: "ai-beginner-pattern-sense",
    trackId: "ai",
    levelId: "beginner",
    title: "Pattern Sense",
    subtitle: "What AI really does before the hype arrives",
    intro:
      "At a beginner level, AI is easiest to understand as pattern recognition. A model sees examples, notices regularities, and uses them to make a guess.",
    conceptCard:
      "AI is not a mystical brain in a box. It is a system that maps inputs to useful outputs by learning or using patterns.",
    duration: "5 min",
    xp: 45,
    objective: "Separate AI myth from the real idea of pattern-based prediction.",
    rewardLabel: "Unlocked: Pattern Radar",
    challengeId: "challenge-ai-beginner-vector-vault",
    exercises: [
      {
        id: "ai-pattern-1",
        type: "multiple-choice",
        prompt: "Which description best matches a simple AI system?",
        options: [
          "A system that always knows the truth",
          "A system that notices patterns in examples and makes guesses",
          "A system that only stores random numbers",
          "A system that ignores past data",
        ],
        answer: "A system that notices patterns in examples and makes guesses",
        feedback:
          "Exactly. Pattern recognition and prediction are a much healthier mental model than 'magic intelligence.'",
      },
      {
        id: "ai-pattern-2",
        type: "match",
        prompt: "Match the term to the beginner-friendly meaning.",
        pairs: [
          { left: "Dataset", right: "Examples the system can learn from" },
          { left: "Model", right: "The pattern engine that makes predictions" },
          { left: "Prediction", right: "The output or guess produced by the model" },
        ],
        feedback:
          "Nice. Once those three pieces click, the rest of AI starts to feel much less intimidating.",
      },
      {
        id: "ai-pattern-3",
        type: "reorder",
        prompt: "Arrange the beginner AI loop.",
        tokens: [
          "Check whether the guess was useful",
          "Feed the model examples",
          "Notice patterns",
          "Use the pattern to make a prediction",
        ],
        answer: [
          "Feed the model examples",
          "Notice patterns",
          "Use the pattern to make a prediction",
          "Check whether the guess was useful",
        ],
        feedback:
          "Perfect. That sequence keeps the story grounded in data, patterns, and feedback.",
      },
    ],
  },
  {
    id: "ai-beginner-neural-garden",
    trackId: "ai",
    levelId: "beginner",
    title: "Neural Garden",
    subtitle: "See neural networks as layers of tiny decision-makers",
    intro:
      "A neural network is easier to understand when you stop picturing a human brain and start picturing many small signal mixers stacked together.",
    conceptCard:
      "Each neuron combines inputs, weights them, and passes a signal onward. Layers let simple units build richer behavior together.",
    duration: "6 min",
    xp: 50,
    objective: "Build intuition for layers, neurons, and output signals.",
    rewardLabel: "Unlocked: Signal Bloom",
    challengeId: "challenge-ai-beginner-vector-vault",
    exercises: [
      {
        id: "ai-neural-1",
        type: "multiple-choice",
        prompt: "What does a very simplified neuron do?",
        options: [
          "Stores a whole essay",
          "Mixes inputs and sends forward a signal",
          "Deletes the dataset",
          "Chooses a random answer every time",
        ],
        answer: "Mixes inputs and sends forward a signal",
        feedback:
          "Exactly. That simple picture is enough to start understanding layered neural systems.",
      },
      {
        id: "ai-neural-2",
        type: "fill-blank",
        prompt: "Complete the layer path.",
        snippet: "inputs -> hidden layer -> ___",
        answer: "output",
        hint: "It is the final prediction stage.",
        feedback:
          "Right. Beginner models often get explained as input, hidden, then output.",
      },
      {
        id: "ai-neural-3",
        type: "match",
        prompt: "Match each layer to its role.",
        pairs: [
          { left: "Input layer", right: "Receives the starting data" },
          { left: "Hidden layer", right: "Transforms signals into richer features" },
          { left: "Output layer", right: "Produces the final guess" },
        ],
        feedback:
          "Great. The network becomes easier to picture when each layer has a simple job.",
      },
    ],
  },
  {
    id: "ai-intermediate-embedding-explorer",
    trackId: "ai",
    levelId: "intermediate",
    title: "Embedding Explorer",
    subtitle: "Turn meaning into coordinates you can compare",
    intro:
      "Embeddings let AI systems represent words, images, or documents as numeric vectors where similar items land near one another.",
    conceptCard:
      "An embedding is a compact coordinate map for meaning. Nearby vectors often represent nearby ideas.",
    duration: "6 min",
    xp: 58,
    objective: "Understand how embeddings support similarity, retrieval, and classification.",
    rewardLabel: "Unlocked: Vector Compass",
    challengeId: "challenge-ai-intermediate-overfit-escape",
    exercises: [
      {
        id: "ai-embed-1",
        type: "multiple-choice",
        prompt: "Why are embeddings useful?",
        options: [
          "They replace all training",
          "They let systems compare meaning numerically",
          "They remove the need for data",
          "They guarantee perfect answers",
        ],
        answer: "They let systems compare meaning numerically",
        feedback:
          "Exactly. Embeddings make concepts comparable in a space where distance can mean similarity.",
      },
      {
        id: "ai-embed-2",
        type: "match",
        prompt: "Match the AI concept to the role it plays.",
        pairs: [
          { left: "Embedding", right: "Numeric representation of meaning" },
          { left: "Similarity search", right: "Find nearby vectors for related content" },
          { left: "Retriever", right: "Fetches relevant context before generation" },
        ],
        feedback:
          "Strong. Those ideas combine beautifully in modern search and retrieval systems.",
      },
      {
        id: "ai-embed-3",
        type: "reorder",
        prompt: "Arrange a simple retrieval flow.",
        tokens: [
          "Search for similar vectors",
          "Embed the user’s question",
          "Generate a response with the retrieved context",
          "Store documents as embeddings",
        ],
        answer: [
          "Store documents as embeddings",
          "Embed the user’s question",
          "Search for similar vectors",
          "Generate a response with the retrieved context",
        ],
        feedback:
          "Perfect. That is the intuitive arc behind many retrieval-powered AI products.",
      },
    ],
  },
  {
    id: "ai-intermediate-classifier-clinic",
    trackId: "ai",
    levelId: "intermediate",
    title: "Classifier Clinic",
    subtitle: "Features, labels, and how models learn to separate cases",
    intro:
      "Classification becomes less scary when you treat it like sorting examples into labeled bins using the right clues.",
    conceptCard:
      "In supervised learning, examples come with labels. The model learns the pattern that connects feature clues to those labels.",
    duration: "6 min",
    xp: 60,
    objective: "Connect features, labels, and evaluation to a practical mental model.",
    rewardLabel: "Unlocked: Label Lens",
    challengeId: "challenge-ai-intermediate-overfit-escape",
    exercises: [
      {
        id: "ai-class-1",
        type: "multiple-choice",
        prompt: "What makes a task supervised learning?",
        options: [
          "The data has labels showing the right answer",
          "There is no data at all",
          "The model never gets feedback",
          "The task uses only images",
        ],
        answer: "The data has labels showing the right answer",
        feedback:
          "Exactly. Labels are the teaching signal in supervised learning.",
      },
      {
        id: "ai-class-2",
        type: "match",
        prompt: "Match each term to the practical meaning.",
        pairs: [
          { left: "Feature", right: "A clue the model can use" },
          { left: "Label", right: "The target category to predict" },
          { left: "Accuracy", right: "How often the prediction is correct" },
        ],
        feedback:
          "Nice. That trio gives you a clean starting map for classification.",
      },
      {
        id: "ai-class-3",
        type: "output",
        prompt: "Which label best fits this training example?",
        code: "Example review -> label\n'The soundtrack is stunning' -> ?",
        options: ["positive", "vector", "training", "inference"],
        answer: "positive",
        feedback:
          "Right. The example text is the feature input, and `positive` is the label the model should learn to predict.",
      },
    ],
  },
  {
    id: "ai-advanced-architecture-arena",
    trackId: "ai",
    levelId: "advanced",
    title: "Architecture Arena",
    subtitle: "Choose the right model shape for the job",
    intro:
      "Advanced AI product work is full of constraints: cost, latency, context window, tool use, quality, and reliability all pull in different directions.",
    conceptCard:
      "Architecture thinking means matching the system design to the real product constraint, not choosing the flashiest model on instinct.",
    duration: "7 min",
    xp: 72,
    objective: "Reason about model and pipeline tradeoffs like a product engineer.",
    rewardLabel: "Unlocked: Model Forge Crest",
    challengeId: "challenge-ai-advanced-tradeoff-gauntlet",
    exercises: [
      {
        id: "ai-arch-1",
        type: "multiple-choice",
        prompt: "Which choice most directly lowers inference cost for a lightweight task?",
        options: [
          "Always choose the biggest model",
          "Use a smaller model that still meets the quality bar",
          "Store no prompts",
          "Remove evaluation entirely",
        ],
        answer: "Use a smaller model that still meets the quality bar",
        feedback:
          "Exactly. Right-sizing the model is one of the clearest practical levers.",
      },
      {
        id: "ai-arch-2",
        type: "match",
        prompt: "Match the constraint to the design pressure it creates.",
        pairs: [
          { left: "Latency", right: "Favors faster responses and fewer heavy steps" },
          { left: "Context window", right: "Limits how much information fits at once" },
          { left: "Reliability", right: "Pushes you toward evaluation and fallback plans" },
        ],
        feedback:
          "Strong. Architecture decisions become clearer when each constraint gets a name and a consequence.",
      },
      {
        id: "ai-arch-3",
        type: "reorder",
        prompt: "Arrange a sane product-minded AI system design process.",
        tokens: [
          "Pick the model and supporting tools",
          "Define the user task and constraints",
          "Add evaluation and fallback checks",
          "Prototype the prompt or retrieval flow",
        ],
        answer: [
          "Define the user task and constraints",
          "Pick the model and supporting tools",
          "Prototype the prompt or retrieval flow",
          "Add evaluation and fallback checks",
        ],
        feedback:
          "Yes. Good AI systems begin with product needs, then tooling, then safety and quality loops.",
      },
    ],
  },
  {
    id: "ai-advanced-training-relay",
    trackId: "ai",
    levelId: "advanced",
    title: "Training Relay",
    subtitle: "Place the expensive work where it belongs",
    intro:
      "Training and inference are often confused. One changes the model itself; the other simply uses the trained model to produce an output.",
    conceptCard:
      "Training updates weights using lots of examples. Inference uses those learned weights to answer a fresh request.",
    duration: "7 min",
    xp: 74,
    objective: "Separate learning-time costs from runtime behavior.",
    rewardLabel: "Unlocked: Runtime Relay token",
    challengeId: "challenge-ai-advanced-tradeoff-gauntlet",
    exercises: [
      {
        id: "ai-train-1",
        type: "multiple-choice",
        prompt: "Which phase updates model weights?",
        options: ["Training", "Inference", "Prompting", "Caching"],
        answer: "Training",
        feedback:
          "Exactly. Training changes the model; inference only uses what the model already learned.",
      },
      {
        id: "ai-train-2",
        type: "reorder",
        prompt: "Arrange the lifecycle in the right order.",
        tokens: [
          "Run inference on a new request",
          "Collect and prepare data",
          "Train or fine-tune the model",
          "Evaluate the output in production",
        ],
        answer: [
          "Collect and prepare data",
          "Train or fine-tune the model",
          "Run inference on a new request",
          "Evaluate the output in production",
        ],
        feedback:
          "Great. That puts the expensive learning stage before the live-serving stage.",
      },
      {
        id: "ai-train-3",
        type: "multiple-choice",
        prompt: "Which issue sounds most like overfitting?",
        options: [
          "The model performs well on training examples but poorly on new ones",
          "The model uses vector embeddings",
          "The model answers quickly",
          "The prompt includes role instructions",
        ],
        answer:
          "The model performs well on training examples but poorly on new ones",
        feedback:
          "Exactly. Overfitting is the classic sign that the model memorized more than it generalized.",
      },
    ],
  },
];

export const challenges: ChallengeDefinition[] = [
  {
    id: "challenge-python-beginner-loop-rush",
    trackId: "python",
    levelId: "beginner",
    title: "Loop Rush",
    subtitle: "Quick pattern reps for Python basics",
    description:
      "Bounce through variable and repetition decisions while keeping your streak alive.",
    xp: 80,
    rounds: [
      {
        id: "py-ch-b-1",
        type: "rapid",
        prompt: "Which Python structure repeats code a set number of times?",
        options: ["if", "for", "print", "return"],
        answer: "for",
        feedback: "Right. `for` is the beginner-friendly repeat engine.",
      },
      {
        id: "py-ch-b-2",
        type: "sequence",
        prompt: "Put the loop-building steps in order.",
        steps: [
          "Write the body that repeats",
          "Choose the values to loop over",
          "Start the `for` line",
        ],
        answer: [
          "Start the `for` line",
          "Choose the values to loop over",
          "Write the body that repeats",
        ],
        feedback:
          "Nice. The header names the loop, then the indented body handles the repeated action.",
      },
    ],
  },
  {
    id: "challenge-python-intermediate-debug-drift",
    trackId: "python",
    levelId: "intermediate",
    title: "Debug Drift",
    subtitle: "Repair function logic while the current gets faster",
    description:
      "Read a snippet, identify the function behavior, and choose the cleanest fix.",
    xp: 90,
    rounds: [
      {
        id: "py-ch-i-1",
        type: "rapid",
        prompt: "What is the safest first move when a function returns the wrong thing?",
        options: [
          "Rename every variable",
          "Inspect the inputs and expected output",
          "Delete the function",
          "Convert it to JavaScript",
        ],
        answer: "Inspect the inputs and expected output",
        feedback:
          "Exactly. Debugging starts with understanding, not with frantic rewriting.",
      },
      {
        id: "py-ch-i-2",
        type: "sort",
        prompt: "Sort each debugging move into the right phase.",
        categories: ["Understand", "Act"],
        cards: [
          { id: "py-sort-1", label: "Read the failing output", answer: "Understand" },
          { id: "py-sort-2", label: "Patch the return statement", answer: "Act" },
          { id: "py-sort-3", label: "Trace the input values", answer: "Understand" },
          { id: "py-sort-4", label: "Rerun the check", answer: "Act" },
        ],
        feedback:
          "Perfect. Great debugging flows back and forth between understanding and acting.",
      },
    ],
  },
  {
    id: "challenge-python-advanced-orchestrator-run",
    trackId: "python",
    levelId: "advanced",
    title: "Orchestrator Run",
    subtitle: "Balance reliability and clarity in automation",
    description:
      "Choose the flow that stays robust when real inputs get ugly.",
    xp: 110,
    rounds: [
      {
        id: "py-ch-a-1",
        type: "rapid",
        prompt: "Which design is usually safer for a production automation script?",
        options: [
          "One huge function with no checks",
          "Small steps with validation and logging",
          "No errors, just silence",
          "Random retries without limits",
        ],
        answer: "Small steps with validation and logging",
        feedback:
          "Exactly. Reliability loves readable stages and explicit safeguards.",
      },
      {
        id: "py-ch-a-2",
        type: "sequence",
        prompt: "Sequence the orchestration flow.",
        steps: [
          "Transform and write output",
          "Validate inputs and config",
          "Observe and log outcomes",
          "Load source files",
        ],
        answer: [
          "Load source files",
          "Validate inputs and config",
          "Transform and write output",
          "Observe and log outcomes",
        ],
        feedback:
          "Strong. That flow keeps the system inspectable from start to finish.",
      },
    ],
  },
  {
    id: "challenge-cpp-beginner-syntax-sprint",
    trackId: "cpp",
    levelId: "beginner",
    title: "Syntax Sprint",
    subtitle: "Lock in the rhythm of beginner C++",
    description:
      "Hit the right symbols, loop structure, and basic intent without freezing up.",
    xp: 85,
    rounds: [
      {
        id: "cpp-ch-b-1",
        type: "rapid",
        prompt: "Which symbol usually ends a C++ statement?",
        options: [":", ";", ",", "."],
        answer: ";",
        feedback: "Right. The semicolon is part of the language’s sentence rhythm.",
      },
      {
        id: "cpp-ch-b-2",
        type: "sequence",
        prompt: "Order the pieces of a basic loop.",
        steps: [
          "Increment the counter",
          "Check the stop condition",
          "Initialize the counter",
        ],
        answer: [
          "Initialize the counter",
          "Check the stop condition",
          "Increment the counter",
        ],
        feedback:
          "Nice. That three-part loop header is the heart of many C++ beginner exercises.",
      },
    ],
  },
  {
    id: "challenge-cpp-intermediate-vector-arena",
    trackId: "cpp",
    levelId: "intermediate",
    title: "Vector Arena",
    subtitle: "Choose the right container move at speed",
    description:
      "Work through vector growth, indexing, and sensible data-shape choices.",
    xp: 95,
    rounds: [
      {
        id: "cpp-ch-i-1",
        type: "rapid",
        prompt: "Which vector operation appends a new value to the end?",
        options: ["push_back", "append_now", "grow", "insert_last"],
        answer: "push_back",
        feedback: "Exactly. `push_back` is the classic append move.",
      },
      {
        id: "cpp-ch-i-2",
        type: "sort",
        prompt: "Sort the ideas into the right bucket.",
        categories: ["Vector strength", "Not a vector strength"],
        cards: [
          { id: "cpp-sort-1", label: "Can grow as items are added", answer: "Vector strength" },
          { id: "cpp-sort-2", label: "Represents a single integer", answer: "Not a vector strength" },
          { id: "cpp-sort-3", label: "Supports index-based access", answer: "Vector strength" },
          { id: "cpp-sort-4", label: "Eliminates all memory tradeoffs", answer: "Not a vector strength" },
        ],
        feedback:
          "Great. Vectors are powerful, but advanced intuition still respects tradeoffs.",
      },
    ],
  },
  {
    id: "challenge-cpp-advanced-memory-maze",
    trackId: "cpp",
    levelId: "advanced",
    title: "Memory Maze",
    subtitle: "Spot expensive moves before they spread",
    description:
      "Choose the path with fewer costly copies and saner ownership intuition.",
    xp: 115,
    rounds: [
      {
        id: "cpp-ch-a-1",
        type: "rapid",
        prompt: "What is the main reason to inspect copies in a hot code path?",
        options: [
          "They can increase work and slow the program",
          "They make code impossible to compile",
          "They add SQL support",
          "They always improve readability",
        ],
        answer: "They can increase work and slow the program",
        feedback: "Exactly. Data movement costs can add up fast in performance-sensitive code.",
      },
      {
        id: "cpp-ch-a-2",
        type: "sequence",
        prompt: "Sequence a disciplined optimization pass.",
        steps: [
          "Measure the bottleneck",
          "Check whether copies can be reduced",
          "Refactor with clarity in mind",
          "Verify behavior still matches expectations",
        ],
        answer: [
          "Measure the bottleneck",
          "Check whether copies can be reduced",
          "Refactor with clarity in mind",
          "Verify behavior still matches expectations",
        ],
        feedback:
          "Strong. Performance work stays healthy when evidence and verification surround the refactor.",
      },
    ],
  },
  {
    id: "challenge-javascript-beginner-array-dash",
    trackId: "javascript",
    levelId: "beginner",
    title: "Array Dash",
    subtitle: "Keep track of list behavior under speed",
    description:
      "Recognize array syntax, indexing, and basic method intuition without overthinking it.",
    xp: 85,
    rounds: [
      {
        id: "js-ch-b-1",
        type: "rapid",
        prompt: "What index holds the first array item in JavaScript?",
        options: ["0", "1", "first", "-1"],
        answer: "0",
        feedback: "Exactly. Zero-based indexing is a core JavaScript rhythm.",
      },
      {
        id: "js-ch-b-2",
        type: "sequence",
        prompt: "Put this data lookup story in order.",
        steps: [
          "Choose the array",
          "Pick the index you want",
          "Read the value at that index",
        ],
        answer: [
          "Choose the array",
          "Pick the index you want",
          "Read the value at that index",
        ],
        feedback:
          "Nice. Beginner array confidence comes from practicing that simple three-step move.",
      },
    ],
  },
  {
    id: "challenge-javascript-intermediate-dom-rescue",
    trackId: "javascript",
    levelId: "intermediate",
    title: "DOM Rescue",
    subtitle: "Repair the interaction before users notice",
    description:
      "Wire the right event, update the right element, and keep the interface consistent.",
    xp: 95,
    rounds: [
      {
        id: "js-ch-i-1",
        type: "rapid",
        prompt: "Which tool listens for a click on an element?",
        options: [
          "querySelector",
          "addEventListener",
          "textContent",
          "className = null",
        ],
        answer: "addEventListener",
        feedback: "Right. The listener is what turns input into behavior.",
      },
      {
        id: "js-ch-i-2",
        type: "sort",
        prompt: "Sort each DOM task into the right category.",
        categories: ["Find", "Change"],
        cards: [
          { id: "js-sort-1", label: "querySelector('.score')", answer: "Find" },
          { id: "js-sort-2", label: "button.textContent = 'Go'", answer: "Change" },
          { id: "js-sort-3", label: "document.getElementById('card')", answer: "Find" },
          { id: "js-sort-4", label: "panel.classList.toggle('open')", answer: "Change" },
        ],
        feedback:
          "Perfect. DOM work often becomes simpler when you separate finding from changing.",
      },
    ],
  },
  {
    id: "challenge-javascript-advanced-latency-league",
    trackId: "javascript",
    levelId: "advanced",
    title: "Latency League",
    subtitle: "Protect UX while async work keeps moving",
    description:
      "Choose the sequence that keeps the interface calm and responsive.",
    xp: 115,
    rounds: [
      {
        id: "js-ch-a-1",
        type: "rapid",
        prompt: "Which response usually feels best during a slow request?",
        options: [
          "Show a clear loading state",
          "Block every button forever",
          "Hide the page completely",
          "Pretend nothing happened",
        ],
        answer: "Show a clear loading state",
        feedback:
          "Exactly. The user should know the system heard them and is working.",
      },
      {
        id: "js-ch-a-2",
        type: "sequence",
        prompt: "Arrange the resilient async sequence.",
        steps: [
          "Handle success or failure",
          "Show pending state",
          "Kick off the request",
          "User triggers the action",
        ],
        answer: [
          "User triggers the action",
          "Show pending state",
          "Kick off the request",
          "Handle success or failure",
        ],
        feedback:
          "Nice. Great async UX makes the user feel informed before results appear.",
      },
    ],
  },
  {
    id: "challenge-sql-beginner-query-sprint",
    trackId: "sql",
    levelId: "beginner",
    title: "Query Sprint",
    subtitle: "Pull the right rows before the tide turns",
    description:
      "Choose the right clause order and avoid common beginner query confusion.",
    xp: 85,
    rounds: [
      {
        id: "sql-ch-b-1",
        type: "rapid",
        prompt: "Which clause decides which table you are querying?",
        options: ["FROM", "WHERE", "ORDER BY", "SELECT TOP"],
        answer: "FROM",
        feedback: "Exactly. `FROM` points the query at the table source.",
      },
      {
        id: "sql-ch-b-2",
        type: "sequence",
        prompt: "Put the basic query clauses in order.",
        steps: ["WHERE status = 'live'", "SELECT name", "FROM launches"],
        answer: ["SELECT name", "FROM launches", "WHERE status = 'live'"],
        feedback:
          "Great. Beginner SQL gets dramatically easier when the clause order becomes muscle memory.",
      },
    ],
  },
  {
    id: "challenge-sql-intermediate-aggregate-ascent",
    trackId: "sql",
    levelId: "intermediate",
    title: "Aggregate Ascent",
    subtitle: "Summarize the right thing, not just anything",
    description:
      "Group rows, choose the right metric, and read the result with confidence.",
    xp: 95,
    rounds: [
      {
        id: "sql-ch-i-1",
        type: "rapid",
        prompt: "Which clause groups rows before computing aggregates?",
        options: ["ORDER BY", "JOIN", "GROUP BY", "LIMIT"],
        answer: "GROUP BY",
        feedback: "Right. Group first, then summarize each bucket.",
      },
      {
        id: "sql-ch-i-2",
        type: "sort",
        prompt: "Sort these items by what they represent.",
        categories: ["Aggregate", "Not aggregate"],
        cards: [
          { id: "sql-sort-1", label: "COUNT(*)", answer: "Aggregate" },
          { id: "sql-sort-2", label: "AVG(price)", answer: "Aggregate" },
          { id: "sql-sort-3", label: "team", answer: "Not aggregate" },
          { id: "sql-sort-4", label: "country", answer: "Not aggregate" },
        ],
        feedback:
          "Perfect. Separating the grouping key from the summary metric is half the battle.",
      },
    ],
  },
  {
    id: "challenge-sql-advanced-ranking-relay",
    trackId: "sql",
    levelId: "advanced",
    title: "Ranking Relay",
    subtitle: "Use analytical SQL without losing the row detail",
    description:
      "Read, rank, and preserve context like an analyst who knows the database is part of the product.",
    xp: 115,
    rounds: [
      {
        id: "sql-ch-a-1",
        type: "rapid",
        prompt: "What is a big reason to use a window function?",
        options: [
          "It keeps row detail while adding context",
          "It deletes duplicates automatically",
          "It converts SQL into Python",
          "It removes the need for indexes",
        ],
        answer: "It keeps row detail while adding context",
        feedback:
          "Exactly. Windows shine when you need both detail and analytical context together.",
      },
      {
        id: "sql-ch-a-2",
        type: "sequence",
        prompt: "Arrange the ranking story.",
        steps: [
          "Partition or order the rows",
          "Apply the ranking window",
          "Read each row with its rank",
        ],
        answer: [
          "Partition or order the rows",
          "Apply the ranking window",
          "Read each row with its rank",
        ],
        feedback:
          "Nice. Advanced SQL gets more approachable when you narrate the analytical flow step by step.",
      },
    ],
  },
  {
    id: "challenge-html-css-beginner-layout-league",
    trackId: "html-css",
    levelId: "beginner",
    title: "Layout League",
    subtitle: "Align with confidence and keep the screen breathing",
    description:
      "Use layout intuition to line up elements without overcomplicating the page.",
    xp: 85,
    rounds: [
      {
        id: "html-ch-b-1",
        type: "rapid",
        prompt: "Which property adds intentional space between flex items?",
        options: ["gap", "float", "align-content", "letter-spacing"],
        answer: "gap",
        feedback: "Exactly. `gap` keeps spacing consistent without margin chaos.",
      },
      {
        id: "html-ch-b-2",
        type: "sort",
        prompt: "Sort each choice into the best design bucket.",
        categories: ["Structure", "Spacing"],
        cards: [
          { id: "html-sort-1", label: "<section>", answer: "Structure" },
          { id: "html-sort-2", label: "padding", answer: "Spacing" },
          { id: "html-sort-3", label: "<header>", answer: "Structure" },
          { id: "html-sort-4", label: "gap", answer: "Spacing" },
        ],
        feedback:
          "Perfect. HTML and CSS feel much friendlier when structure and spacing have different jobs.",
      },
    ],
  },
  {
    id: "challenge-html-css-intermediate-responsive-rally",
    trackId: "html-css",
    levelId: "intermediate",
    title: "Responsive Rally",
    subtitle: "Keep hierarchy alive while the screen shifts",
    description:
      "Choose what stays prominent, what stacks, and what can simplify on smaller screens.",
    xp: 95,
    rounds: [
      {
        id: "html-ch-i-1",
        type: "rapid",
        prompt: "What should usually stay true across screen sizes?",
        options: [
          "The hierarchy of what matters most",
          "Every pixel position",
          "The exact same column count",
          "All decorative effects",
        ],
        answer: "The hierarchy of what matters most",
        feedback:
          "Exactly. Responsive work protects meaning first, then adapts layout details.",
      },
      {
        id: "html-ch-i-2",
        type: "sequence",
        prompt: "Sequence a responsive design pass.",
        steps: [
          "Protect the primary idea",
          "Reduce clutter and compress secondary detail",
          "Test how the section reflows",
        ],
        answer: [
          "Protect the primary idea",
          "Reduce clutter and compress secondary detail",
          "Test how the section reflows",
        ],
        feedback:
          "Great. The goal is not to preserve everything, only what the experience truly needs.",
      },
    ],
  },
  {
    id: "challenge-html-css-advanced-polish-summit",
    trackId: "html-css",
    levelId: "advanced",
    title: "Polish Summit",
    subtitle: "Use systems and motion with restraint",
    description:
      "Make the interface feel premium by making fewer, better design decisions.",
    xp: 115,
    rounds: [
      {
        id: "html-ch-a-1",
        type: "rapid",
        prompt: "What usually improves product polish more than extra decoration?",
        options: [
          "Consistent tokens and spacing",
          "Three more accent colors",
          "A busier hero",
          "More borders on every panel",
        ],
        answer: "Consistent tokens and spacing",
        feedback:
          "Exactly. Premium UI often comes from disciplined systems, not louder effects.",
      },
      {
        id: "html-ch-a-2",
        type: "sort",
        prompt: "Sort these choices into strong or weak polish instincts.",
        categories: ["Strong instinct", "Weak instinct"],
        cards: [
          { id: "html-polish-1", label: "Reuse a spacing scale", answer: "Strong instinct" },
          { id: "html-polish-2", label: "Animate every hover differently", answer: "Weak instinct" },
          { id: "html-polish-3", label: "Limit accent colors", answer: "Strong instinct" },
          { id: "html-polish-4", label: "Stack cards everywhere by default", answer: "Weak instinct" },
        ],
        feedback:
          "Nice. Restraint is one of the clearest tells of senior frontend taste.",
      },
    ],
  },
  {
    id: "challenge-ai-beginner-vector-vault",
    trackId: "ai",
    levelId: "beginner",
    title: "Vector Vault",
    subtitle: "A playful tour through patterns, prompts, and meaning",
    description:
      "Keep your combo alive while sorting AI ideas into the right beginner-friendly mental models.",
    xp: 95,
    rounds: [
      {
        id: "ai-ch-b-1",
        type: "rapid",
        prompt: "Embeddings help a system represent text as what?",
        options: ["Coordinates or vectors", "Only emojis", "Exact labels", "Database tables"],
        answer: "Coordinates or vectors",
        feedback:
          "Exactly. A vector is a useful way to represent meaning as numbers.",
      },
      {
        id: "ai-ch-b-2",
        type: "sort",
        prompt: "Sort each statement into the right AI stage.",
        categories: ["Training", "Inference"],
        cards: [
          { id: "ai-sort-1", label: "Update the model from many examples", answer: "Training" },
          { id: "ai-sort-2", label: "Answer a user request", answer: "Inference" },
          { id: "ai-sort-3", label: "Adjust weights based on error", answer: "Training" },
          { id: "ai-sort-4", label: "Use learned patterns to make a guess", answer: "Inference" },
        ],
        feedback:
          "Perfect. Once those stages split apart in your mind, AI systems feel much easier to reason about.",
      },
      {
        id: "ai-ch-b-3",
        type: "sequence",
        prompt: "Arrange the prompt-crafting recipe.",
        steps: [
          "Name the role or task",
          "State the goal and useful context",
          "Add constraints or output format",
        ],
        answer: [
          "Name the role or task",
          "State the goal and useful context",
          "Add constraints or output format",
        ],
        feedback:
          "Great. Beginner prompt quality often jumps just from that clean structure.",
      },
    ],
  },
  {
    id: "challenge-ai-intermediate-overfit-escape",
    trackId: "ai",
    levelId: "intermediate",
    title: "Overfit Escape",
    subtitle: "Rescue the model from memorizing the training set",
    description:
      "Use intuition about labels, validation, and generalization to keep the model honest.",
    xp: 105,
    rounds: [
      {
        id: "ai-ch-i-1",
        type: "rapid",
        prompt: "Which result is the classic sign of overfitting?",
        options: [
          "Great training performance but poor performance on new data",
          "Slightly slower inference",
          "A larger context window",
          "Using embeddings for retrieval",
        ],
        answer: "Great training performance but poor performance on new data",
        feedback:
          "Exactly. The model memorized too much and learned too little about the bigger pattern.",
      },
      {
        id: "ai-ch-i-2",
        type: "sort",
        prompt: "Sort the items into the right learning setup.",
        categories: ["Supervised", "Unsupervised"],
        cards: [
          { id: "ai-i-sort-1", label: "Examples with labels", answer: "Supervised" },
          { id: "ai-i-sort-2", label: "Clustering without labels", answer: "Unsupervised" },
          { id: "ai-i-sort-3", label: "Text sentiment category", answer: "Supervised" },
          { id: "ai-i-sort-4", label: "Group similar customer behaviors", answer: "Unsupervised" },
        ],
        feedback:
          "Nice. Understanding what kind of signal the data provides is half the design problem.",
      },
      {
        id: "ai-ch-i-3",
        type: "sequence",
        prompt: "Sequence the anti-overfitting playbook.",
        steps: [
          "Hold out validation data",
          "Train on the training set",
          "Evaluate on unseen examples",
          "Adjust the approach if generalization is weak",
        ],
        answer: [
          "Hold out validation data",
          "Train on the training set",
          "Evaluate on unseen examples",
          "Adjust the approach if generalization is weak",
        ],
        feedback:
          "Perfect. Generalization improves when the model repeatedly meets reality, not just its own homework.",
      },
    ],
  },
  {
    id: "challenge-ai-advanced-tradeoff-gauntlet",
    trackId: "ai",
    levelId: "advanced",
    title: "Tradeoff Gauntlet",
    subtitle: "Choose the architecture that fits the product",
    description:
      "Navigate cost, latency, reliability, and quality like a startup team about to ship.",
    xp: 120,
    rounds: [
      {
        id: "ai-ch-a-1",
        type: "rapid",
        prompt: "If latency is the top constraint, what is a sensible first lever?",
        options: [
          "Pick a smaller or faster model",
          "Always add more retrieval steps",
          "Ignore user experience",
          "Increase prompt length without limit",
        ],
        answer: "Pick a smaller or faster model",
        feedback:
          "Exactly. Right-sizing the model is often the first practical response to latency pressure.",
      },
      {
        id: "ai-ch-a-2",
        type: "sort",
        prompt: "Sort the system choices by what they primarily improve.",
        categories: ["Quality", "Speed"],
        cards: [
          { id: "ai-a-sort-1", label: "Add evaluation and fallback checks", answer: "Quality" },
          { id: "ai-a-sort-2", label: "Reduce unnecessary prompt tokens", answer: "Speed" },
          { id: "ai-a-sort-3", label: "Use a smaller model where it still passes", answer: "Speed" },
          { id: "ai-a-sort-4", label: "Retrieve more relevant context", answer: "Quality" },
        ],
        feedback:
          "Strong. Advanced product work is often about explicitly naming what each lever is buying you.",
      },
      {
        id: "ai-ch-a-3",
        type: "sequence",
        prompt: "Sequence a startup-ready AI shipping plan.",
        steps: [
          "Define the user promise and constraints",
          "Choose the model and supporting pipeline",
          "Prototype and measure quality",
          "Add reliability checks before launch",
        ],
        answer: [
          "Define the user promise and constraints",
          "Choose the model and supporting pipeline",
          "Prototype and measure quality",
          "Add reliability checks before launch",
        ],
        feedback:
          "Exactly. Strong AI product teams start with the user job, then pick the technology to match it.",
      },
    ],
  },
];

export const achievements: AchievementDefinition[] = [
  {
    id: "first-liftoff",
    title: "First Liftoff",
    description: "Complete your first lesson and launch your first streak pulse.",
    icon: "track",
    unlockText: "Complete 1 lesson",
  },
  {
    id: "combo-keeper",
    title: "Combo Keeper",
    description: "Finish a challenge run without losing momentum.",
    icon: "javascript",
    unlockText: "Complete 1 challenge",
  },
  {
    id: "constellation-runner",
    title: "Constellation Runner",
    description: "Complete five lessons across your map and keep charting forward.",
    icon: "python",
    unlockText: "Complete 5 lessons",
  },
  {
    id: "ai-cartographer",
    title: "AI Cartographer",
    description: "Map the AI galaxy through pattern, vector, and architecture lessons.",
    icon: "ai",
    unlockText: "Complete 2 AI lessons",
  },
  {
    id: "seven-day-spark",
    title: "Seven Day Spark",
    description: "Keep your learning signal glowing for a full week.",
    icon: "html",
    unlockText: "Reach a 7-day streak",
  },
  {
    id: "boss-mode",
    title: "Boss Mode",
    description: "Clear three challenge encounters and unlock elite confidence.",
    icon: "cpp",
    unlockText: "Complete 3 challenges",
  },
];

export function getTrackById(trackId: TrackId) {
  return tracks.find((track) => track.id === trackId) ?? tracks[0];
}

export function getLevelById(levelId: LevelId) {
  return levels.find((level) => level.id === levelId) ?? levels[0];
}

export function getAvatarById(avatarId: string) {
  return avatars.find((avatar) => avatar.id === avatarId) ?? avatars[0];
}

export function getLessonById(lessonId: string) {
  return lessons.find((lesson) => lesson.id === lessonId);
}

export function getChallengeById(challengeId: string) {
  return challenges.find((challenge) => challenge.id === challengeId);
}

export function getPath(trackId: TrackId, levelId: LevelId) {
  return getTrackById(trackId).paths[levelId];
}

export function getLessonsForTrackLevel(trackId: TrackId, levelId: LevelId) {
  return lessons.filter(
    (lesson) => lesson.trackId === trackId && lesson.levelId === levelId,
  );
}

export function getChallengeForTrackLevel(trackId: TrackId, levelId: LevelId) {
  return challenges.find(
    (challenge) => challenge.trackId === trackId && challenge.levelId === levelId,
  );
}

export function getNextPlayableNode(profile: OrbitaProfile) {
  const path = getPath(profile.trackId, profile.levelId);

  return (
    path.nodes.find((node) => {
      if (!node.linkedId) {
        return false;
      }

      if (node.type === "lesson") {
        return !profile.completedLessonIds.includes(node.linkedId);
      }

      if (node.type === "challenge") {
        return !profile.completedChallengeIds.includes(node.linkedId);
      }

      return false;
    }) ?? path.nodes.find((node) => node.linkedId)
  );
}

export function resolveAchievementIds(profile: OrbitaProfile) {
  const aiLessonCount = profile.completedLessonIds.filter((lessonId) =>
    lessonId.startsWith("ai-"),
  ).length;

  return achievements
    .filter((achievement) => {
      switch (achievement.id) {
        case "first-liftoff":
          return profile.completedLessonIds.length >= 1;
        case "combo-keeper":
          return profile.completedChallengeIds.length >= 1;
        case "constellation-runner":
          return profile.completedLessonIds.length >= 5;
        case "ai-cartographer":
          return aiLessonCount >= 2;
        case "seven-day-spark":
          return profile.streak >= 7;
        case "boss-mode":
          return profile.completedChallengeIds.length >= 3;
        default:
          return false;
      }
    })
    .map((achievement) => achievement.id);
}
