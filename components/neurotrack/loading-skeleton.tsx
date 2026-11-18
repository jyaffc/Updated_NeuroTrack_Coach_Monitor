export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-lg border border-white/8 bg-white/5"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="h-[420px] animate-pulse rounded-lg border border-white/8 bg-white/5" />
        <div className="space-y-6">
          <div className="h-[220px] animate-pulse rounded-lg border border-white/8 bg-white/5" />
          <div className="h-[174px] animate-pulse rounded-lg border border-white/8 bg-white/5" />
        </div>
      </div>

      <div className="h-[320px] animate-pulse rounded-lg border border-white/8 bg-white/5" />
    </div>
  );
}
