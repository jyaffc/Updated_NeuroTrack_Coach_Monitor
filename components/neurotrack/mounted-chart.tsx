"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function MountedChart({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let frameA = 0;
    let frameB = 0;

    frameA = window.requestAnimationFrame(() => {
      frameB = window.requestAnimationFrame(() => {
        setMounted(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(frameA);
      window.cancelAnimationFrame(frameB);
    };
  }, []);

  return (
    <div className={cn("min-w-0 w-full", className)}>
      {mounted ? (
        children
      ) : (
        <div className="h-full w-full animate-pulse rounded-lg bg-white/4" />
      )}
    </div>
  );
}
