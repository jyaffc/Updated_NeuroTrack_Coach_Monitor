import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Signal, TrendingUp, Upload } from "lucide-react";

import { Brand } from "@/components/neurotrack/brand";
import { formatSessionDate, getSessionSummaryBundle } from "@/lib/neurotrack-data";

const heroImage =
  "https://images.pexels.com/photos/13907446/pexels-photo-13907446.jpeg?cs=srgb&dl=pexels-quyn-ph-m-255082234-13907446.jpg&fm=jpg";
const detailImage =
  "https://images.pexels.com/photos/13558754/pexels-photo-13558754.jpeg?cs=srgb&dl=pexels-david-orlando-baez-cunha-311815940-13558754.jpg&fm=jpg";

const overviewPoints = [
  {
    title: "Session monitoring",
    body: "Keep the current session readable in seconds, with the review queue already ranked.",
    icon: Signal,
  },
  {
    title: "Higher-confidence alerts",
    body: "Surface only the moments most likely to deserve video review or a lighter next block.",
    icon: TrendingUp,
  },
  {
    title: "Coach-facing reporting",
    body: "Export a short recap that keeps the language cautious, useful, and non-diagnostic.",
    icon: ShieldCheck,
  },
];

const workflow = [
  "Open the session answer first",
  "Scan flagged athletes and alerts",
  "Jump into one athlete only when needed",
  "Export the coach brief after the block",
];

const productRoutes = [
  {
    href: "/dashboard",
    title: "Live dashboard",
    body: "Ranked athletes, review queue, and cumulative load trend.",
  },
  {
    href: "/athletes/maya-chen",
    title: "Athlete detail",
    body: "Timeline, direction mix, and recent-session context for one player.",
  },
  {
    href: "/session-summary",
    title: "Session summary",
    body: "Presentation-ready recap for the team, the coach, or the class review.",
  },
  {
    href: "/intake",
    title: "Session intake",
    body: "Upload a fresh CSV or JSON export when you want to analyze new prototype data.",
  },
];

export default function LandingPage() {
  const summary = getSessionSummaryBundle();

  if (!summary) {
    return <main className="min-h-screen bg-[#07101a]" />;
  }

  return (
    <main className="min-h-screen bg-[#07101a] text-white">
      <section className="relative overflow-hidden">
        <Image
          src={heroImage}
          alt="Soccer players stretching during training"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover object-[center_22%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,11,19,0.95)_0%,rgba(6,11,19,0.86)_38%,rgba(6,11,19,0.66)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,11,19,0.16)_0%,rgba(6,11,19,0.76)_54%,#07101a_100%)]" />

        <div className="relative mx-auto max-w-[1440px] px-4 pt-6 pb-12 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Brand />
            <nav className="flex flex-wrap items-center gap-5 text-sm text-slate-300">
              <Link href="/dashboard" className="transition hover:text-white">
                Dashboard
              </Link>
              <Link href="/intake" className="transition hover:text-white">
                Intake
              </Link>
              <Link href="/session-summary" className="transition hover:text-white">
                Session summary
              </Link>
            </nav>
          </header>

          <div className="flex min-h-[76svh] items-end pb-8 pt-12">
            <div className="max-w-[760px] space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-cyan-200/85">
                  BE428 prototype
                </p>
                <h1 className="text-4xl font-semibold leading-[1.02] text-white md:text-[3.7rem]">
                  Cumulative head-impact exposure insights for safer coaching
                  decisions.
                </h1>
                <p className="max-w-[620px] text-lg leading-8 text-slate-200">
                  Coach-facing session context for collegiate soccer, built to
                  surface higher-confidence events, cumulative load, and who may
                  need review next.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/session-summary"
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  Open session summary
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/6 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Open dashboard
                </Link>
                <Link
                  href="/intake"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/6 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Analyze export
                  <Upload className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-3">
                <div className="border-l border-white/10 pl-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                    Flagged athletes
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {summary.totals.playersRecommended}
                  </p>
                </div>
                <div className="border-l border-white/10 pl-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                    High-confidence alerts
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {summary.totals.highConfidenceAlerts}
                  </p>
                </div>
                <div className="border-l border-white/10 pl-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                    Strongest event
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {summary.totals.strongestEvent} g
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300">
                Decision-support only. Pair with sideline observation and video
                review.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-8">
        <section className="grid gap-6 border-t border-white/8 py-14 lg:grid-cols-3">
          {overviewPoints.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="space-y-3 border-l border-white/10 pl-5">
                <Icon className="h-5 w-5 text-cyan-200" />
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="max-w-sm text-sm leading-7 text-slate-300">
                  {item.body}
                </p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-10 border-t border-white/8 py-14 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-cyan-200/85">
              Coach flow
            </p>
            <h2 className="text-3xl font-semibold text-white">
              Start with the session answer, then open detail only when needed.
            </h2>
            <p className="max-w-[560px] text-base leading-8 text-slate-300">
              The product works best when the first screen already tells the
              coach who needs a closer look. Athlete detail and intake stay
              nearby, but they no longer lead the story.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {workflow.map((step, index) => (
                <div key={step} className="border-l border-white/10 pl-4">
                  <p className="text-sm text-slate-500">0{index + 1}</p>
                  <p className="mt-2 text-base font-medium text-white">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/4">
            <Image
              src={detailImage}
              alt="Soccer drill setup with cones and a ball"
              width={1200}
              height={1200}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-[420px] w-full object-cover"
            />
          </div>
        </section>

        <section className="grid gap-10 border-t border-white/8 py-14 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-cyan-200/85">
              Why it matters
            </p>
            <h2 className="text-3xl font-semibold text-white">
              Cumulative load is the story, not a single alert in isolation.
            </h2>
            <p className="max-w-[560px] text-base leading-8 text-slate-300">
              NeuroTrack is built to help coaches weigh repeated exposure over a
              session, compare it with recent baseline, and make safer training
              decisions without drifting into diagnosis language.
            </p>
            <p className="text-sm leading-7 text-slate-400">
              Current demo session: {summary.team.name} |{" "}
              {formatSessionDate(summary.session.date)} | {summary.session.venue}
            </p>
          </div>

          <div className="space-y-3">
            {productRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="flex items-start justify-between gap-4 rounded-lg border border-white/8 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.06]"
              >
                <div>
                  <p className="text-base font-medium text-white">{route.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {route.body}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
