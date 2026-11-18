"use client";

import Link from "next/link";
import { BrainCircuit } from "lucide-react";

import { useOrbita } from "@/components/orbita-provider";
import { getConceptMastery, getConceptsForTrack } from "@/lib/orbita-simulator";

export default function ConceptsPage() {
  const { currentLevel, currentTrack, profile } = useOrbita();
  const concepts = getConceptsForTrack(currentTrack.id);
  const conceptRows = concepts.map((concept) => ({
    concept,
    mastery: getConceptMastery(profile, concept),
  }));

  const masteredCount = conceptRows.filter((item) => item.mastery.status === "Mastered").length;
  const inTrainingCount = conceptRows.filter(
    (item) => item.mastery.status === "In training" || item.mastery.status === "Operational",
  ).length;

  return (
    <div className="space-y-6">
      <section className="panel-strong rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">Concept library</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              Learn the idea before you answer the question
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              Each concept page explains the core idea in plain language, adds an
              intuition, shows a worked example, calls out the common mistake, and
              then points you into practice.
            </p>

            <div className="mt-8 grid gap-5 border-t border-white/8 pt-6 sm:grid-cols-3">
              <div>
                <p className="eyebrow">Track</p>
                <p className="mt-2 text-2xl font-semibold text-white">{currentTrack.name}</p>
              </div>
              <div>
                <p className="eyebrow">Level</p>
                <p className="mt-2 text-2xl font-semibold text-white">{currentLevel.label}</p>
              </div>
              <div>
                <p className="eyebrow">Concepts</p>
                <p className="mt-2 text-2xl font-semibold text-white">{concepts.length}</p>
              </div>
            </div>
          </div>

          <div className="panel rounded-[1.6rem] p-5">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-cyan-300" />
              <p className="eyebrow">Coverage snapshot</p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div>
                <p className="eyebrow">Mastered</p>
                <p className="mt-2 text-2xl font-semibold text-white">{masteredCount}</p>
              </div>
              <div>
                <p className="eyebrow">In progress</p>
                <p className="mt-2 text-2xl font-semibold text-white">{inTrainingCount}</p>
              </div>
              <div>
                <p className="eyebrow">Current focus</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {currentTrack.topics[currentLevel.id].slice(0, 3).join(", ")}
                </p>
              </div>
            </div>
            <div className="mt-5 border-t border-white/8 pt-4">
              <p className="eyebrow">How to use this</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Start with the concept that matches your next lesson, skim the
                visual model, then take the linked practice while the idea is fresh.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {conceptRows.map(({ concept, mastery }) => (
          <Link
            key={concept.id}
            href={`/concepts/${concept.id}`}
            className="panel rounded-[1.7rem] p-6 transition hover:border-white/12"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{mastery.status}</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{concept.title}</h2>
              </div>
              <div className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
                {Math.round(mastery.progress)}%
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">{concept.deck}</p>

            <div className="progress-track mt-5">
              <div className="progress-bar" style={{ width: `${mastery.progress}%` }} />
            </div>

            <div className="mt-5 grid gap-5 border-t border-white/8 pt-5 md:grid-cols-2">
              <div>
                <p className="eyebrow">Start here</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {concept.simpleExplanation}
                </p>
              </div>
              <div>
                <p className="eyebrow">Why it matters</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {concept.whyItMatters}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
