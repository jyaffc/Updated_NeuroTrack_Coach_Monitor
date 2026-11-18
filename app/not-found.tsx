import Link from "next/link";

import { Brand } from "@/components/neurotrack/brand";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07101a] px-4 text-white">
      <div className="w-full max-w-xl rounded-lg border border-white/10 bg-white/4 p-8 text-center shadow-[0_18px_60px_rgba(2,6,23,0.28)]">
        <div className="flex justify-center">
          <Brand compact />
        </div>
        <h1 className="mt-8 text-3xl font-semibold text-white">That athlete view is not available.</h1>
        <p className="mt-4 text-base leading-8 text-slate-300">
          The requested demo profile could not be found. Head back to the live dashboard and choose
          an athlete from the ranked list.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Return to dashboard
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-white/10 bg-white/6 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Overview page
          </Link>
        </div>
      </div>
    </main>
  );
}
