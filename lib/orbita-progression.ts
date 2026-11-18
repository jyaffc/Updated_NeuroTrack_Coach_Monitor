import {
  challenges,
  getTrackById,
  lessons,
  tracks,
  type ChallengeDefinition,
  type LearningGoalId,
  type LevelId,
  type OrbitaProfile,
  type TrackId,
} from "@/lib/orbita-data";

export const ORBITA_ORGANIZATION = "Orbita Learning Arcade";

export type LearningGoalDefinition = {
  id: LearningGoalId;
  label: string;
  shortLabel: string;
  description: string;
  questStyle: string;
  celebrationLine: string;
};

export type MasterySnapshot = {
  lessonCompletionRate: number;
  challengeCompletionRate: number;
  averageLessonAccuracy: number;
  averageChallengeAccuracy: number;
  accuracyRate: number;
  consistencyScore: number;
  difficultyScore: number;
  capstoneScore: number;
  assessmentScore: number;
  masteryScore: number;
};

export type TrackProgressSnapshot = {
  trackId: TrackId;
  levelId?: LevelId;
  lessonCompletionRate: number;
  challengeCompletionRate: number;
  accuracyRate: number;
  completedLessons: number;
  totalLessons: number;
  completedChallenges: number;
  totalChallenges: number;
};

export type CredentialKind =
  | "micro-badge"
  | "track-certificate"
  | "mastery-tier"
  | "specialization"
  | "elite";

export type CredentialRarity = "common" | "rare" | "epic" | "legendary";

export type CredentialDefinition = {
  id: string;
  title: string;
  kind: CredentialKind;
  rarity: CredentialRarity;
  accent: string;
  linkedInName: string;
  shareLine: string;
  summary: string;
  requirementLabel: string;
};

export type CredentialAward = {
  definition: CredentialDefinition;
  issuedAt: string;
  credentialId: string;
  verificationPath: string;
  linkedInFields: {
    credentialName: string;
    issuingOrganization: string;
    issueDate: string;
    credentialId: string;
    credentialUrl: string;
  };
  progressToUnlock: number;
};

export const learningGoals: LearningGoalDefinition[] = [
  {
    id: "career-launch",
    label: "Launch a new career",
    shortLabel: "Career launch",
    description:
      "Prioritize structured progression, visible credentials, and habits that feel portfolio-ready.",
    questStyle: "Skill ladders, certificates, and weekly proof points",
    celebrationLine: "Each credential pushes your story closer to job-ready proof.",
  },
  {
    id: "ship-projects",
    label: "Build and ship side projects",
    shortLabel: "Ship projects",
    description:
      "Bias the journey toward practical building instincts, frontend polish, and reusable patterns.",
    questStyle: "Fast wins, project fluency, and build momentum",
    celebrationLine: "You are stacking real build power, not just finishing content.",
  },
  {
    id: "ai-fluency",
    label: "Become AI fluent",
    shortLabel: "AI fluency",
    description:
      "Move from AI curiosity to strong model intuition, prompt craft, and architecture reasoning.",
    questStyle: "Concept mini-games, model tradeoffs, and AI specialization ladders",
    celebrationLine: "Every run makes abstract AI ideas feel more usable and more concrete.",
  },
  {
    id: "interview-power",
    label: "Level up for interviews",
    shortLabel: "Interview power",
    description:
      "Keep sessions replayable and tactical so your speed, recall, and confidence keep climbing.",
    questStyle: "Challenge chains, accuracy focus, and mastery checkpoints",
    celebrationLine: "You are building speed under pressure, not just passive familiarity.",
  },
];

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function dateString() {
  return new Date().toISOString().slice(0, 10);
}

function difficultyWeight(levelId: LevelId) {
  switch (levelId) {
    case "beginner":
      return 38;
    case "intermediate":
      return 70;
    case "advanced":
      return 96;
    default:
      return 0;
  }
}

function formatCredentialId(definitionId: string, issuedAt: string) {
  const compactDate = issuedAt.replaceAll("-", "");
  const compactName = definitionId.replace(/[^a-z0-9]/gi, "").toUpperCase();

  return `ORB-${compactName.slice(0, 14)}-${compactDate}`;
}

export function getLearningGoalById(goalId: LearningGoalId) {
  return learningGoals.find((goal) => goal.id === goalId) ?? learningGoals[0];
}

