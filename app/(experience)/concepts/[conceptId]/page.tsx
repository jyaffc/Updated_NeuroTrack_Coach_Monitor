"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BrainCircuit, CheckCircle2, Sparkles } from "lucide-react";

import { useOrbita } from "@/components/orbita-provider";
import {
  getConceptById,
  getConceptMastery,
  getRelatedChallengeCards,
  getRelatedLessonCards,
} from "@/lib/orbita-simulator";

export default function ConceptDetailPage({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}) {
  const { conceptId } = use(params);
  const concept = getConceptById(conceptId);
  const { profile } = useOrbita();

  if (!concept) {
    notFound();
  }

  const mastery = getConceptMastery(profile, concept);
  const relatedLessons = getRelatedLessonCards(concept);
  const relatedChallenges = getRelatedChallengeCards(concept);

  return (
    <div className="space-y-6">
      <section className="panel-strong rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div>
            <p className="eyebrow">Concept</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              {concept.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              {concept.deck}
            </p>
          </div>

          <div className="panel rounded-[1.6rem] p-5">
            <p className="eyebrow">Mastery status</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <h2 className="text-3xl font-semibold text-white">{mastery.status}</h2>
              <span className="rounded-full bg-white/6 px-3 py-1 text-sm text-slate-300">
                {Math.round(mastery.progress)}%
              </span>
            </div>
            <div className="progress-track mt-4">
              <div className="progress-bar" style={{ width: `${mastery.progress}%` }} />
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Target: {concept.masteryTarget}
            </p>
            <div className="mt-4 border-t border-white/8 pt-4">
              <p className="eyebrow">Mental shortcut</p>
              <p className="mt-2 text-sm leading-7 text-cyan-100">
                {concept.mentalShortcut}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="panel rounded-[1.9rem] p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="eyebrow">Simple explanation</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {concept.simpleExplanation}
              </p>
            </div>
            <div>
              <p className="eyebrow">Intuitive explanation</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {concept.intuitiveExplanation}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/8 pt-6">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-cyan-300" />
              <p className="eyebrow">Visual model</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">{concept.visualLegend}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {concept.visualNodes.map((node, index) => (
                <div
                  key={node.label}
                  className="relative rounded-[1.2rem] border border-white/8 bg-white/[0.02] p-4"
                >
                  {index < concept.visualNodes.length - 1 ? (
                    <div className="pointer-events-none absolute right-[-18px] top-1/2 hidden h-px w-8 bg-white/15 md:block" />
                  ) : null}
                  <div
                    className="h-1.5 w-full rounded-full"
                    style={{
                      background:
                        node.tone === "cyan"
                          ? "linear-gradient(90deg,#60d8ff,#9adfff)"
                          : node.tone === "violet"
                            ? "linear-gradient(90deg,#a172ff,#d0b4ff)"
                            : node.tone === "green"
                              ? "linear-gradient(90deg,#7ef1cb,#b6ffe8)"
                              : "linear-gradient(90deg,#ffc96f,#ffe1a5)",
                    }}
                  />
                  <h3 className="mt-4 text-xl font-semibold text-white">{node.label}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{node.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 border-t border-white/8 pt-6 md:grid-cols-2">
            <div>
              <p className="eyebrow">Worked example</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{concept.realExample}</p>
            </div>
            <div>
              <p className="eyebrow">Why it matters</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{concept.whyItMatters}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 border-t border-white/8 pt-6 md:grid-cols-2">
            <div>
              <p className="eyebrow">Common mistakes</p>
              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
                {concept.commonMistakes.map((mistake) => (
                  <p key={mistake}>{mistake}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow">Quick recap</p>
              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
                {concept.recap.map((point) => (
                  <p key={point}>{point}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="panel rounded-[1.8rem] p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <p className="eyebrow">Linked practice</p>
            </div>
            <div className="mt-5 space-y-3">
              {relatedLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/lesson/${lesson.id}`}
                  className="block rounded-[1.1rem] border border-white/8 bg-white/[0.02] p-4 transition hover:border-white/14"
                >
                  <h3 className="text-lg font-semibold text-white">{lesson.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {lesson.subtitle}
                  </p>
                </Link>
              ))}
              {relatedChallenges.map((challenge) => (
                <Link
                  key={challenge.id}
                  href={`/challenge/${challenge.id}`}
                  className="block rounded-[1.1rem] border border-cyan-300/14 bg-cyan-300/6 p-4 transition hover:border-cyan-300/24"
                >
                  <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {challenge.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="panel rounded-[1.8rem] p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-300" />
              <p className="eyebrow">Practice prompt</p>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {concept.practicePrompt}
            </p>
            <Link
              href={relatedLessons[0] ? `/lesson/${relatedLessons[0].id}` : "/concepts"}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-200"
            >
              Go into practice
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </section>
    </div>
  );
}
