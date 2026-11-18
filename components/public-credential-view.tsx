"use client";

import { ShieldCheck, Sparkles } from "lucide-react";

import { CredentialActions } from "@/components/credential-actions";
import { useOrbita } from "@/components/orbita-provider";
import {
  buildVerificationUrl,
  getCredentialAwardById,
  ORBITA_ORGANIZATION,
} from "@/lib/orbita-progression";
import { getCredentialMeta } from "@/lib/orbita-simulator";

type PublicCredentialViewProps = {
  credentialId: string;
};

export function PublicCredentialView({
  credentialId,
}: PublicCredentialViewProps) {
  const { hydrated, profile } = useOrbita();
  const award = getCredentialAwardById(profile, credentialId);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  if (!hydrated) {
    return (
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-8">
        <div className="sim-panel rounded-[1.5rem] px-6 py-5 text-sm font-semibold text-white">
          Loading credential record...
        </div>
      </div>
    );
  }

  if (!award) {
    return (
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-8">
        <div className="sim-panel rounded-[2rem] p-8 text-center">
          <h1 className="sim-heading text-4xl">Credential not issued in this profile</h1>
          <p className="mt-3 text-sm leading-7 text-white/68">
            This verification page is live, but the selected credential has not been earned in the
            current academy profile yet.
          </p>
        </div>
      </div>
    );
  }

  const publicUrl = buildVerificationUrl(award.verificationPath, origin);
  const meta = getCredentialMeta(award.definition);

  return (
    <main className="px-4 py-5 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="sim-panel-strong rounded-[2rem] px-6 py-6 md:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="sim-label">Public credential page</p>
              <h1 className="sim-heading mt-2 text-5xl">{award.definition.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-white/72">
                {award.definition.summary}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-white/8 bg-black/20 px-5 py-4">
              <p className="sim-label">Issued by</p>
              <p className="mt-2 font-display text-2xl text-white">{ORBITA_ORGANIZATION}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="sim-panel rounded-[1.8rem] p-6">
            <p className="sim-label">Verified credential</p>
            <h2 className="sim-heading mt-2 text-4xl">{award.linkedInFields.credentialName}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ["Track", meta.trackLabel],
                ["Level", meta.levelLabel],
                ["Credential ID", award.credentialId],
                ["Issue date", award.issuedAt],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-[1.1rem] border border-white/8 bg-black/20 p-4">
                  <p className="sim-label">{String(label)}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{String(value)}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[1.2rem] border border-white/8 bg-black/20 p-4">
              <p className="sim-label">Shareable URL</p>
              <p className="mt-2 break-all text-sm leading-7 text-white/76">{publicUrl}</p>
            </div>
            <div className="mt-5 rounded-[1.2rem] border border-emerald-300/18 bg-emerald-300/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
                <ShieldCheck className="h-4 w-4" />
                Verified in platform
              </div>
              <p className="mt-2 text-sm leading-7 text-white/74">
                This award reflects measured progress, accuracy, streak discipline, and assessment
                performance rather than passive time spent.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="sim-panel rounded-[1.8rem] p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <div>
                  <p className="sim-label">LinkedIn-ready format</p>
                  <h2 className="sim-heading mt-2 text-3xl">Copy credential fields</h2>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/68">
                Orbita packages the exact fields a learner would need for LinkedIn Licenses &
                Certifications.
              </p>
              <div className="mt-5">
                <CredentialActions
                  credentialName={award.linkedInFields.credentialName}
                  organization={award.linkedInFields.issuingOrganization}
                  issueDate={award.linkedInFields.issueDate}
                  credentialId={award.linkedInFields.credentialId}
                  credentialUrl={publicUrl}
                />
              </div>
            </div>

            <div className="sim-panel rounded-[1.8rem] p-6">
              <p className="sim-label">Share line</p>
              <h2 className="sim-heading mt-2 text-3xl">{award.definition.shareLine}</h2>
              <p className="mt-4 text-sm leading-7 text-white/68">
                Designed to feel collectible, premium, and clearly tied to in-platform proof.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