export function getMasterySnapshot(profile: OrbitaProfile): MasterySnapshot {
  const lessonAccuracies = Object.values(profile.lessonPerformance);
  const challengeAccuracies = Object.values(profile.challengePerformance);
  const averageLessonAccuracy = average(lessonAccuracies);
  const averageChallengeAccuracy = average(challengeAccuracies);
  const accuracyRate = clamp(
    lessonAccuracies.length && challengeAccuracies.length
      ? averageLessonAccuracy * 0.58 + averageChallengeAccuracy * 0.42
      : averageLessonAccuracy || averageChallengeAccuracy || 0,
  );

  const lessonCompletionRate = clamp(
    (profile.completedLessonIds.length / Math.max(1, lessons.length)) * 100,
  );
  const challengeCompletionRate = clamp(
    (profile.completedChallengeIds.length / Math.max(1, challenges.length)) * 100,
  );

  const completedLessonLevels = lessons
    .filter((lesson) => profile.completedLessonIds.includes(lesson.id))
    .map((lesson) => difficultyWeight(lesson.levelId));
  const completedChallengeLevels = challenges
    .filter((challenge) => profile.completedChallengeIds.includes(challenge.id))
    .map((challenge) => difficultyWeight(challenge.levelId));
  const difficultyScore = clamp(
    average([...completedLessonLevels, ...completedChallengeLevels]),
  );

  const advancedLessons = lessons.filter(
    (lesson) =>
      lesson.levelId === "advanced" &&
      profile.completedLessonIds.includes(lesson.id),
  ).length;
  const advancedChallenges = challenges.filter(
    (challenge) =>
      challenge.levelId === "advanced" &&
      profile.completedChallengeIds.includes(challenge.id),
  ).length;

  const consistencyScore = clamp(profile.streak * 10);
  const capstoneScore = clamp(advancedLessons * 20 + advancedChallenges * 38);
  const assessmentScore = clamp(
    challengeCompletionRate * 0.45 + averageChallengeAccuracy * 0.55,
  );

  const masteryScore = clamp(
    lessonCompletionRate * 0.16 +
      challengeCompletionRate * 0.14 +
      accuracyRate * 0.26 +
      consistencyScore * 0.12 +
      difficultyScore * 0.16 +
      capstoneScore * 0.08 +
      assessmentScore * 0.08,
  );

  return {
    lessonCompletionRate,
    challengeCompletionRate,
    averageLessonAccuracy,
    averageChallengeAccuracy,
    accuracyRate,
    consistencyScore,
    difficultyScore,
    capstoneScore,
    assessmentScore,
    masteryScore,
  };
}

export function getTrackProgressSnapshot(
  profile: OrbitaProfile,
  trackId: TrackId,
  levelId?: LevelId,
): TrackProgressSnapshot {
  const trackLessons = lessons.filter(
    (lesson) =>
      lesson.trackId === trackId && (!levelId || lesson.levelId === levelId),
  );
  const trackChallenges = challenges.filter(
    (challenge) =>
      challenge.trackId === trackId &&
      (!levelId || challenge.levelId === levelId),
  );

  const completedLessons = trackLessons.filter((lesson) =>
    profile.completedLessonIds.includes(lesson.id),
  );
  const completedChallenges = trackChallenges.filter((challenge) =>
    profile.completedChallengeIds.includes(challenge.id),
  );

  const lessonCompletionRate = clamp(
    (completedLessons.length / Math.max(1, trackLessons.length)) * 100,
  );
  const challengeCompletionRate = clamp(
    (completedChallenges.length / Math.max(1, trackChallenges.length)) * 100,
  );
  const lessonAccuracy = average(
    completedLessons.map((lesson) => profile.lessonPerformance[lesson.id] ?? 0),
  );
  const challengeAccuracy = average(
    completedChallenges.map(
      (challenge) => profile.challengePerformance[challenge.id] ?? 0,
    ),
  );
  const accuracyRate = clamp(
    completedLessons.length && completedChallenges.length
      ? lessonAccuracy * 0.56 + challengeAccuracy * 0.44
      : lessonAccuracy || challengeAccuracy || 0,
  );

  return {
    trackId,
    levelId,
    lessonCompletionRate,
    challengeCompletionRate,
    accuracyRate,
    completedLessons: completedLessons.length,
    totalLessons: trackLessons.length,
    completedChallenges: completedChallenges.length,
    totalChallenges: trackChallenges.length,
  };
}

