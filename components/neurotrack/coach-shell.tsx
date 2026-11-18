"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Shield, Upload } from "lucide-react";

import { Brand } from "@/components/neurotrack/brand";
import { cn } from "@/lib/utils";

const navigation = [
  {
    href: "/",
    label: "Overview",
    icon: Shield,
    match: (pathname: string) => pathname === "/",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (pathname: string) =>
      pathname.startsWith("/dashboard") || pathname.startsWith("/athletes"),
  },
  {
    href: "/intake",
    label: "Intake",
    icon: Upload,
    match: (pathname: string) => pathname.startsWith("/intake"),
  },
  {
    href: "/session-summary",
    label: "Session summary",
    icon: FileText,
    match: (pathname: string) => pathname.startsWith("/session-summary"),
  },
];

export function CoachShell({
  eyebrow,
  title,
  description,
  headerActions,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  headerActions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07101a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_34%),linear-gradient(180deg,#08111c_0%,#06101a_46%,#040b13_100%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-white/6 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:gap-10">
            <Brand />
            <nav className="flex flex-wrap gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = item.match(pathname);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
                      active
                        ? "border-cyan-300/18 bg-cyan-300/8 text-cyan-50"
                        : "border-white/6 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="max-w-xl space-y-1 lg:text-right">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-cyan-200/80">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold text-white">{title}</h1>
            <p className="text-sm leading-6 text-slate-300/90">{description}</p>
          </div>
        </header>

        {headerActions ? <div className="mt-5">{headerActions}</div> : null}

        <div className="mt-6 min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
