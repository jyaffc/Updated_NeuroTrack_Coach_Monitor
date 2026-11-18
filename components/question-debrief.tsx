"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";

import type { QuestionInsight } from "@/lib/orbita-simulator";

type QuestionDebriefProps = {
  insight: QuestionInsight;
  correct: boolean;
  onPractice?: () => void;
};

export function QuestionDebrief({
  insight,
  correct,
  onPractice,
}: QuestionDebriefProps) {
  return (
    <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/8 px-5 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            correct
              ? "bg-emerald-400/12 text-emerald-200"
              : "bg-amber-400/12 text-amber-200"
          }`}
        >
          {correct ? "Correct" : "Needs review"}
        </span>
        <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-slate-300">
          {insight.difficultyLabel}
        </span>
        <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-slate-300">
          {insight.conceptTitle}
        </span>
      </div>

      <div className="grid gap-8 px-5 py-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section>
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
              <ShieldCheck className="h-4 w-4" />
              Correct answer
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              <span className="font-semibold text-white">{insight.correctAnswer}</span>:{" "}
              {insight.whyCorrect}
            </p>
          </section>

          <section>
            <p className="text-sm font-semibold text-white">Why the other options fail</p>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
              {insight.whyOthersAreWrong.map((reason) => (
                <p key={reason}>{reason}</p>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
              <TriangleAlert className="h-4 w-4" />
              Common mistakes
            </div>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
              {insight.commonMistakes.map((mistake) => (
                <p key={mistake}>{mistake}</p>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5 border-t border-white/8 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <section>
            <p className="eyebrow">Concept being tested</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {insight.conceptBeingTested}
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Memory shortcut
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {insight.mentalShortcut}
            </p>
          </section>

          <section className="space-y-3">
            <Link
              href={insight.conceptPath}
              className="primary-button w-full justify-center px-4 py-3 text-sm"
            >
              Review concept
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={onPractice}
              className="secondary-button w-full justify-center px-4 py-3 text-sm"
            >
              {correct ? "Practice similar" : "Retry similar"}
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