export const credentialDefinitions: CredentialDefinition[] = [
  {
    id: "python-variables-micro",
    title: "Python Variables",
    kind: "micro-badge",
    rarity: "common",
    accent: "#ff9551",
    linkedInName: "Orbita Micro Badge: Python Variables",
    shareLine: "Found the first clean rhythm in Python variables.",
    summary:
      "Awarded for locking in variable naming, assignment, and value updates.",
    requirementLabel: "Complete Variable Garden",
  },
  {
    id: "cpp-basics-micro",
    title: "C++ Basics",
    kind: "micro-badge",
    rarity: "common",
    accent: "#6f8aff",
    linkedInName: "Orbita Micro Badge: C++ Basics",
    shareLine: "Survived the syntax launch and kept the loop stable.",
    summary:
      "Awarded for understanding core beginner C++ syntax and loop structure.",
    requirementLabel: "Complete Loop Launch",
  },
  {
    id: "sql-queries-micro",
    title: "SQL Queries",
    kind: "micro-badge",
    rarity: "common",
    accent: "#3db7d8",
    linkedInName: "Orbita Micro Badge: SQL Queries",
    shareLine: "Started asking better questions of real data.",
    summary:
      "Awarded for selecting, filtering, and ordering SQL results with confidence.",
    requirementLabel: "Complete Select Sprint",
  },
  {
    id: "neural-network-basics-micro",
    title: "Neural Network Basics",
    kind: "micro-badge",
    rarity: "rare",
    accent: "#ff6b64",
    linkedInName: "Orbita Micro Badge: Neural Network Basics",
    shareLine: "Turned neural network fear into signal intuition.",
    summary:
      "Awarded for understanding layers, neurons, and forward signal flow.",
    requirementLabel: "Complete Neural Garden",
  },
  {
    id: "frontend-flex-micro",
    title: "Frontend Fundamentals",
    kind: "micro-badge",
    rarity: "rare",
    accent: "#5ad2aa",
    linkedInName: "Orbita Micro Badge: Frontend Fundamentals",
    shareLine: "Lined up structure and spacing without the layout wobble.",
    summary:
      "Awarded for learning flexbox, spacing, and interface structure basics.",
    requirementLabel: "Complete Flexbox Flow",
  },
  {
    id: "python-beginner-certificate",
    title: "Python Beginner Certificate",
    kind: "track-certificate",
    rarity: "rare",
    accent: "#ff9551",
    linkedInName: "Orbita Track Certificate: Python Beginner",
    shareLine: "Completed the first full Python runway in Orbita.",
    summary:
      "Platform credential for completing Orbita's Python beginner path with demonstrated mastery.",
    requirementLabel: "Complete the Python beginner path with 70% mastery",
  },
  {
    id: "javascript-intermediate-certificate",
    title: "JavaScript Intermediate Certificate",
    kind: "track-certificate",
    rarity: "epic",
    accent: "#ffc94a",
    linkedInName: "Orbita Track Certificate: JavaScript Intermediate",
    shareLine: "Built enough JavaScript fluency to control interactive surfaces with confidence.",
    summary:
      "Platform credential for DOM, state, and interaction fluency in Orbita's JavaScript path.",
    requirementLabel: "Complete the JavaScript intermediate path with 78% mastery",
  },
  {
    id: "ai-foundations-certificate",
    title: "AI Foundations Certificate",
    kind: "track-certificate",
    rarity: "epic",
    accent: "#ff6b64",
    linkedInName: "Orbita Track Certificate: AI Foundations",
    shareLine: "Finished the AI foundations arc with real model intuition.",
    summary:
      "Platform credential for pattern recognition, neural basics, prompting, and AI challenge fluency.",
    requirementLabel: "Complete the AI beginner path with 75% mastery",
  },
  {
    id: "mastery-bronze",
    title: "Bronze Mastery Credential",
    kind: "mastery-tier",
    rarity: "common",
    accent: "#ba7b46",
    linkedInName: "Orbita Mastery Credential: Bronze",
    shareLine: "First verified mastery tier unlocked.",
    summary:
      "Awarded when progress, accuracy, and consistency rise above casual exploration.",
    requirementLabel: "Reach 35 mastery score and a 3-day streak",
  },
  {
    id: "mastery-silver",
    title: "Silver Mastery Credential",
    kind: "mastery-tier",
    rarity: "rare",
    accent: "#92a2be",
    linkedInName: "Orbita Mastery Credential: Silver",
    shareLine: "Moved from casual learning into reliable mastery.",
    summary:
      "Awarded for sustained progress, clean challenge play, and stronger accuracy.",
    requirementLabel: "Reach 55 mastery score and a 5-day streak",
  },
  {
    id: "mastery-gold",
    title: "Gold Mastery Credential",
    kind: "mastery-tier",
    rarity: "epic",
    accent: "#f0bf41",
    linkedInName: "Orbita Mastery Credential: Gold",
    shareLine: "Built a serious command rhythm across lessons and challenges.",
    summary:
      "Awarded for strong demonstrated mastery across progress, performance, and difficulty.",
    requirementLabel: "Reach 72 mastery score, 7-day streak, and strong challenge accuracy",
  },
  {
    id: "mastery-platinum",
    title: "Platinum Mastery Credential",
    kind: "mastery-tier",
    rarity: "legendary",
    accent: "#60d8ff",
    linkedInName: "Orbita Mastery Credential: Platinum",
    shareLine: "Reached the top platform tier with elite consistency and proof.",
    summary:
      "Awarded for advanced difficulty, elite challenge play, and sustained excellence inside the platform.",
    requirementLabel: "Reach 88 mastery score, 14-day streak, and advanced capstone wins",
  },
  {
    id: "prompt-engineering-practitioner",
    title: "Prompt Engineering Practitioner",
    kind: "specialization",
    rarity: "epic",
    accent: "#ff7a77",
    linkedInName: "Orbita Specialization Badge: Prompt Engineering Practitioner",
    shareLine: "Turned prompts into an actual design skill, not just guesswork.",
    summary:
      "Awarded for completing the AI beginner path with strong performance in prompt-oriented concept work.",
    requirementLabel: "Complete AI foundations with 80% accuracy",
  },
  {
    id: "vector-sense-specialization",
    title: "Vector Sense Specialist",
    kind: "specialization",
    rarity: "epic",
    accent: "#ff8f6b",
    linkedInName: "Orbita Specialization Badge: Vector Sense Specialist",
    shareLine: "Mapped embeddings and similarity into usable intuition.",
    summary:
      "Awarded for completing embedding and classification content with reliable challenge performance.",
    requirementLabel: "Complete AI intermediate lessons and Overfit Escape",
  },
  {
    id: "frontend-fundamentals-specialization",
    title: "Frontend Fundamentals Specialization",
    kind: "specialization",
    rarity: "rare",
    accent: "#5ad2aa",
    linkedInName: "Orbita Specialization Badge: Frontend Fundamentals",
    shareLine: "Blended layout and interaction skills into clean UI instincts.",
    summary:
      "Awarded for combining HTML/CSS and JavaScript foundations into a coherent frontend base.",
    requirementLabel: "Complete beginner HTML/CSS and JavaScript with 72% accuracy",
  },
  {
    id: "ai-architect-elite",
    title: "AI Architect Elite Credential",
    kind: "elite",
    rarity: "legendary",
    accent: "#ff6b64",
    linkedInName: "Orbita Elite Credential: AI Architect",
    shareLine: "Cleared Orbita's advanced AI bar with architecture-level reasoning.",
    summary:
      "Elite platform credential for advanced AI learners who clear the toughest track and maintain high mastery.",
    requirementLabel: "Finish advanced AI lessons, Tradeoff Gauntlet, and Gold mastery",
  },
  {
    id: "systems-gauntlet-elite",
    title: "Systems Gauntlet Credential",
    kind: "elite",
    rarity: "legendary",
    accent: "#6f8aff",
    linkedInName: "Orbita Elite Credential: Systems Gauntlet",
    shareLine: "Proved cross-track mastery under pressure.",
    summary:
      "Elite platform credential for learners who complete advanced work across multiple tracks and maintain challenge consistency.",
    requirementLabel: "Finish 3 advanced challenges, keep 80% challenge accuracy, and hold an 8-day streak",
  },
];

