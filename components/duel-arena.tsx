"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock3, Shield, Swords, TimerReset, Trophy, Zap } from "lucide-react";

import { AvatarGlyph } from "@/components/avatar-glyph";
import { QuestionDebrief } from "@/components/question-debrief";
import { useOrbita } from "@/components/orbita-provider";
import { getAvatarById, getChallengeForTrackLevel } from "@/lib/orbita-data";
import {
  academyFriends,
  getConceptById,
  getDuelPack,
  getFriendById,
} from "@/lib/orbita-simulator";
import { cn } from "@/lib/utils";

type DuelPhase = "lobby" | "countdown" | "live" | "complete";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function isQuestionCorrect(answer: string | undefined, correctAnswer: string) {
  if (!answer) {
    return false;
  }

  return normalize(answer) === normalize(correctAnswer);
}

function projectedFriendScore(friendId: string, questionIndex: number) {
  const pattern: Record<string, number[]> = {
    rhea: [1, 2, 2, 3],
    taro: [1, 1, 2, 3],
    selene: [1, 2, 3, 3],
    isaac: [0, 1, 2, 2],
  };

  return pattern[friendId]?.[questionIndex] ?? 0;
}

export function DuelArena() {
  const { completeChallenge, currentAvatar, currentLevel, currentTrack } = useOrbita();
  const pack = useMemo(() => getDuelPack(currentTrack.id), [currentTrack.id]);
  const [selectedFriendId, setSelectedFriendId] = useState(academyFriends[0].id);
  const [phase, setPhase] = useState<DuelPhase>("lobby");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(pack.timerSeconds);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [practiceQuestionId, setPracticeQuestionId] = useState<string | null>(null);

  const activeFriend = getFriendById(selectedFriendId);
  const friendAvatar = getAvatarById(activeFriend.avatarId);
  const currentQuestion = pack.questions[questionIndex];
  const currentConcept = getConceptById(currentQuestion.conceptId);
  const currentAnswer = answers[currentQuestion.id];
  const checkedCurrent = checked[currentQuestion.id];
  const correctCurrent = isQuestionCorrect(currentAnswer, currentQuestion.answer);
  const userScore = pack.questions.reduce(
    (sum, question) =>
      sum +
      (checked[question.id] && isQuestionCorrect(answers[question.id], question.answer) ? 1 : 0),
    0,
  );
  const friendScore = projectedFriendScore(
    selectedFriendId,
    phase === "complete" ? pack.questions.length - 1 : questionIndex,
  );

  useEffect(() => {
    if (phase !== "countdown") {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setPhase("live");
          return 0;
        }

        return current - 1;
      });
    }, 700);

    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "live") {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setPhase("complete");
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase]);

  function resetDuel() {
    setPhase("lobby");
    setCountdown(3);
    setTimeLeft(pack.timerSeconds);
    setQuestionIndex(0);
    setAnswers({});
    setChecked({});
    setPracticeQuestionId(null);
  }

  function finishDuel() {
    const linkedChallenge = getChallengeForTrackLevel(currentTrack.id, currentLevel.id);

    if (linkedChallenge) {
      completeChallenge(
        linkedChallenge.id,
        Math.round((userScore / pack.questions.length) * 100),
      );
    }

    setPhase("complete");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[310px_1fr]">
      <aside className="panel rounded-[1.7rem] p-5">
        <div>
          <p className="eyebrow">Rivals</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Choose an opponent</h2>
        </div>

        <div className="mt-5 space-y-3">
          {academyFriends.map((friend) => (
            <button
              key={friend.id}
              type="button"
              onClick={() => {
                setSelectedFriendId(friend.id);
                resetDuel();
              }}
              className={cn(
                "w-full rounded-[1.2rem] border p-4 text-left transition",
                selectedFriendId === friend.id
                  ? "border-cyan-300/28 bg-cyan-300/8"
                  : "border-white/8 bg-white/[0.02] hover:border-white/14",
              )}
            >
              <div className="flex items-center gap-3">
                <AvatarGlyph avatar={getAvatarById(friend.avatarId)} compact />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-white">{friend.callsign}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                        friend.status === "online"
                          ? "bg-emerald-400/12 text-emerald-200"
                          : friend.status === "queueing"
                            ? "bg-amber-400/12 text-amber-200"
                            : "bg-white/8 text-slate-400",
                      )}
                    >
                      {friend.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{friend.displayName}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className="eyebrow">Rating</p>
                  <p className="mt-1 text-sm font-semibold text-white">{friend.duelRating}</p>
                </div>
                <div>
                  <p className="eyebrow">Wins</p>
                  <p className="mt-1 text-sm font-semibold text-white">{friend.winRate}%</p>
                </div>
                <div>
                  <p className="eyebrow">Track</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {friend.trackId.toUpperCase()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-6">
        {phase === "lobby" ? (
          <section className="panel-strong overflow-hidden rounded-[2rem] p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div>
                <p className="eyebrow">Skill duel</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                  {pack.title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
                  {pack.description} Same questions, same timer, and a clean result
                  screen when the match ends.
                </p>

                <div className="mt-8 grid gap-5 border-t border-white/8 pt-6 sm:grid-cols-3">
                  <div>
                    <p className="eyebrow">Timer</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {pack.timerSeconds}s
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Questions</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {pack.questions.length}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">XP reward</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{pack.rewardXp}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCountdown(3);
                    setTimeLeft(pack.timerSeconds);
                    setPhase("countdown");
                  }}
                  className="primary-button mt-8 px-5 py-3 text-sm"
                >
                  Start duel
                  <Zap className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-[1.7rem] border border-white/8 bg-white/[0.03] p-5">
                <p className="eyebrow">Matchup</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div className="text-center">
                    <AvatarGlyph avatar={currentAvatar} className="mx-auto h-48 w-36" />
                    <p className="mt-3 text-lg font-semibold text-white">You</p>
                  </div>
                  <div className="text-center">
                    <p className="logo-font text-xl text-cyan-200">VS</p>
                  </div>
                  <div className="text-center">
                    <AvatarGlyph avatar={friendAvatar} className="mx-auto h-48 w-36" />
                    <p className="mt-3 text-lg font-semibold text-white">
                      {activeFriend.callsign}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/8 pt-4">
                  <p className="text-sm leading-7 text-slate-300">
                    {activeFriend.specialty}. Signature move: {activeFriend.signature}.{" "}
                    {activeFriend.recentResult}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {phase === "countdown" ? (
          <section className="panel-strong flex min-h-[480px] items-center justify-center rounded-[2rem] p-8">
            <div className="text-center">
              <p className="eyebrow">Match starting</p>
              <p className="mt-5 logo-font text-7xl text-cyan-200">{countdown}</p>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                {activeFriend.callsign} is locked in. The clock starts immediately.
              </p>
            </div>
          </section>
        ) : null}

        {phase === "live" ? (
          <>
            <section className="panel rounded-[1.7rem] p-5">
              <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                <div className="flex items-center gap-4">
                  <AvatarGlyph avatar={currentAvatar} compact />
                  <div>
                    <p className="eyebrow">You</p>
                    <p className="text-2xl font-semibold text-white">{userScore}</p>
                  </div>
                </div>

                <div className="rounded-full bg-white/5 px-5 py-3 text-center">
                  <p className="eyebrow">Time left</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{timeLeft}s</p>
                </div>

                <div className="flex items-center justify-start gap-4 lg:justify-end">
                  <div className="text-right">
                    <p className="eyebrow">{activeFriend.callsign}</p>
                    <p className="text-2xl font-semibold text-white">{friendScore}</p>
                  </div>
                  <AvatarGlyph avatar={friendAvatar} compact />
                </div>
              </div>

              <div className="progress-track mt-5">
                <div
                  className="progress-bar"
                  style={{ width: `${((questionIndex + 1) / pack.questions.length) * 100}%` }}
                />
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <motion.section
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="panel-strong rounded-[1.8rem] p-6"
              >
                <div className="border-b border-white/8 pb-5">
                  <p className="eyebrow">
                    Question {questionIndex + 1} of {pack.questions.length}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">
                    {currentQuestion.prompt}
                  </h2>
                </div>

                {currentQuestion.snippet ? (
                  <pre className="mt-6 overflow-x-auto rounded-[1.2rem] border border-white/8 bg-[#06101b] p-4 text-sm text-cyan-50">
                    <code>{currentQuestion.snippet}</code>
                  </pre>
                ) : null}

                {currentQuestion.options?.length ? (
                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setAnswers((current) => ({
                            ...current,
                            [currentQuestion.id]: option,
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
                ) : (
                  <input
                    value={currentAnswer ?? ""}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [currentQuestion.id]: event.target.value,
                      }))
                    }
                    placeholder="Type your answer"
                    className="mt-6 w-full rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  />
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setChecked((current) => ({
                        ...current,
                        [currentQuestion.id]: true,
                      }))
                    }
                    className="primary-button px-5 py-3 text-sm"
                  >
                    Lock answer
                  </button>

                  <button
                    type="button"
                    disabled={!checkedCurrent}
                    onClick={() => {
                      if (questionIndex === pack.questions.length - 1) {
                        finishDuel();
                        return;
                      }

                      setPracticeQuestionId(null);
                      setQuestionIndex((current) => current + 1);
                    }}
                    className={cn(
                      "secondary-button px-5 py-3 text-sm",
                      !checkedCurrent && "pointer-events-none opacity-40",
                    )}
                  >
                    {questionIndex === pack.questions.length - 1 ? "Finish duel" : "Next question"}
                  </button>
                </div>

                {checkedCurrent ? (
                  <>
                    <div
                      className={cn(
                        "mt-5 rounded-[1rem] px-4 py-3 text-sm font-medium",
                        correctCurrent
                          ? "bg-emerald-400/12 text-emerald-200"
                          : "bg-amber-400/12 text-amber-200",
                      )}
                    >
                      {correctCurrent
                        ? "Answer locked. Review the breakdown, then keep going."
                        : "Missed. Review the breakdown before the next question."}
                    </div>

                    <QuestionDebrief
                      insight={{
                        conceptId: currentQuestion.conceptId,
                        conceptTitle: currentConcept?.title ?? "Concept",
                        conceptPath: `/concepts/${currentQuestion.conceptId}`,
                        conceptBeingTested:
                          currentConcept?.deck ?? currentQuestion.explanation,
                        correctAnswer: currentQuestion.answer,
                        whyCorrect: currentQuestion.explanation,
                        whyOthersAreWrong:
                          currentQuestion.options
                            ?.filter((option) => option !== currentQuestion.answer)
                            .map(
                              (option) =>
                                `${option} is close on the surface, but it misses the exact rule this duel question is testing.`,
                            ) ?? [
                            "A different answer would break the logic the question is checking.",
                          ],
                        difficultyLabel:
                          currentQuestion.difficulty.charAt(0).toUpperCase() +
                          currentQuestion.difficulty.slice(1),
                        commonMistakes: currentQuestion.commonMistakes,
                        mentalShortcut: currentQuestion.mentalShortcut,
                        practicePrompt:
                          currentConcept?.practicePrompt ??
                          "Try another question that tests the same idea under time pressure.",
                      }}
                      correct={correctCurrent}
                      onPractice={() => setPracticeQuestionId(currentQuestion.id)}
                    />

                    {practiceQuestionId === currentQuestion.id ? (
                      <div className="mt-4 rounded-[1rem] border border-violet-300/14 bg-violet-300/8 p-4 text-sm leading-7 text-violet-50">
                        Practice prompt:{" "}
                        {currentConcept?.practicePrompt ??
                          "Explain the same concept in your own words, then answer a new example."}
                      </div>
                    ) : null}
                  </>
                ) : null}
              </motion.section>

              <aside className="space-y-4">
                <section className="panel rounded-[1.6rem] p-5">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-cyan-300" />
                    <p className="eyebrow">Match state</p>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="eyebrow">Timer</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{timeLeft}s</p>
                    </div>
                    <div>
                      <p className="eyebrow">Score pressure</p>
                      <p className="mt-1 text-sm leading-7 text-slate-300">
                        {activeFriend.callsign} is projected to finish on {friendScore}. A
                        clean streak here is worth {pack.rewardXp} XP.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="panel rounded-[1.6rem] p-5">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-300" />
                    <p className="eyebrow">Question focus</p>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    {currentConcept?.title ?? "Concept"}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {currentConcept?.deck ?? currentQuestion.explanation}
                  </p>
                </section>
              </aside>
            </section>
          </>
        ) : null}

        {phase === "complete" ? (
          <section className="panel-strong rounded-[2rem] p-6 md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-cyan-100">
                  <Trophy className="h-5 w-5" />
                  <p className="eyebrow text-cyan-100">Result</p>
                </div>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
                  {userScore >= friendScore ? "Victory secured" : "Rematch recommended"}
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-300">
                  {userScore >= friendScore
                    ? `You beat ${activeFriend.callsign} and banked ${pack.rewardXp} XP.`
                    : `${activeFriend.callsign} finished ahead this time. Your full breakdown is still saved, and the next run can start immediately.`}
                </p>

                <div className="mt-8 grid gap-5 border-t border-white/8 pt-6 sm:grid-cols-3">
                  <div>
                    <p className="eyebrow">Your score</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{userScore}</p>
                  </div>
                  <div>
                    <p className="eyebrow">{activeFriend.callsign}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{friendScore}</p>
                  </div>
                  <div>
                    <p className="eyebrow">XP reward</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {userScore >= friendScore ? `+${pack.rewardXp}` : "0"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="panel rounded-[1.6rem] p-5">
                <p className="eyebrow">Next move</p>
                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={resetDuel}
                    className="secondary-button w-full justify-center px-4 py-3 text-sm"
                  >
                    <TimerReset className="h-4 w-4" />
                    Rematch
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFriendId(
                        academyFriends.find((friend) => friend.id !== selectedFriendId)?.id ??
                          selectedFriendId,
                      );
                      resetDuel();
                    }}
                    className="secondary-button w-full justify-center px-4 py-3 text-sm"
                  >
                    <Swords className="h-4 w-4" />
                    Another rival
                  </button>
                </div>

                <div className="mt-5 border-t border-white/8 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AvatarGlyph avatar={currentAvatar} compact />
                      <div>
                        <p className="eyebrow">You</p>
                        <p className="text-sm text-white">{userScore} points</p>
                      </div>
                    </div>
                    <p className="logo-font text-lg text-cyan-200">VS</p>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="eyebrow">{activeFriend.callsign}</p>
                        <p className="text-sm text-white">{friendScore} points</p>
                      </div>
                      <AvatarGlyph avatar={friendAvatar} compact />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
