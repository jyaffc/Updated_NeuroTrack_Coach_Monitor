"use client";

import { cn } from "@/lib/utils";
import type { AvatarDefinition } from "@/lib/orbita-data";

type AvatarGlyphProps = {
  avatar: AvatarDefinition;
  className?: string;
  compact?: boolean;
};

const visorMap: Record<string, string> = {
  nova: "from-[#74ddff] to-[#8f82ff]",
  patch: "from-[#79ddb8] to-[#74ddff]",
  echo: "from-[#9bb0ff] to-[#74ddff]",
  mira: "from-[#ff8aa4] to-[#9e84ff]",
  orbit: "from-[#f2c56c] to-[#74ddff]",
  lumen: "from-[#74ddff] to-[#79ddb8]",
};

export function AvatarGlyph({
  avatar,
  className,
  compact = false,
}: AvatarGlyphProps) {
  const frame = compact ? "h-24 w-24" : "h-72 w-56";
  const scale = compact ? "scale-[0.55]" : "scale-100";

  return (
    <div
      className={cn(
        "relative isolate flex items-end justify-center overflow-hidden rounded-[1.8rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_34%),linear-gradient(180deg,#101b2d_0%,#0c1626_100%)]",
        frame,
        className,
      )}
    >
      <div
        className="avatar-glow absolute inset-x-[18%] bottom-4 h-10 rounded-full blur-2xl"
        style={{
          background: `linear-gradient(90deg, ${avatar.colors[0]}, ${avatar.colors[1]})`,
          opacity: 0.5,
        }}
      />
      <div className={cn("avatar-idle relative origin-bottom", scale)}>
        <div className="absolute left-1/2 top-[16.3rem] h-5 w-40 -translate-x-1/2 rounded-full bg-[#0a1323]" />
        <div className="absolute left-1/2 top-[15.5rem] h-10 w-32 -translate-x-1/2 rounded-full border border-white/8 bg-[linear-gradient(180deg,#18263d,#0e1726)]" />

        <div className="absolute left-1/2 top-[4.9rem] h-[8.6rem] w-[7.4rem] -translate-x-1/2 rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,#223450,#131f31)] shadow-[0_14px_30px_rgba(0,0,0,0.2)]" />
        <div className="absolute left-1/2 top-[7.2rem] h-[4.3rem] w-[4.8rem] -translate-x-1/2 rounded-[1.5rem] border border-white/8 bg-[#0f1828]" />

        <div className="absolute left-[4rem] top-[6.2rem] h-[4.8rem] w-[1.4rem] rounded-full bg-[linear-gradient(180deg,#243651,#111c2b)]" />
        <div className="absolute right-[4rem] top-[6.2rem] h-[4.8rem] w-[1.4rem] rounded-full bg-[linear-gradient(180deg,#243651,#111c2b)]" />
        <div className="absolute left-[3.2rem] top-[10.7rem] h-[5.6rem] w-[1.8rem] rounded-full bg-[linear-gradient(180deg,#243651,#101826)]" />
        <div className="absolute right-[3.2rem] top-[10.7rem] h-[5.6rem] w-[1.8rem] rounded-full bg-[linear-gradient(180deg,#243651,#101826)]" />
        <div className="absolute left-[2.8rem] top-[14.3rem] h-[1.8rem] w-[2.1rem] rounded-[0.8rem] border border-white/8 bg-[#0d1523]" />
        <div className="absolute right-[2.8rem] top-[14.3rem] h-[1.8rem] w-[2.1rem] rounded-[0.8rem] border border-white/8 bg-[#0d1523]" />

        <div className="relative mx-auto mt-4 h-[5.6rem] w-[5.6rem] rounded-[1.8rem] border border-white/12 bg-[linear-gradient(180deg,#243b59,#121e30)] shadow-[0_12px_24px_rgba(0,0,0,0.2)]">
          <div
            className={cn(
              "absolute inset-x-3 top-4 h-[1.85rem] rounded-full bg-gradient-to-r shadow-[0_0_20px_rgba(110,212,255,0.2)]",
              visorMap[avatar.id],
            )}
          />
          <div className="absolute left-1/2 top-[3.55rem] h-1.5 w-9 -translate-x-1/2 rounded-full bg-white/22" />
          <div className="absolute left-[1.05rem] top-3 h-1.5 w-1.5 rounded-full bg-white/25" />
          <div className="absolute right-[1.05rem] top-3 h-1.5 w-1.5 rounded-full bg-white/25" />
        </div>

        <div className="absolute left-1/2 top-[6.15rem] h-3 w-3 -translate-x-1/2 rounded-full bg-[#7ad7ff]/30 shadow-[0_0_14px_rgba(110,212,255,0.3)]" />
      </div>
    </div>
  );
}