export function getCredentialDefinitionById(credentialId: string) {
  return credentialDefinitions.find((definition) => definition.id === credentialId);
}

function trackSnapshot(profile: OrbitaProfile, trackId: TrackId, levelId: LevelId) {
  return getTrackProgressSnapshot(profile, trackId, levelId);
}

function hasLesson(profile: OrbitaProfile, lessonId: string) {
  return profile.completedLessonIds.includes(lessonId);
}

function getAdvancedChallengeCount(profile: OrbitaProfile) {
  return challenges.filter(
    (challenge) =>
      challenge.levelId === "advanced" &&
      profile.completedChallengeIds.includes(challenge.id),
  ).length;
}

function credentialProgress(
  definition: CredentialDefinition,
  profile: OrbitaProfile,
  snapshot: MasterySnapshot,
): number {
  const pythonBeginner = trackSnapshot(profile, "python", "beginner");
  const javascriptIntermediate = trackSnapshot(profile, "javascript", "intermediate");
  const aiBeginner = trackSnapshot(profile, "ai", "beginner");
  const aiIntermediate = trackSnapshot(profile, "ai", "intermediate");
  const htmlBeginner = trackSnapshot(profile, "html-css", "beginner");
  const jsBeginner = trackSnapshot(profile, "javascript", "beginner");

  switch (definition.id) {
    case "python-variables-micro":
      return hasLesson(profile, "python-beginner-variable-garden") ? 100 : 0;
    case "cpp-basics-micro":
      return hasLesson(profile, "cpp-beginner-loop-launch") ? 100 : 0;
    case "sql-queries-micro":
      return hasLesson(profile, "sql-beginner-select-sprint") ? 100 : 0;
    case "neural-network-basics-micro":
      return hasLesson(profile, "ai-beginner-neural-garden") ? 100 : 0;
    case "frontend-flex-micro":
      return hasLesson(profile, "html-css-beginner-flexbox-flow") ? 100 : 0;
    case "python-beginner-certificate":
      return clamp(
        pythonBeginner.lessonCompletionRate * 0.6 +
          pythonBeginner.challengeCompletionRate * 0.25 +
          pythonBeginner.accuracyRate * 0.15,
      );
    case "javascript-intermediate-certificate":
      return clamp(
        javascriptIntermediate.lessonCompletionRate * 0.55 +
          javascriptIntermediate.challengeCompletionRate * 0.25 +
          javascriptIntermediate.accuracyRate * 0.2,
      );
    case "ai-foundations-certificate":
      return clamp(
        aiBeginner.lessonCompletionRate * 0.55 +
          aiBeginner.challengeCompletionRate * 0.25 +
          aiBeginner.accuracyRate * 0.2,
      );
    case "mastery-bronze":
      return clamp((snapshot.masteryScore / 35) * 100);
    case "mastery-silver":
      return clamp((snapshot.masteryScore / 55) * 100);
    case "mastery-gold":
      return clamp((snapshot.masteryScore / 72) * 100);
    case "mastery-platinum":
      return clamp((snapshot.masteryScore / 88) * 100);
    case "prompt-engineering-practitioner":
      return clamp(
        aiBeginner.lessonCompletionRate * 0.45 +
          aiBeginner.challengeCompletionRate * 0.25 +
          aiBeginner.accuracyRate * 0.3,
      );
    case "vector-sense-specialization":
      return clamp(
        aiIntermediate.lessonCompletionRate * 0.5 +
          aiIntermediate.challengeCompletionRate * 0.25 +
          aiIntermediate.accuracyRate * 0.25,
      );
    case "frontend-fundamentals-specialization":
      return clamp(
        ((htmlBeginner.lessonCompletionRate + jsBeginner.lessonCompletionRate) / 2) *
          0.5 +
          ((htmlBeginner.accuracyRate + jsBeginner.accuracyRate) / 2) * 0.3 +
          (htmlBeginner.challengeCompletionRate + jsBeginner.challengeCompletionRate) *
            0.1,
      );
    case "ai-architect-elite":
      return clamp(
        snapshot.masteryScore * 0.34 +
          trackSnapshot(profile, "ai", "advanced").lessonCompletionRate * 0.26 +
          trackSnapshot(profile, "ai", "advanced").challengeCompletionRate * 0.2 +
          trackSnapshot(profile, "ai", "advanced").accuracyRate * 0.2,
      );
    case "systems-gauntlet-elite":
      return clamp(
        getAdvancedChallengeCount(profile) * 25 +
          snapshot.averageChallengeAccuracy * 0.4 +
          snapshot.consistencyScore * 0.35,
      );
    default:
      return 0;
  }
}

