"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  Flame,
  Shield,
  Sparkles,
  Swords,
  Trophy,
} from "lucide-react";

import { AvatarGlyph } from "@/components/avatar-glyph";
import { useOrbita } from "@/components/orbita-provider";
import {
  getAchievementIntel,
  getDailyObjectives,
  getFeaturedTrackConcepts,
  getPlayerLevel,
  getSimulatorOverview,
  getXpToNextLevel,
} from "@/lib/orbita-simulator";
import { cn } from "@/lib/utils";

export default function AcademyPage() {
  const {
    currentAvatar,
    currentLevel,
    currentMasteryTier,
    currentPath,
    currentTrack,
    learningGoal,
    masterySnapshot,
    nextPlayableNode,
    primaryNextCredential,
    profile,
  } = useOrbita();

  const levelState = getXpToNextLevel(profile.xp);
  const overview = getSimulatorOverview(profile);
  const achievements = getAchievementIntel(profile);
  const conceptPreview = getFeaturedTrackConcepts(profile).slice(0, 3);
  const dailyObjectives = getDailyObjectives(profile);
  const nextBadge = achievements.find((item) => !item.unlocked) ?? achievements[0];
  const nextHref =
    nextPlayableNode?.linkedId == null
      ? "/map"
      : nextPlayableNode.type === "challenge"
        ? `/challenge/${nextPlayableNode.linkedId}`
        : `/lesson/${nextPlayableNode.linkedId}`;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="panel-strong overflow-hidden rounded-[2rem] p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:items-center">
            <div className="relative rounded-[1.75rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(110,212,255,0.16),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-5 pb-5 pt-6">
              <div className="absolute inset-x-6 bottom-5 h-14 rounded-full bg-cyan-400/15 blur-3xl" />
              <AvatarGlyph
                avatar={currentAvatar}
                className="mx-auto h-[28rem] w-[18rem] max-w-full"
              />
              <div className="relative mt-5 border-t border-white/8 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow">Your operative</p>
                    <h2 className="text-2xl font-semibold text-white">
                      {currentAvatar.name}
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">
                    {currentAvatar.role}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {currentAvatar.description}
                </p>
                <p className="mt-3 text-sm font-medium text-cyan-100">
                  Perk: {currentAvatar.perk}
                </p>
              </div>
            </div>

            <div>
              <p className="eyebrow">Dashboard</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                Continue {currentTrack.name} at {currentLevel.label}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                Your next session is{" "}
                <span className="font-semibold text-white">
                  {nextPlayableNode?.title ?? "ready"}
                </span>
                . Progress stays intact when you change level, path, or avatar. The
                system only adapts the pace, explanations, and challenge depth of
                what comes next.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={nextHref} className="primary-button px-5 py-3 text-sm">
                  Continue learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/duels" className="secondary-button px-5 py-3 text-sm">
                  Enter skill duel
                  <Swords className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid gap-5 border-t border-white/8 pt-6 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Level", `LVL ${getPlayerLevel(profile.xp)}`],
                  ["XP", `${profile.xp}`],
                  ["Streak", `${profile.streak} days`],
                  ["Tier", currentMasteryTier],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="eyebrow">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 border-t border-white/8 pt-6 md:grid-cols-2">
                <div>
                  <p className="eyebrow">Progress pacing</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {currentLevel.label} changes explanation density, quiz
                    complexity, and the certification bar.
                  </p>
                  <div className="progress-track mt-4">
                    <div
                      className="progress-bar"
                      style={{ width: `${levelState.progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {levelState.currentInLevel}/{levelState.required} XP in the
                    current level
                  </p>
                </div>

                <div>
                  <p className="eyebrow">Current path</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {currentPath.dailyQuest}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Goal mode:{" "}
                    <span className="text-slate-200">{learningGoal.shortLabel}</span>
                  </p>
                  <p className="mt-1 text-sm leading-7 text-slate-400">
                    Route:{" "}
                    <span className="text-slate-200">{currentPath.worldName}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="panel rounded-[1.75rem] p-6">
            <p className="eyebrow">Next credential</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {primaryNextCredential?.definition.title ?? "Credential ladder clear"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {primaryNextCredential?.definition.requirementLabel ??
                "Keep learning with strong accuracy and consistency to unlock the next credential."}
            </p>
            <div className="progress-track mt-5">
              <div
                className="progress-bar"
                style={{ width: `${primaryNextCredential?.progressToUnlock ?? 100}%` }}
              />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="eyebrow">Accuracy</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {Math.round(masterySnapshot.accuracyRate)}%
                </p>
              </div>
              <div>
                <p className="eyebrow">Mastery</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {Math.round(masterySnapshot.masteryScore)}
                </p>
              </div>
              <div>
                <p className="eyebrow">Concepts</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {overview.sectorCount}
                </p>
              </div>
            </div>
          </section>

          <section className="panel rounded-[1.75rem] p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <p className="eyebrow">Today</p>
            </div>
            <div className="mt-4 space-y-4">
              {dailyObjectives.map((objective) => (
                <div
                  key={objective.id}
                  className="border-b border-white/8 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {objective.title}
                      </p>
                      <p className="mt-1 text-sm leading-7 text-slate-300">
                        {objective.detail}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                      {objective.reward}
                    </span>
                  </div>
                  <div className="progress-track mt-3">
                    <div
                      className="progress-bar"
                      style={{ width: `${objective.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
        <section className="panel rounded-[1.9rem] p-6">
          <div className="flex flex-col gap-3 border-b border-white/8 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Current path</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                What to do next
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                The route is designed to keep one next step obvious, then show
                the rest of the ladder underneath.
              </p>
            </div>
            <Link href="/map" className="secondary-button px-4 py-2 text-sm">
              Open full map
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {currentPath.nodes.map((node, index) => {
              const complete =
                (node.type === "lesson" &&
                  node.linkedId &&
                  profile.completedLessonIds.includes(node.linkedId)) ||
                (node.type === "challenge" &&
                  node.linkedId &&
                  profile.completedChallengeIds.includes(node.linkedId));
              const upcoming = nextPlayableNode?.id === node.id;

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={cn(
                    "rounded-[1.35rem] border p-4 transition",
                    upcoming
                      ? "border-cyan-300/28 bg-cyan-300/8"
                      : complete
                        ? "border-white/8 bg-white/[0.035]"
                        : "border-white/8 bg-white/[0.02]",
                  )}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-slate-300">
                          Step {index + 1}
                        </span>
                        <span className="text-xs font-medium capitalize text-slate-400">
                          {node.type}
                        </span>
                        {complete ? (
                          <span className="text-xs font-medium text-emerald-300">
                            Completed
                          </span>
                        ) : upcoming ? (
                          <span className="text-xs font-medium text-cyan-200">
                            Up next
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-3 text-xl font-semibold text-white">
                        {node.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                        {node.summary}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-medium text-slate-200">
                        {node.xp} XP
                      </span>
                      <span className="text-sm text-slate-400">
                        {complete ? "Saved" : node.duration}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <div className="space-y-6">
          <section className="panel rounded-[1.9rem] p-6">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-cyan-300" />
              <p className="eyebrow">Concepts</p>
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Understand these next
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Review the ideas most likely to improve your next lesson and
                  challenge results.
                </p>
              </div>
              <Link href="/concepts" className="text-sm font-medium text-cyan-200">
                Browse all
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {conceptPreview.map(({ concept, mastery }) => (
                <Link
                  key={concept.id}
                  href={`/concepts/${concept.id}`}
                  className="block rounded-[1.2rem] border border-white/8 bg-white/[0.02] p-4 transition hover:border-white/14"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {concept.title}
                      </h3>
                      <p className="mt-1 text-sm leading-7 text-slate-300">
                        {concept.deck}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-slate-300">
                      {mastery.status}
                    </span>
                  </div>
                  <div className="progress-track mt-4">
                    <div
                      className="progress-bar"
                      style={{ width: `${mastery.progress}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="panel rounded-[1.9rem] p-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-300" />
              <p className="eyebrow">Next reward</p>
            </div>
            <div className="mt-4 rounded-[1.4rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-300">
                    {nextBadge.tier} badge
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {nextBadge.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {nextBadge.description}
                  </p>
                </div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">
                  {Math.round(nextBadge.progress)}%
                </div>
              </div>
              <div className="progress-track mt-5">
                <div
                  className="progress-bar"
                  style={{ width: `${nextBadge.progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-300">{nextBadge.unlockText}</p>
              <Link
                href="/rewards"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-200"
              >
                View achievements
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.2rem] bg-white/[0.02] p-4">
                <Flame className="h-4 w-4 text-amber-300" />
                <p className="mt-3 text-sm text-slate-300">Accuracy pressure</p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {overview.accuracyPressure}%
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-white/[0.02] p-4">
                <Shield className="h-4 w-4 text-emerald-300" />
                <p className="mt-3 text-sm text-slate-300">Lesson completion</p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {overview.lessonPressure}%
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-white/[0.02] p-4">
                <Trophy className="h-4 w-4 text-violet-300" />
                <p className="mt-3 text-sm text-slate-300">Challenge completion</p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {overview.challengePressure}%
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
