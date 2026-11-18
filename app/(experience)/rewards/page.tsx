"use client";

import { Lock, Sparkles, Trophy } from "lucide-react";

import { useOrbita } from "@/components/orbita-provider";
import { getAchievementIntel } from "@/lib/orbita-simulator";
import { cn } from "@/lib/utils";

export default function RewardsPage() {
  const { profile } = useOrbita();
  const badges = getAchievementIntel(profile);
  const nextBadge = badges.find((badge) => !badge.unlocked) ?? badges[0];
  const unlockedCount = badges.filter((badge) => badge.unlocked).length;

  return (
    <div className="space-y-6">
      <section className="panel-strong rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="eyebrow">Achievements</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              Rewards should feel worth chasing
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              Unlocked badges stay bright and crisp. Locked ones stay visible so the
              next milestone is always clear, not hidden.
            </p>

            <div className="mt-8 grid gap-5 border-t border-white/8 pt-6 sm:grid-cols-3">
              <div>
                <p className="eyebrow">Unlocked</p>
                <p className="mt-2 text-2xl font-semibold text-white">{unlockedCount}</p>
              </div>
              <div>
                <p className="eyebrow">Remaining</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {badges.length - unlockedCount}
                </p>
              </div>
              <div>
                <p className="eyebrow">Next tier</p>
                <p className="mt-2 text-2xl font-semibold text-white">{nextBadge.tier}</p>
              </div>
            </div>
          </div>

          <div className="panel rounded-[1.6rem] p-5">
            <p className="eyebrow">Next milestone</p>
            <div className="mt-4 rounded-[1.4rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-300">{nextBadge.tier} badge</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{nextBadge.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {nextBadge.description}
                  </p>
                </div>
                <div className="rounded-full bg-white/6 px-3 py-1 text-sm text-slate-300">
                  {Math.round(nextBadge.progress)}%
                </div>
              </div>
              <div className="progress-track mt-5">
                <div className="progress-bar" style={{ width: `${nextBadge.progress}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-300">{nextBadge.unlockText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={cn(
              "relative overflow-hidden rounded-[1.7rem] border p-6",
              badge.unlocked
                ? "panel border-transparent"
                : "border-white/8 bg-white/[0.025]",
            )}
          >
            {!badge.unlocked ? (
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))]" />
            ) : null}
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] border"
                  style={{
                    borderColor: `${badge.accent}35`,
                    background: `${badge.accent}14`,
                    color: badge.accent,
                    boxShadow: badge.unlocked
                      ? `0 0 28px ${badge.accent}22`
                      : "none",
                  }}
                >
                  {badge.unlocked ? (
                    <Sparkles className="h-5 w-5" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </div>

                <div className="text-right">
                  <p className="eyebrow">{badge.tier}</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {badge.unlocked ? "Unlocked" : "Locked"}
                  </p>
                </div>
              </div>

              <h2 className="mt-5 text-2xl font-semibold text-white">{badge.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{badge.description}</p>

              <div className="mt-5 rounded-[1rem] bg-white/[0.03] px-4 py-3">
                <p className="text-sm text-slate-300">{badge.unlockText}</p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-300">Unlock progress</span>
                <span className="font-medium text-white">{Math.round(badge.progress)}%</span>
              </div>
              <div className="progress-track mt-3">
                <div className="progress-bar" style={{ width: `${badge.progress}%` }} />
              </div>

              {!badge.unlocked ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                  <Trophy className="h-4 w-4" />
                  Locked, but still visible so the next chase is clear.
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
