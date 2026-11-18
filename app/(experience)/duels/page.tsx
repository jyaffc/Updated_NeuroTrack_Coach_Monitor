"use client";

import { Trophy } from "lucide-react";

import { DuelArena } from "@/components/duel-arena";

export default function DuelsPage() {
  return (
    <div className="space-y-6">
      <section className="panel-strong rounded-[2rem] p-6 md:p-8">
        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-amber-300" />
          <div>
            <p className="eyebrow">Duels</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-white">
              Challenge a friend on the same quiz
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Duels turn practice into a shared event: same questions, same timer,
          clear scoring, a winner screen, and an immediate rematch if you want it.
        </p>
      </section>

      <DuelArena />
    </div>
  );
}
