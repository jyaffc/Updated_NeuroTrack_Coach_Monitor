"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

import { useOrbita } from "@/components/orbita-provider";
import { cn } from "@/lib/utils";

export default function MapPage() {
  const { currentLevel, currentPath, currentTrack, profile } = useOrbita();

  return (
    <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
      <section className="sim-panel rounded-[2rem] p-6">
        <div className="flex flex-col gap-4 border-b border-white/8 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="sim-label">Sector map</p>
            <h1 className="sim-heading mt-2 text-4xl">
              {currentTrack.name}
              {" // "}
              {currentPath.worldName}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">{currentPath.mood}</p>
          </div>
          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-100">
            {currentLevel.label}
          </div>
        </div>

        <div className="relative mt-8 space-y-4 before:absolute before:left-[1.3rem] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-[linear-gradient(180deg,rgba(96,216,255,0.5),rgba(161,114,255,0.44),rgba(126,241,203,0.42))]">
          {currentPath.nodes.map((node, index) => {
            const complete =
              (node.type === "lesson" &&
                node.linkedId &&
                profile.completedLessonIds.includes(node.linkedId)) ||
              (node.type === "challenge" &&
                node.linkedId &&
                profile.completedChallengeIds.includes(node.linkedId));
            const playable = node.type !== "preview" && node.linkedId;

            return (
              <div
                key={node.id}
                className={cn(
                  "relative ml-8 rounded-[1.4rem] border p-5",
                  complete
                    ? "border-emerald-300/18 bg-emerald-300/8"
                    : "border-white/8 bg-white/4",
                )}
              >
                <div className="absolute -left-8 top-8 flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/24 bg-[#081021] text-[11px] font-semibold text-cyan-100 shadow-[0_0_20px_rgba(96,216,255,0.18)]">
                  {index + 1}
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="sim-label">{node.type}</p>
                    <h2 className="sim-heading mt-2 text-2xl">{node.title}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-white/66">{node.summary}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/58">
                      {node.xp} XP
                    </div>
                    <div
                      className={cn(
                        "rounded-full px-4 py-2 text-xs uppercase tracking-[0.22em]",
                        complete
                          ? "bg-emerald-300/14 text-emerald-100"
                          : "bg-white/6 text-white/55",
                      )}
                    >
                      {complete ? "Complete" : node.duration}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  {playable ? (
                    <Link
                      href={
                        node.type === "challenge"
                          ? `/challenge/${node.linkedId}`
                          : `/lesson/${node.linkedId}`
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-300/24 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100"
                    >
                      {node.type === "challenge" ? "Open assessment" : "Launch lesson"}
                      <Sparkles className="h-4 w-4" />
                    </Link>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm font-semibold text-white/56">
                      <Lock className="h-4 w-4" />
                      Preview node
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <aside className="grid gap-6">
        <div className="sim-panel rounded-[2rem] p-6">
          <p className="sim-label">Daily quest</p>
          <h2 className="sim-heading mt-2 text-3xl">{currentPath.dailyQuest}</h2>
          <p className="mt-4 text-sm leading-7 text-white/68">
            This route changes with your level setting and selected track without erasing any
            previous completions.
          </p>
        </div>

        <div className="sim-panel rounded-[2rem] p-6">
          <p className="sim-label">Track topics</p>
          <div className="mt-5 grid gap-3">
            {currentTrack.topics[currentLevel.id].map((topic) => (
              <div key={topic} className="rounded-[1rem] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/78">
                {topic}
              </div>
            ))}
          </div>
        </div>

        <div className="sim-panel rounded-[2rem] p-6">
          <p className="sim-label">Capstone</p>
          <h2 className="sim-heading mt-2 text-3xl">{currentPath.capstone}</h2>
          <p className="mt-4 text-sm leading-7 text-white/68">
            This is the pressure test for the route. Expect faster pacing, tighter feedback, and
            a heavier mastery requirement.
          </p>
        </div>
      </aside>
    </div>
  );
}
