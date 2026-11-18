"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Sparkles, Trophy } from "lucide-react";

import { QuestionDebrief } from "@/components/question-debrief";
import { useOrbita } from "@/components/orbita-provider";
import type { ChallengeDefinition } from "@/lib/orbita-data";
import { buildChallengeInsight } from "@/lib/orbita-simulator";
import { cn } from "@/lib/utils";

type ChallengeBoardProps = {
  challenge: ChallengeDefinition;
};

function sameSequence(left: string[], right: string[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function ChallengeBoard({ challenge }: ChallengeBoardProps) {
  const { completeChallenge } = useOrbita();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [complete, setComplete] = useState(false);

  const currentRound = challenge.rounds[activeIndex];
  const insight = buildChallengeInsight(challenge, currentRound);
  const currentAnswer = answers[currentRound.id];
  const checkedCount = challenge.rounds.filter((round) => checked[round.id]).length;
  const currentCorrect =
    currentRound.type === "rapid"
      ? currentAnswer === currentRound.answer
      : currentRound.type === "sequence"
        ? Array.isArray(currentAnswer) && sameSequence(currentAnswer, currentRound.answer)
        : typeof currentAnswer === "string" &&
          currentRound.cards.every((card) =>
            currentAnswer.split("|").includes(`${card.label}=>${card.answer}`),
          );

  const score = challenge.rounds.reduce((total, round) => {
    const answer = answers[round.id];

    if (!checked[round.id] || !answer) {
      return total;
    }

    if (round.type === "rapid") {
      return total + (answer === round.answer ? 1 : 0);
    }

    if (round.type === "sequence") {
      return total + (Array.isArray(answer) && sameSequence(answer, round.answer) ? 1 : 0);
    }

    if (typeof answer !== "string") {
      return total;
    }

    return total +
      (round.cards.every((card) =>
        answer.split("|").includes(`${card.label}=>${card.answer}`),
      )
        ? 1
        : 0);
  }, 0);

  const allChecked = checkedCount === challenge.rounds.length;

  const getSortAssignment = (label: string) => {
    if (typeof currentAnswer !== "string") {
      return "";
    }

    return (
      currentAnswer
        .split("|")
        .find((entry) => entry.startsWith(`${label}=>`))
        ?.split("=>")[1] ?? ""
    );
  };

  return (
    <>
      <div className="space-y-6">
        <section className="panel rounded-[1.6rem] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow">Assessment progress</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Round {activeIndex + 1} of {challenge.rounds.length}
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Work through one round at a time, then review the reasoning before
                you move forward.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="eyebrow">Checked</p>
                <p className="mt-2 text-2xl font-semibold text-white">{checkedCount}</p>
              </div>
              <div>
                <p className="eyebrow">Score</p>
                <p className="mt-2 text-2xl font-semibold text-white">{score}</p>
              </div>
              <div>
                <p className="eyebrow">Reward</p>
                <p className="mt-2 text-2xl font-semibold text-white">{challenge.xp}</p>
              </div>
            </div>
          </div>

          <div className="progress-track mt-5">
            <div
              className="progress-bar"
              style={{ width: `${((activeIndex + 1) / challenge.rounds.length) * 100}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {challenge.rounds.map((round, index) => (
              <button
                key={round.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition",
                  activeIndex === index
                    ? "bg-white text-slate-950"
                    : checked[round.id]
                      ? "bg-cyan-300/12 text-cyan-100"
                      : "bg-white/5 text-slate-300 hover:bg-white/10",
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <motion.section
            key={currentRound.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel-strong rounded-[1.8rem] p-6"
          >
            <div className="border-b border-white/8 pb-5">
              <p className="eyebrow">Current round</p>
              <h3 className="mt-2 text-3xl font-semibold text-white">
                {currentRound.prompt}
              </h3>
            </div>

            {currentRound.type === "rapid" && (
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {currentRound.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [currentRound.id]: option,
                      }))
                    }
                    className={cn(
                      "rounded-[1.1rem] border px-4 py-4 text-left text-sm font-medium transition",
                      currentAnswer === option
                        ? "border-cyan-300/32 bg-cyan-300/10 text-cyan-50"
                        : "border-white/8 bg-white/[0.02] text-slate-200 hover:border-white/14",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentRound.type === "sequence" && (
              <div className="mt-6 grid gap-3">
                {(Array.isArray(currentAnswer) ? currentAnswer : currentRound.steps).map(
                  (step, stepIndex, list) => (
                    <div
                      key={`${step}-${stepIndex}`}
                      className="flex items-center justify-between gap-4 rounded-[1rem] border border-white/8 bg-white/[0.02] px-4 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-slate-300">
                          {stepIndex + 1}
                        </span>
                        <span className="text-sm text-slate-200">{step}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setAnswers((current) => {
                              const order = Array.isArray(current[currentRound.id])
                                ? [...(current[currentRound.id] as string[])]
                                : [...currentRound.steps];

                              if (stepIndex === 0) {
                                return { ...current, [currentRound.id]: order };
                              }

                              [order[stepIndex - 1], order[stepIndex]] = [
                                order[stepIndex],
                                order[stepIndex - 1],
                              ];

                              return { ...current, [currentRound.id]: order };
                            })
                          }
                          className="secondary-button px-3 py-2 text-xs"
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setAnswers((current) => {
                              const order = Array.isArray(current[currentRound.id])
                                ? [...(current[currentRound.id] as string[])]
                                : [...currentRound.steps];

                              if (stepIndex === list.length - 1) {
                                return { ...current, [currentRound.id]: order };
                              }

                              [order[stepIndex], order[stepIndex + 1]] = [
                                order[stepIndex + 1],
                                order[stepIndex],
                              ];

                              return { ...current, [currentRound.id]: order };
                            })
                          }
                          className="secondary-button px-3 py-2 text-xs"
                        >
                          Down
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {currentRound.type === "sort" && (
              <div className="mt-6 grid gap-3">
                {currentRound.cards.map((card) => (
                  <label
                    key={card.id}
                    className="grid gap-3 rounded-[1rem] border border-white/8 bg-white/[0.02] p-4 md:grid-cols-[1fr_220px]"
                  >
                    <span className="text-sm font-medium text-white">{card.label}</span>
                    <select
                      value={getSortAssignment(card.label)}
                      onChange={(event) =>
                        setAnswers((current) => {
                          const entries = current[currentRound.id]
                            ? current[currentRound.id].toString().split("|").filter(Boolean)
                            : [];
                          const nextEntries = entries.filter(
                            (entry) => !entry.startsWith(`${card.label}=>`),
                          );
                          nextEntries.push(`${card.label}=>${event.target.value}`);

                          return {
                            ...current,
                            [currentRound.id]: nextEntries.join("|"),
                          };
                        })
                      }
                      className="rounded-[0.9rem] border border-white/10 bg-[#06101b] px-3 py-2 text-sm text-white outline-none"
                    >
                      <option value="">Place card</option>
                      {currentRound.categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setChecked((current) => ({
                    ...current,
                    [currentRound.id]: true,
                  }))
                }
                className="primary-button px-5 py-3 text-sm"
              >
                Check round
              </button>
              <button
                type="button"
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
                className={cn(
                  "secondary-button px-5 py-3 text-sm",
                  activeIndex === 0 && "pointer-events-none opacity-40",
                )}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!checked[currentRound.id]}
                onClick={() =>
                  setActiveIndex((current) =>
                    Math.min(challenge.rounds.length - 1, current + 1),
                  )
                }
                className={cn(
                  "secondary-button px-5 py-3 text-sm",
                  !checked[currentRound.id] && "pointer-events-none opacity-40",
                )}
              >
                {activeIndex === challenge.rounds.length - 1 ? "Review summary" : "Next round"}
              </button>
            </div>

            {checked[currentRound.id] ? (
              <>
                <div
                  className={cn(
                    "mt-5 rounded-[1rem] px-4 py-3 text-sm font-medium",
                    currentCorrect
                      ? "bg-emerald-400/12 text-emerald-200"
                      : "bg-amber-400/12 text-amber-200",
                  )}
                >
                  {currentCorrect
                    ? "Round cleared. Review the explanation and keep moving."
                    : "Round missed. Review the explanation before you continue."}
                </div>

                <QuestionDebrief
                  insight={insight}
                  correct={currentCorrect}
                  onPractice={() => setPracticeId(currentRound.id)}
                />

                {practiceId === currentRound.id ? (
                  <div className="mt-4 rounded-[1rem] border border-violet-300/14 bg-violet-300/8 p-4 text-sm leading-7 text-violet-50">
                    Practice prompt: {insight.practicePrompt}
                  </div>
                ) : null}
              </>
            ) : null}
          </motion.section>

          <aside className="space-y-4">
            <section className="panel rounded-[1.6rem] p-5">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-cyan-300" />
                <p className="eyebrow">Round focus</p>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {insight.conceptTitle}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {insight.conceptBeingTested}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-slate-300">
                  {insight.difficultyLabel}
                </span>
                <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-slate-300">
                  {currentRound.type}
                </span>
              </div>
            </section>

            <section className="panel rounded-[1.6rem] p-5">
              <p className="eyebrow">Assessment goal</p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {challenge.subtitle}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {challenge.description}
              </p>
              <Link
                href={insight.conceptPath}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-200"
              >
                Review concept page
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          </aside>
        </section>

        <section className="panel rounded-[1.6rem] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow">Assessment summary</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {score}/{challenge.rounds.length} rounds secured
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Check every round to save your score and bank the assessment XP.
              </p>
            </div>

            <button
              type="button"
              disabled={!allChecked}
              onClick={() => {
                completeChallenge(
                  challenge.id,
                  Math.round((score / challenge.rounds.length) * 100),
                );
                setComplete(true);
              }}
              className={cn(
                "primary-button px-6 py-3 text-sm",
                !allChecked && "pointer-events-none opacity-40",
              )}
            >
              Complete assessment
            </button>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {complete ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#02050fcc]/80 px-4"
          >
            <motion.div
              initial={{ y: 20, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 14, scale: 0.98 }}
              className="panel-strong w-full max-w-2xl rounded-[2rem] p-8"
            >
              <div className="flex items-center gap-3 text-cyan-100">
                <Trophy className="h-5 w-5" />
                <p className="eyebrow text-cyan-100">Assessment complete</p>
              </div>
              <h3 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
                {challenge.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                You finished with {Math.round((score / challenge.rounds.length) * 100)}%
                accuracy and banked {challenge.xp} XP.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.2rem] bg-white/[0.03] p-4">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  <p className="mt-3 text-sm text-slate-300">XP earned</p>
                  <p className="mt-1 text-2xl font-semibold text-white">+{challenge.xp}</p>
                </div>
                <div className="rounded-[1.2rem] bg-white/[0.03] p-4">
                  <Trophy className="h-4 w-4 text-amber-300" />
                  <p className="mt-3 text-sm text-slate-300">Saved score</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {Math.round((score / challenge.rounds.length) * 100)}%
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/rewards" className="primary-button px-5 py-3 text-sm">
                  View achievements
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/academy" className="secondary-button px-5 py-3 text-sm">
                  Return to dashboard
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
