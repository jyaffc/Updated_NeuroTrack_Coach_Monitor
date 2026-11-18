import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Swords } from "lucide-react";

import { ChallengeBoard } from "@/components/challenge-board";
import { getChallengeById, getTrackById } from "@/lib/orbita-data";
import { getRecommendedConceptForChallenge } from "@/lib/orbita-simulator";

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await params;
  const challenge = getChallengeById(challengeId);

  if (!challenge) {
    notFound();
  }

  const track = getTrackById(challenge.trackId);
  const concept = getRecommendedConceptForChallenge(challenge.id);

  return (
    <div className="space-y-6">
      <section className="panel-strong rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="eyebrow">{track.name} assessment</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              {challenge.title}
            </h1>
            <p className="mt-3 text-lg text-slate-300">{challenge.subtitle}</p>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-300">
              {challenge.description}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="eyebrow">Rounds</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {challenge.rounds.length}
                </p>
              </div>
              <div>
                <p className="eyebrow">XP reward</p>
                <p className="mt-2 text-2xl font-semibold text-white">{challenge.xp}</p>
              </div>
              <div>
                <p className="eyebrow">Mode</p>
                <p className="mt-2 text-2xl font-semibold text-white">Applied check</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="panel rounded-[1.6rem] p-5">
              <p className="eyebrow">Concept reference</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {concept?.title ?? "Review the concept first"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {concept?.whyItMatters ??
                  "This assessment should reinforce the concept, not just score it."}
              </p>
              {concept ? (
                <Link
                  href={`/concepts/${concept.id}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-200"
                >
                  Open concept page
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            <div className="panel rounded-[1.6rem] p-5">
              <p className="eyebrow">Extra pressure</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Want the same quiz under live pressure? Open duel mode and challenge
                a friend on an equivalent pack.
              </p>
              <Link
                href="/duels"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-200"
              >
                Open duel mode
                <Swords className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ChallengeBoard challenge={challenge} />
    </div>
  );
}
