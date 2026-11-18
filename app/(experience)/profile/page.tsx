"use client";

import { Flame, Shield, Star, UserRound } from "lucide-react";

import { AvatarGlyph } from "@/components/avatar-glyph";
import { useOrbita } from "@/components/orbita-provider";
import { academyFriends } from "@/lib/orbita-simulator";

export default function ProfilePage() {
  const {
    currentAvatar,
    currentLevel,
    currentMasteryTier,
    currentTrack,
    learningGoal,
    masterySnapshot,
    profile,
  } = useOrbita();
  const statItems = [
    { label: "XP", value: profile.xp, Icon: Star },
    { label: "Streak", value: profile.streak, Icon: Flame },
    { label: "Tier", value: currentMasteryTier, Icon: Shield },
    { label: "Level", value: currentLevel.label, Icon: UserRound },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
      <section className="sim-panel-strong rounded-[2rem] p-6">
        <p className="sim-label">Operative profile</p>
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center">
          <AvatarGlyph avatar={currentAvatar} className="h-72 w-56" />
          <div>
            <h1 className="sim-heading text-5xl">{currentAvatar.name}</h1>
            <p className="mt-2 text-base text-white/62">{currentAvatar.role}</p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">{currentAvatar.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {statItems.map(({ label, value, Icon }) => (
                <div key={label} className="sim-stat">
                  <Icon className="h-4 w-4 text-cyan-300" />
                  <p className="sim-stat-label">{label}</p>
                  <p className="sim-stat-value">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <div className="sim-panel rounded-[1.8rem] p-6">
          <p className="sim-label">Current build</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.1rem] border border-white/8 bg-black/20 p-4">
              <p className="sim-label">Track</p>
              <p className="mt-2 text-lg font-semibold text-white">{currentTrack.name}</p>
            </div>
            <div className="rounded-[1.1rem] border border-white/8 bg-black/20 p-4">
              <p className="sim-label">Path directive</p>
              <p className="mt-2 text-lg font-semibold text-white">{learningGoal.shortLabel}</p>
            </div>
            <div className="rounded-[1.1rem] border border-white/8 bg-black/20 p-4">
              <p className="sim-label">Accuracy</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {Math.round(masterySnapshot.accuracyRate)}%
              </p>
            </div>
            <div className="rounded-[1.1rem] border border-white/8 bg-black/20 p-4">
              <p className="sim-label">Mastery score</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {Math.round(masterySnapshot.masteryScore)}
              </p>
            </div>
          </div>
        </div>

        <div className="sim-panel rounded-[1.8rem] p-6">
          <p className="sim-label">Friend network</p>
          <h2 className="sim-heading mt-2 text-3xl">Challenge-ready roster</h2>
          <div className="mt-5 space-y-3">
            {academyFriends.map((friend) => (
              <div
                key={friend.id}
                className="rounded-[1.1rem] border border-white/8 bg-black/20 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-xl text-white">{friend.callsign}</p>
                    <p className="mt-1 text-sm text-white/62">{friend.displayName}</p>
                  </div>
                  <div className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/55">
                    {friend.status}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/68">
                  {friend.specialty}. Rating {friend.duelRating}. Signature: {friend.signature}.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
