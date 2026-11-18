"use client";

import { Award, Shield, Sparkles, Trophy } from "lucide-react";

import { CredentialCard } from "@/components/credential-card";
import { useOrbita } from "@/components/orbita-provider";
import { getCredentialCountByKind } from "@/lib/orbita-progression";

export default function CredentialsPage() {
  const {
    credentialAwards,
    currentMasteryTier,
    lockedCredentialProgress,
    masterySnapshot,
    primaryNextCredential,
    profile,
  } = useOrbita();
  const counts = getCredentialCountByKind(profile);
  const statItems = [
    { label: "Micro badges", value: counts.microBadges, Icon: Award },
    { label: "Track certs", value: counts.trackCertificates, Icon: Shield },
    { label: "Specializations", value: counts.specializations, Icon: Sparkles },
    { label: "Capstones", value: counts.elite, Icon: Trophy },
  ];

  return (
    <div className="space-y-6">
      <section className="panel-strong rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="eyebrow">Credentials</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              Proof should come from performance
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              Orbita issues shareable credentials based on demonstrated skill:
              accuracy, streak, completion, challenge performance, and mastery.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statItems.map(({ label, value, Icon }) => (
                <div key={label} className="rounded-[1.2rem] bg-white/[0.03] p-4">
                  <Icon className="h-4 w-4 text-cyan-300" />
                  <p className="mt-3 text-sm text-slate-300">{label}</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel rounded-[1.6rem] p-5">
            <p className="eyebrow">Next credential</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {primaryNextCredential?.definition.title ?? "You are caught up"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {primaryNextCredential?.definition.requirementLabel ??
                "Keep training to unlock the next credential."}
            </p>
            <div className="progress-track mt-5">
              <div
                className="progress-bar"
                style={{ width: `${primaryNextCredential?.progressToUnlock ?? 100}%` }}
              />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="eyebrow">Mastery tier</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {currentMasteryTier}
                </p>
              </div>
              <div>
                <p className="eyebrow">Mastery score</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {Math.round(masterySnapshot.masteryScore)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="panel rounded-[1.9rem] p-6">
          <div className="border-b border-white/8 pb-5">
            <p className="eyebrow">Issued credentials</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Ready to share</h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {credentialAwards.length ? (
              credentialAwards.map((award) => (
                <CredentialCard
                  key={award.definition.id}
                  definition={award.definition}
                  progressToUnlock={100}
                  award={award}
                />
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300">
                You do not have an issued credential yet. Complete lessons, keep
                accuracy high, and clear assessments to start filling the ladder.
              </div>
            )}
          </div>
        </section>

        <section className="panel rounded-[1.9rem] p-6">
          <div className="border-b border-white/8 pb-5">
            <p className="eyebrow">Locked ladder</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              What you are climbing toward
            </h2>
          </div>

          <div className="mt-6 grid gap-4">
            {lockedCredentialProgress.slice(0, 5).map((item) => (
              <CredentialCard
                key={item.definition.id}
                definition={item.definition}
                progressToUnlock={item.progressToUnlock}
              />
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