function isCredentialUnlocked(
  definition: CredentialDefinition,
  profile: OrbitaProfile,
  snapshot: MasterySnapshot,
): boolean {
  const pythonBeginner = trackSnapshot(profile, "python", "beginner");
  const javascriptIntermediate = trackSnapshot(profile, "javascript", "intermediate");
  const aiBeginner = trackSnapshot(profile, "ai", "beginner");
  const aiIntermediate = trackSnapshot(profile, "ai", "intermediate");
  const htmlBeginner = trackSnapshot(profile, "html-css", "beginner");
  const jsBeginner = trackSnapshot(profile, "javascript", "beginner");
  const aiAdvanced = trackSnapshot(profile, "ai", "advanced");

  switch (definition.id) {
    case "python-variables-micro":
      return hasLesson(profile, "python-beginner-variable-garden");
    case "cpp-basics-micro":
      return hasLesson(profile, "cpp-beginner-loop-launch");
    case "sql-queries-micro":
      return hasLesson(profile, "sql-beginner-select-sprint");
    case "neural-network-basics-micro":
      return hasLesson(profile, "ai-beginner-neural-garden");
    case "frontend-flex-micro":
      return hasLesson(profile, "html-css-beginner-flexbox-flow");
    case "python-beginner-certificate":
      return (
        pythonBeginner.completedLessons === pythonBeginner.totalLessons &&
        pythonBeginner.completedChallenges === pythonBeginner.totalChallenges &&
        pythonBeginner.accuracyRate >= 70
      );
    case "javascript-intermediate-certificate":
      return (
        javascriptIntermediate.completedLessons ===
          javascriptIntermediate.totalLessons &&
        javascriptIntermediate.completedChallenges ===
          javascriptIntermediate.totalChallenges &&
        javascriptIntermediate.accuracyRate >= 78
      );
    case "ai-foundations-certificate":
      return (
        aiBeginner.completedLessons === aiBeginner.totalLessons &&
        aiBeginner.completedChallenges === aiBeginner.totalChallenges &&
        aiBeginner.accuracyRate >= 75
      );
    case "mastery-bronze":
      return snapshot.masteryScore >= 35 && profile.streak >= 3;
    case "mastery-silver":
      return snapshot.masteryScore >= 55 && profile.streak >= 5;
    case "mastery-gold":
      return (
        snapshot.masteryScore >= 72 &&
        profile.streak >= 7 &&
        snapshot.averageChallengeAccuracy >= 78
      );
    case "mastery-platinum":
      return (
        snapshot.masteryScore >= 88 &&
        profile.streak >= 14 &&
        snapshot.capstoneScore >= 75
      );
    case "prompt-engineering-practitioner":
      return (
        isCredentialUnlocked(
          credentialDefinitions.find((item) => item.id === "ai-foundations-certificate")!,
          profile,
          snapshot,
        ) && aiBeginner.accuracyRate >= 80
      );
    case "vector-sense-specialization":
      return (
        aiIntermediate.completedLessons === aiIntermediate.totalLessons &&
        aiIntermediate.completedChallenges === aiIntermediate.totalChallenges &&
        aiIntermediate.accuracyRate >= 78
      );
    case "frontend-fundamentals-specialization":
      return (
        htmlBeginner.completedLessons === htmlBeginner.totalLessons &&
        jsBeginner.completedLessons === jsBeginner.totalLessons &&
        ((htmlBeginner.accuracyRate + jsBeginner.accuracyRate) / 2 >= 72)
      );
    case "ai-architect-elite":
      return (
        aiAdvanced.completedLessons === aiAdvanced.totalLessons &&
        aiAdvanced.completedChallenges === aiAdvanced.totalChallenges &&
        isCredentialUnlocked(
          credentialDefinitions.find((item) => item.id === "mastery-gold")!,
          profile,
          snapshot,
        )
      );
    case "systems-gauntlet-elite":
      return (
        getAdvancedChallengeCount(profile) >= 3 &&
        snapshot.averageChallengeAccuracy >= 80 &&
        profile.streak >= 8
      );
    default:
      return false;
  }
}

