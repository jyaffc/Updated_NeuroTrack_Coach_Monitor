"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BrainCircuit, MoveVertical, Sparkles, Star } from "lucide-react";

import { QuestionDebrief } from "@/components/question-debrief";
import { useOrbita } from "@/components/orbita-provider";
import type { ExerciseDefinition, LessonDefinition } from "@/lib/orbita-data";
import { buildExerciseInsight } from "@/lib/orbita-simulator";
import { cn } from "@/lib/utils";

type LessonPlayerProps = {
  lesson: LessonDefinition;
};

type ExerciseAnswer = string | Record<string, string> | string[];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function evaluateExercise(
  exercise: ExerciseDefinition,
  answer: ExerciseAnswer | undefined,
) {
  if (!answer) {
    return false;
  }

  if (exercise.type === "multiple-choice" || exercise.type === "output") {
    return answer === exercise.answer;
  }

  if (exercise.type === "fill-blank") {
    return normalize(String(answer)) === normalize(exercise.answer);
  }

  if (exercise.type === "reorder") {
    return Array.isArray(answer) && JSON.stringify(answer) === JSON.stringify(exercise.answer);
  }

  if (typeof answer !== "object" || Array.isArray(answer)) {
    return false;
  }

  return exercise.pairs.every(
    (pair) => normalize(answer[pair.left] ?? "") === normalize(pair.right),
  );
}

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const { completeLesson } = useOrbita();
  const [answers, setAnswers] = useState<Record<string, ExerciseAnswer>>(() =>
    Object.fromEntries(
      lesson.exercises
        .filter((exercise) => exercise.type === "reorder")
        .map((exercise) => [exercise.id, [...exercise.tokens]]),
    ),
  );
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showReward, setShowReward] = useState(false);

  const currentExercise = lesson.exercises[activeIndex];
  const insight = buildExerciseInsight(lesson, currentExercise);
  const currentAnswer = answers[currentExercise.id];
  const currentChecked = checked[currentExercise.id];
  const currentCorrect = evaluateExercise(currentExercise, currentAnswer);
  const checkedCount = lesson.exercises.filter((exercise) => checked[exercise.id]).length;
  const correctCount = lesson.exercises.filter(
    (exercise) => checked[exercise.id] && evaluateExercise(exercise, answers[exercise.id]),
  ).length;
  const allChecked = checkedCount === lesson.exercises.length;

  const updateReorder = (index: number, direction: -1 | 1) => {
    setAnswers((current) => {
      const order = Array.isArray(current[currentExercise.id])
        ? [...(current[currentExercise.id] as string[])]
        : [];
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= order.length) {
        return current;
      }

      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];

      return {
        ...current,
        [currentExercise.id]: order,
      };
    });
  };

  const nextLabel =
    activeIndex === lesson.exercises.length - 1 ? "Review summary" : "Next exercise";

  return (
    <>
      <div className="space-y-6">
        <section className="panel rounded-[1.6rem] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow">Lesson progress</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Exercise {activeIndex + 1} of {lesson.exercises.length}
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Work one prompt at a time, then read the explanation before moving on.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="eyebrow">Checked</p>
                <p className="mt-2 text-2xl font-semibold text-white">{checkedCount}</p>
              </div>
              <div>
                <p className="eyebrow">Correct</p>
                <p className="mt-2 text-2xl font-semibold text-white">{correctCount}</p>
              </div>
              <div>
                <p className="eyebrow">XP reward</p>
                <p className="mt-2 text-2xl font-semibold text-white">{lesson.xp}</p>
              </div>
            </div>
          </div>

          <div className="progress-track mt-5">
            <div
              className="progress-bar"
              style={{ width: `${((activeIndex + 1) / lesson.exercises.length) * 100}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {lesson.exercises.map((exercise, index) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition",
                  activeIndex === index
                    ? "bg-white text-slate-950"
                    : checked[exercise.id]
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
            key={currentExercise.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel-strong rounded-[1.8rem] p-6"
          >
            <div className="border-b border-white/8 pb-5">
              <p className="eyebrow">Current exercise</p>
              <h3 className="mt-2 text-3xl font-semibold text-white">
                {currentExercise.prompt}
              </h3>
            </div>

            {(currentExercise.type === "multiple-choice" ||
              currentExercise.type === "output") && (
              <div className="mt-6 space-y-4">
                {currentExercise.type === "output" ? (
                  <pre className="overflow-x-auto rounded-[1.2rem] border border-white/8 bg-[#06101b] p-4 text-sm text-cyan-50">
                    <code>{currentExercise.code}</code>
                  </pre>
                ) : null}
                <div className="grid gap-3 md:grid-cols-2">
                  {currentExercise.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setAnswers((current) => ({
                          ...current,
                          [currentExercise.id]: option,
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
              </div>
            )}

            {currentExercise.type === "fill-blank" && (
              <div className="mt-6 space-y-4">
                <pre className="overflow-x-auto rounded-[1.2rem] border border-white/8 bg-[#06101b] p-4 text-sm text-cyan-50">
                  <code>{currentExercise.snippet}</code>
                </pre>
                <label className="block">
                  <span className="eyebrow">Fill the blank</span>
                  <input
                    value={String(currentAnswer ?? "")}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [currentExercise.id]: event.target.value,
                      }))
                    }
                    placeholder={currentExercise.hint}
                    className="mt-3 w-full rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  />
                </label>
                <p className="text-sm text-slate-300">Hint: {currentExercise.hint}</p>
              </div>
            )}

            {currentExercise.type === "match" && (
              <div className="mt-6 grid gap-3">
                {currentExercise.pairs.map((pair) => (
                  <label
                    key={pair.left}
                    className="grid gap-3 rounded-[1rem] border border-white/8 bg-white/[0.02] p-4 md:grid-cols-[1fr_220px]"
                  >
                    <span className="text-sm font-medium text-white">{pair.left}</span>
                    <select
                      value={
                        typeof currentAnswer === "object" && !Array.isArray(currentAnswer)
                          ? (currentAnswer as Record<string, string>)[pair.left] ?? ""
                          : ""
                      }
                      onChange={(event) =>
                        setAnswers((current) => ({
                          ...current,
                          [currentExercise.id]: {
                            ...(typeof current[currentExercise.id] === "object" &&
                            !Array.isArray(current[currentExercise.id])
                              ? (current[currentExercise.id] as Record<string, string>)
                              : {}),
                            [pair.left]: event.target.value,
                          },
                        }))
                      }
                      className="rounded-[0.9rem] border border-white/10 bg-[#06101b] px-3 py-2 text-sm text-white outline-none"
                    >
                      <option value="">Choose a match</option>
                      {currentExercise.pairs.map((option) => (
                        <option key={option.right} value={option.right}>
                          {option.right}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            )}

            {currentExercise.type === "reorder" && (
              <div className="mt-6 grid gap-3">
                {(currentAnswer as string[]).map((token, itemIndex) => (
                  <div
                    key={`${token}-${itemIndex}`}
                    className="flex items-center justify-between gap-4 rounded-[1rem] border border-white/8 bg-white/[0.02] px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-slate-300">
                        {itemIndex + 1}
                      </span>
                      <span className="text-sm text-slate-200">{token}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateReorder(itemIndex, -1)}
                        className="secondary-button px-3 py-2 text-xs"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => updateReorder(itemIndex, 1)}
                        className="secondary-button px-3 py-2 text-xs"
                      >
                        Down
                      </button>
                    </div>
                  </div>
                ))}
                <p className="flex items-center gap-2 text-sm text-slate-300">
                  <MoveVertical className="h-4 w-4" />
                  Arrange the steps in the order that makes the logic work.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setChecked((current) => ({
                    ...current,
                    [currentExercise.id]: true,
                  }))
                }
                className="primary-button px-5 py-3 text-sm"
              >
                Check answer
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
                disabled={!currentChecked}
                onClick={() =>
                  setActiveIndex((current) =>
                    Math.min(lesson.exercises.length - 1, current + 1),
                  )
                }
                className={cn(
                  "secondary-button px-5 py-3 text-sm",
                  !currentChecked && "pointer-events-none opacity-40",
                )}
              >
                {nextLabel}
              </button>
            </div>

            {currentChecked ? (
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
                    ? "Correct. Read the breakdown, then move on."
                    : "Not quite. Read the breakdown, then try a similar prompt."}
                </div>

                <QuestionDebrief
                  insight={insight}
                  correct={currentCorrect}
                  onPractice={() => setPracticeId(currentExercise.id)}
                />

                {practiceId === currentExercise.id ? (
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
                <p className="eyebrow">What this tests</p>
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
                  {currentExercise.type.replace("-", " ")}
                </span>
              </div>
              <Link
                href={insight.conceptPath}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-200"
              >
                Open concept page
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            <section className="panel rounded-[1.6rem] p-5">
              <p className="eyebrow">Lesson focus</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{lesson.objective}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{lesson.intro}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <p className="eyebrow">Duration</p>
                  <p className="mt-2 text-xl font-semibold text-white">{lesson.duration}</p>
                </div>
                <div>
                  <p className="eyebrow">Completion reward</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {lesson.rewardLabel}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </section>

        <section className="panel rounded-[1.6rem] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow">Lesson summary</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {correctCount}/{lesson.exercises.length} correct so far
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Finish checking every exercise to bank XP and record your accuracy.
              </p>
            </div>

            <button
              type="button"
              disabled={!allChecked}
              onClick={() => {
                completeLesson(
                  lesson.id,
                  lesson.xp,
                  Math.round((correctCount / lesson.exercises.length) * 100),
                );
                setShowReward(true);
              }}
              className={cn(
                "primary-button px-6 py-3 text-sm",
                !allChecked && "pointer-events-none opacity-40",
              )}
            >
              Complete lesson
            </button>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showReward ? (
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
                <Sparkles className="h-5 w-5" />
                <p className="eyebrow text-cyan-100">Lesson complete</p>
              </div>
              <h3 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
                {lesson.rewardLabel}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                You banked {lesson.xp} XP and completed this lesson with{" "}
                {Math.round((correctCount / lesson.exercises.length) * 100)}% accuracy.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.2rem] bg-white/[0.03] p-4">
                  <Star className="h-4 w-4 text-amber-300" />
                  <p className="mt-3 text-sm text-slate-300">XP earned</p>
                  <p className="mt-1 text-2xl font-semibold text-white">+{lesson.xp}</p>
                </div>
                <div className="rounded-[1.2rem] bg-white/[0.03] p-4">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  <p className="mt-3 text-sm text-slate-300">Accuracy saved</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {Math.round((correctCount / lesson.exercises.length) * 100)}%
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/challenge/${lesson.challengeId}`} className="primary-button px-5 py-3 text-sm">
                  Open challenge
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
