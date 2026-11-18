import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BrainCircuit } from "lucide-react";

import { LessonPlayer } from "@/components/lesson-player";
import { getLessonById, getTrackById } from "@/lib/orbita-data";
import { getRecommendedConceptForLesson } from "@/lib/orbita-simulator";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    notFound();
  }

  const track = getTrackById(lesson.trackId);
  const concept = getRecommendedConceptForLesson(lesson.id);

  return (
    <div className="space-y-6">
      <section className="panel-strong rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="eyebrow">{track.name} lesson</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              {lesson.title}
            </h1>
            <p className="mt-3 text-lg text-slate-300">{lesson.subtitle}</p>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-300">
              {lesson.intro}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="eyebrow">Duration</p>
                <p className="mt-2 text-2xl font-semibold text-white">{lesson.duration}</p>
              </div>
              <div>
                <p className="eyebrow">XP reward</p>
                <p className="mt-2 text-2xl font-semibold text-white">{lesson.xp}</p>
              </div>
              <div>
                <p className="eyebrow">Outcome</p>
                <p className="mt-2 text-2xl font-semibold text-white">{lesson.rewardLabel}</p>
              </div>
            </div>
          </div>

          <div className="panel rounded-[1.6rem] p-5">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-cyan-300" />
              <p className="eyebrow">Concept preview</p>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {concept?.title ?? "Review the concept first"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {concept?.simpleExplanation ?? lesson.conceptCard}
            </p>

            <div className="mt-5 border-t border-white/8 pt-4">
              <p className="eyebrow">Lesson objective</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">{lesson.objective}</p>
            </div>

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
        </div>
      </section>

      <LessonPlayer lesson={lesson} />
    </div>
  );
}
