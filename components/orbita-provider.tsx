"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  defaultProfile,
  getAvatarById,
  getChallengeById,
  getLevelById,
  getNextPlayableNode,
  getPath,
  getTrackById,
  resolveAchievementIds,
  type LearningGoalId,
  type LevelId,
  type OrbitaProfile,
  type TrackId,
} from "@/lib/orbita-data";
import {
  getCurrentMasteryTier,
  getLearningGoalById,
  getMasterySnapshot,
  getPrimaryNextCredential,
  resolveCredentialAwards,
  resolveLockedCredentialProgress,
} from "@/lib/orbita-progression";

const STORAGE_KEY = "orbita-profile-v1";

type OrbitaContextValue = {
  profile: OrbitaProfile;
  hydrated: boolean;
  currentTrack: ReturnType<typeof getTrackById>;
  currentLevel: ReturnType<typeof getLevelById>;
  learningGoal: ReturnType<typeof getLearningGoalById>;
  currentAvatar: ReturnType<typeof getAvatarById>;
  currentPath: ReturnType<typeof getPath>;
  nextPlayableNode: ReturnType<typeof getNextPlayableNode>;
  achievementIds: string[];
  masterySnapshot: ReturnType<typeof getMasterySnapshot>;
  credentialAwards: ReturnType<typeof resolveCredentialAwards>;
  lockedCredentialProgress: ReturnType<typeof resolveLockedCredentialProgress>;
  primaryNextCredential: ReturnType<typeof getPrimaryNextCredential>;
  currentMasteryTier: string;
  setTrack: (trackId: TrackId) => void;
  setLevel: (levelId: LevelId) => void;
  setGoal: (goalId: LearningGoalId) => void;
  setAvatar: (avatarId: string) => void;
  setDailyGoal: (dailyGoal: number) => void;
  finishOnboarding: () => void;
  completeLesson: (lessonId: string, xp: number, accuracy: number) => void;
  completeChallenge: (challengeId: string, accuracy: number) => void;
  resetProfile: () => void;
};

const OrbitaContext = createContext<OrbitaContextValue | null>(null);

function saveProfile(profile: OrbitaProfile) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function OrbitaProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<OrbitaProfile>(defaultProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      setHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<OrbitaProfile>;

      setProfile({
        ...defaultProfile,
        ...parsed,
        completedLessonIds:
          parsed.completedLessonIds ?? defaultProfile.completedLessonIds,
        completedChallengeIds:
          parsed.completedChallengeIds ?? defaultProfile.completedChallengeIds,
        lessonPerformance:
          parsed.lessonPerformance ?? defaultProfile.lessonPerformance,
        challengePerformance:
          parsed.challengePerformance ?? defaultProfile.challengePerformance,
        awardedCredentialDates:
          parsed.awardedCredentialDates ?? defaultProfile.awardedCredentialDates,
      });
    } catch {
      setProfile(defaultProfile);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveProfile(profile);
  }, [hydrated, profile]);

  const currentTrack = getTrackById(profile.trackId);
  const currentLevel = getLevelById(profile.levelId);
  const learningGoal = getLearningGoalById(profile.goalId);
  const currentAvatar = getAvatarById(profile.avatarId);
  const currentPath = getPath(profile.trackId, profile.levelId);
  const nextPlayableNode = getNextPlayableNode(profile);
  const achievementIds = resolveAchievementIds(profile);
  const masterySnapshot = getMasterySnapshot(profile);
  const credentialAwards = resolveCredentialAwards(profile);
  const lockedCredentialProgress = resolveLockedCredentialProgress(profile);
  const primaryNextCredential = getPrimaryNextCredential(profile);
  const currentMasteryTier = getCurrentMasteryTier(profile);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const missingDates = credentialAwards.filter(
      (award) => !profile.awardedCredentialDates[award.definition.id],
    );

    if (!missingDates.length) {
      return;
    }

    setProfile((current) => ({
      ...current,
      awardedCredentialDates: {
        ...current.awardedCredentialDates,
        ...Object.fromEntries(
          missingDates.map((award) => [award.definition.id, award.issuedAt]),
        ),
      },
    }));
  }, [credentialAwards, hydrated, profile.awardedCredentialDates]);

  const updateProfile = (updater: (current: OrbitaProfile) => OrbitaProfile) => {
    setProfile((current) => updater(current));
  };

  const value: OrbitaContextValue = {
    profile,
    hydrated,
    currentTrack,
    currentLevel,
    learningGoal,
    currentAvatar,
    currentPath,
    nextPlayableNode,
    achievementIds,
    masterySnapshot,
    credentialAwards,
    lockedCredentialProgress,
    primaryNextCredential,
    currentMasteryTier,
    setTrack: (trackId) =>
      updateProfile((current) => ({
        ...current,
        trackId,
      })),
    setLevel: (levelId) =>
      updateProfile((current) => ({
        ...current,
        levelId,
      })),
    setGoal: (goalId) =>
      updateProfile((current) => ({
        ...current,
        goalId,
      })),
    setAvatar: (avatarId) =>
      updateProfile((current) => ({
        ...current,
        avatarId,
      })),
    setDailyGoal: (dailyGoal) =>
      updateProfile((current) => ({
        ...current,
        dailyGoal,
      })),
    finishOnboarding: () =>
      updateProfile((current) => ({
        ...current,
        onboardingComplete: true,
      })),
    completeLesson: (lessonId, xp, accuracy) =>
      updateProfile((current) => {
        if (current.completedLessonIds.includes(lessonId)) {
          return {
            ...current,
            lessonPerformance: {
              ...current.lessonPerformance,
              [lessonId]: Math.max(
                current.lessonPerformance[lessonId] ?? 0,
                accuracy,
              ),
            },
          };
        }

        return {
          ...current,
          onboardingComplete: true,
          xp: current.xp + xp,
          completedLessonIds: [...current.completedLessonIds, lessonId],
          lessonPerformance: {
            ...current.lessonPerformance,
            [lessonId]: accuracy,
          },
        };
      }),
    completeChallenge: (challengeId, accuracy) =>
      updateProfile((current) => {
        if (current.completedChallengeIds.includes(challengeId)) {
          return {
            ...current,
            challengePerformance: {
              ...current.challengePerformance,
              [challengeId]: Math.max(
                current.challengePerformance[challengeId] ?? 0,
                accuracy,
              ),
            },
          };
        }

        const challenge = getChallengeById(challengeId);

        return {
          ...current,
          xp: current.xp + (challenge?.xp ?? 0),
          streak: current.streak + 1,
          completedChallengeIds: [...current.completedChallengeIds, challengeId],
          challengePerformance: {
            ...current.challengePerformance,
            [challengeId]: accuracy,
          },
        };
      }),
    resetProfile: () => {
      setProfile(defaultProfile);
      window.localStorage.removeItem(STORAGE_KEY);
    },
  };

  return (
    <OrbitaContext.Provider value={value}>{children}</OrbitaContext.Provider>
  );
}

export function useOrbita() {
  const context = useContext(OrbitaContext);

  if (!context) {
    throw new Error("useOrbita must be used within OrbitaProvider");
  }

  return context;
}
