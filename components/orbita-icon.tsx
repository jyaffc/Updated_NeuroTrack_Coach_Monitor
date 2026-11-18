"use client";

import type { LucideProps } from "lucide-react";
import {
  BrainCircuit,
  Braces,
  Cpu,
  Database,
  Palette,
  Sparkles,
  type LucideIcon,
  Zap,
} from "lucide-react";

import type { IconKey } from "@/lib/orbita-data";

const icons: Record<IconKey, LucideIcon> = {
  ai: BrainCircuit,
  cpp: Cpu,
  html: Palette,
  javascript: Zap,
  python: Sparkles,
  sql: Database,
  track: Braces,
};

type OrbitaIconProps = LucideProps & {
  name: IconKey;
};

export function OrbitaIcon({ name, ...props }: OrbitaIconProps) {
  const Icon = icons[name];

  return <Icon {...props} />;
}
