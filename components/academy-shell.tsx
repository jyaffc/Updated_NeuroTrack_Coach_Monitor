"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Shield, Target, Zap } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { useOrbita } from "@/components/orbita-provider";
import { getXpToNextLevel } from "@/lib/orbita-simulator";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/academy", label: "Dashboard" },
  { href: "/map", label: "Map" },
  { href: "/concepts", label: "Concepts" },
  { href: "/duels", label: "Duels" },
  { href: "/rewards", label: "Achievements" },
  { href: "/credentials", label: "Credentials" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

function isActiveRoute(pathname: string, href: string) {
  return (
    pathname === href ||
    (href === "/map" &&
      (pathname.startsWith("/lesson/") || pathname.startsWith("/challenge/"))) ||
    (href === "/concepts" && pathname.startsWith("/concepts/"))
  );
}

export function AcademyShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentLevel, currentMasteryTier, currentTrack, learningGoal, profile } = useOrbita();
  const xpState = getXpToNextLevel(profile.xp);

  return (
    <div className="page-shell md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-6 xl:grid-cols-[220px_1fr]">
        <aside className="panel rounded-[1.6rem] p-4 xl:sticky xl:top-4 xl:h-fit">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="logo-font text-base text-white">Orbita</p>
              <p className="mt-0.5 text-xs text-slate-400">Neural Academy</p>
            </div>
          </Link>

          <div className="mt-6 rounded-[1rem] bg-white/[0.03] p-4">
            <p className="eyebrow">Current track</p>
            <p className="mt-2 text-lg font-semibold text-white">{currentTrack.name}</p>
            <p className="mt-1 text-sm text-slate-300">{learningGoal.shortLabel}</p>
            <div className="progress-track mt-4">
              <div className="progress-bar" style={{ width: `${xpState.progress}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-300">
              {xpState.currentInLevel}/{xpState.required} XP to next level
            </p>
          </div>

          <nav className="mt-5 space-y-1">
            {navItems.map((item) => {
              const active = isActiveRoute(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-[0.95rem] px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-white text-slate-950"
                      : "text-slate-300 hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="space-y-6">
          <header className="panel rounded-[1.4rem] px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="eyebrow">Current route</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h1 className="page-title text-xl">{currentTrack.name}</h1>
                  <span className="text-sm text-slate-400">{currentLevel.label}</span>
                  <span className="text-sm text-slate-400">{learningGoal.shortLabel}</span>
                </div>
                <div className="mt-3 w-full max-w-sm">
                  <div className="progress-track">
                    <div className="progress-bar" style={{ width: `${xpState.progress}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {xpState.currentInLevel}/{xpState.required} XP to the next level
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="secondary-button px-4 py-2 text-sm">
                  <Zap className="h-4 w-4 text-cyan-300" />
                  XP {profile.xp}
                </div>
                <div className="secondary-button px-4 py-2 text-sm">
                  <Flame className="h-4 w-4 text-amber-300" />
                  {profile.streak} day streak
                </div>
                <div className="secondary-button px-4 py-2 text-sm">
                  <Target className="h-4 w-4 text-emerald-300" />
                  Goal {profile.dailyGoal}/day
                </div>
                <div className="secondary-button px-4 py-2 text-sm">
                  <Shield className="h-4 w-4 text-violet-300" />
                  {currentMasteryTier}
                </div>
              </div>
            </div>
          </header>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
