"use client";

import { Settings2 } from "lucide-react";

import { AvatarGlyph } from "@/components/avatar-glyph";
import { useOrbita } from "@/components/orbita-provider";
import { avatars, levels, tracks } from "@/lib/orbita-data";
import { learningGoals } from "@/lib/orbita-progression";
import { cn } from "@/lib/utils";

const goalOptions = [2, 3, 4, 5];

export default function SettingsPage() {
  const {
    currentAvatar,
    currentLevel,
    currentTrack,
    learningGoal,
    profile,
    setAvatar,
    setDailyGoal,
    setGoal,
    setLevel,
    setTrack,
  } = useOrbita();

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <section className="space-y-6">
        <section className="panel-strong rounded-[2rem] p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Settings2 className="h-5 w-5 text-cyan-300" />
            <div>
              <p className="eyebrow">Settings</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-white">
                Change the route without losing progress
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
            Track, level, path, avatar, and daily goal can all change safely. Your
            completed lessons, earned credentials, XP, and streak history stay with
            you.
          </p>
        </section>

        <section className="panel rounded-[1.8rem] p-6">
          <p className="eyebrow">Track</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {tracks.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => setTrack(track.id)}
                className={cn(
                  "rounded-[1.2rem] border p-4 text-left transition",
                  currentTrack.id === track.id
                    ? "border-cyan-300/28 bg-cyan-300/8"
                    : "border-white/8 bg-white/[0.02] hover:border-white/14",
                )}
              >
                <p className="text-xl font-semibold text-white">{track.name}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{track.tagline}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="panel rounded-[1.8rem] p-6">
          <p className="eyebrow">Level</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {levels.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => setLevel(level.id)}
                className={cn(
                  "rounded-[1.2rem] border p-4 text-left transition",
                  currentLevel.id === level.id
                    ? "border-violet-300/28 bg-violet-300/8"
                    : "border-white/8 bg-white/[0.02] hover:border-white/14",
                )}
              >
                <p className="text-xl font-semibold text-white">{level.label}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{level.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="panel rounded-[1.8rem] p-6">
          <p className="eyebrow">Learning path</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {learningGoals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => setGoal(goal.id)}
                className={cn(
                  "rounded-[1.2rem] border p-4 text-left transition",
                  learningGoal.id === goal.id
                    ? "border-amber-300/28 bg-amber-300/8"
                    : "border-white/8 bg-white/[0.02] hover:border-white/14",
                )}
              >
                <p className="text-xl font-semibold text-white">{goal.label}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{goal.questStyle}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="panel rounded-[1.8rem] p-6">
          <p className="eyebrow">Daily goal</p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {goalOptions.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setDailyGoal(goal)}
                className={cn(
                  "rounded-[1.1rem] border px-4 py-4 text-sm font-semibold transition",
                  profile.dailyGoal === goal
                    ? "border-emerald-300/28 bg-emerald-300/8 text-emerald-100"
                    : "border-white/8 bg-white/[0.02] text-slate-300 hover:border-white/14",
                )}
              >
                {goal} modules
              </button>
            ))}
          </div>
        </section>
      </section>

      <aside className="space-y-6">
        <section className="panel rounded-[1.8rem] p-6">
          <p className="eyebrow">Avatar</p>
          <div className="mt-4 rounded-[1.4rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(110,212,255,0.12),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
            <AvatarGlyph avatar={currentAvatar} className="mx-auto h-[20rem] w-[13rem]" />
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-semibold text-white">{currentAvatar.name}</h2>
              <p className="mt-2 text-sm text-slate-300">{currentAvatar.role}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {avatars.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setAvatar(avatar.id)}
                className={cn(
                  "rounded-[1.2rem] border p-4 text-left transition",
                  currentAvatar.id === avatar.id
                    ? "border-cyan-300/28 bg-cyan-300/8"
                    : "border-white/8 bg-white/[0.02] hover:border-white/14",
                )}
              >
                <div className="flex items-center gap-3">
                  <AvatarGlyph avatar={avatar} compact />
                  <div>
                    <p className="text-lg font-semibold text-white">{avatar.name}</p>
                    <p className="text-sm text-slate-300">{avatar.role}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="panel rounded-[1.8rem] p-6">
          <p className="eyebrow">What changes</p>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
            <p>Level changes explanation depth, quiz difficulty, and certification thresholds.</p>
            <p>Track changes the next route, concept library, and duel pack.</p>
            <p>Learning path changes the recommendations and the emphasis of the route.</p>
          </div>
        </section>

        <section className="panel rounded-[1.8rem] p-6">
          <p className="eyebrow">What stays</p>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
            <p>Completed lessons and challenges stay completed.</p>
            <p>XP, streak history, and issued credentials are preserved.</p>
            <p>The system recalibrates forward. It does not wipe your account backward.</p>
          </div>
        </section>
      </aside>
    </div>
  );
}