export function resolveCredentialAwards(profile: OrbitaProfile) {
  const snapshot = getMasterySnapshot(profile);

  return credentialDefinitions
    .filter((definition) => isCredentialUnlocked(definition, profile, snapshot))
    .map((definition) => {
      const issuedAt =
        profile.awardedCredentialDates[definition.id] ?? dateString();
      const credentialId = formatCredentialId(definition.id, issuedAt);
      const verificationPath = `/verify/${definition.id}?award=${credentialId}`;

      return {
        definition,
        issuedAt,
        credentialId,
        verificationPath,
        linkedInFields: {
          credentialName: definition.linkedInName,
          issuingOrganization: ORBITA_ORGANIZATION,
          issueDate: issuedAt,
          credentialId,
          credentialUrl: verificationPath,
        },
        progressToUnlock: 100,
      } satisfies CredentialAward;
    });
}

export function resolveLockedCredentialProgress(profile: OrbitaProfile) {
  const snapshot = getMasterySnapshot(profile);

  return credentialDefinitions
    .filter((definition) => !isCredentialUnlocked(definition, profile, snapshot))
    .map((definition) => ({
      definition,
      progressToUnlock: credentialProgress(definition, profile, snapshot),
    }))
    .sort((left, right) => right.progressToUnlock - left.progressToUnlock);
}

