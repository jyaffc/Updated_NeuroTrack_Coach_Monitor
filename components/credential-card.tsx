"use client";

import Link from "next/link";
import { BadgeCheck, Lock, Share2 } from "lucide-react";

import type { CredentialAward, CredentialDefinition } from "@/lib/orbita-progression";
import { getCredentialMeta } from "@/lib/orbita-simulator";
import { cn } from "@/lib/utils";

type CredentialCardProps = {
  definition: CredentialDefinition;
  progressToUnlock: number;
  award?: CredentialAward;
};

const rarityLabel: Record<string, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export function CredentialCard({
  definition,
  progressToUnlock,
  award,
}: CredentialCardProps) {
  const unlocked = Boolean(award);
  const meta = getCredentialMeta(definition);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.7rem] border p-6",
        unlocked ? "panel border-transparent" : "border-white/8 bg-white/[0.025]",
      )}
    >
      {!unlocked ? (
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))]" />
      ) : null}

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] border"
            style={{
              borderColor: `${definition.accent}35`,
              background: `${definition.accent}14`,
              color: definition.accent,
              boxShadow: unlocked ? `0 0 28px ${definition.accent}20` : "none",
            }}
          >
            {unlocked ? <BadgeCheck className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </div>

          <div className="text-right">
            <p className="eyebrow">{meta.ladderLabel}</p>
            <p className="mt-1 text-sm text-slate-300">{rarityLabel[definition.rarity]}</p>
          </div>
        </div>

        <h2 className="mt-5 text-2xl font-semibold text-white">{definition.title}</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-slate-300">
            {meta.trackLabel}
          </span>
          <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-slate-300">
            {meta.levelLabel}
          </span>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-300">{definition.summary}</p>

        {award ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-[1.1rem] bg-white/[0.03] p-4">
              <p className="eyebrow">Credential ID</p>
              <p className="mt-2 text-sm font-medium text-white">{award.credentialId}</p>
              <p className="mt-4 text-sm text-slate-300">
                Issued {award.issuedAt}. Share URL: {award.verificationPath}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={award.verificationPath}
                className="primary-button px-4 py-3 text-sm"
              >
                Open credential
              </Link>
              <div className="secondary-button px-4 py-3 text-sm">
                <Share2 className="h-4 w-4" />
                LinkedIn-ready
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <div className="rounded-[1.1rem] bg-white/[0.03] p-4">
              <p className="eyebrow">Unlock requirement</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {definition.requirementLabel}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-300">Unlock progress</span>
              <span className="font-medium text-white">
                {Math.round(progressToUnlock)}%
              </span>
            </div>
            <div className="progress-track mt-3">
              <div
                className="progress-bar"
                style={{ width: `${Math.min(progressToUnlock, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