export function getCredentialAwardById(
  profile: OrbitaProfile,
  credentialId: string,
) {
  return resolveCredentialAwards(profile).find(
    (award) => award.definition.id === credentialId,
  );
}

export function getPrimaryNextCredential(profile: OrbitaProfile) {
  return resolveLockedCredentialProgress(profile)[0];
}

export function getGoalTrackDifferentiator(goalId: LearningGoalId, trackId: TrackId) {
  const track = getTrackById(trackId);
  const goal = getLearningGoalById(goalId);

  return `${goal.shortLabel} mode is active in ${track.name}: ${goal.questStyle.toLowerCase()}.`;
}

export function getCredentialCountByKind(profile: OrbitaProfile) {
  const awards = resolveCredentialAwards(profile);

  return {
    microBadges: awards.filter((award) => award.definition.kind === "micro-badge")
      .length,
    trackCertificates: awards.filter(
      (award) => award.definition.kind === "track-certificate",
    ).length,
    masteryTiers: awards.filter((award) => award.definition.kind === "mastery-tier")
      .length,
    specializations: awards.filter(
      (award) => award.definition.kind === "specialization",
    ).length,
    elite: awards.filter((award) => award.definition.kind === "elite").length,
  };
}

export function getCurrentMasteryTier(profile: OrbitaProfile) {
  const snapshot = getMasterySnapshot(profile);

  if (
    isCredentialUnlocked(
      getCredentialDefinitionById("mastery-platinum")!,
      profile,
      snapshot,
    )
  ) {
    return "Platinum";
  }

  if (
    isCredentialUnlocked(
      getCredentialDefinitionById("mastery-gold")!,
      profile,
      snapshot,
    )
  ) {
    return "Gold";
  }

  if (
    isCredentialUnlocked(
      getCredentialDefinitionById("mastery-silver")!,
      profile,
      snapshot,
    )
  ) {
    return "Silver";
  }

  if (
    isCredentialUnlocked(
      getCredentialDefinitionById("mastery-bronze")!,
      profile,
      snapshot,
    )
  ) {
    return "Bronze";
  }

  return "Unranked";
}

export function buildVerificationUrl(path: string, origin?: string) {
  return origin ? `${origin}${path}` : path;
}

export function getTrackCertificatePreview(profile: OrbitaProfile) {
  return tracks.map((track) => ({
    track,
    beginner: getTrackProgressSnapshot(profile, track.id, "beginner"),
    intermediate: getTrackProgressSnapshot(profile, track.id, "intermediate"),
    advanced: getTrackProgressSnapshot(profile, track.id, "advanced"),
  }));
}

export function getChallengeById(challengeId: string): ChallengeDefinition | undefined {
  return challenges.find((challenge) => challenge.id === challengeId);
}
