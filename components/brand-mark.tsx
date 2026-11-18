import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <div
      className={cn(
        "relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[0.95rem] border border-white/10 bg-[#0f1b2f]",
        className,
      )}
    >
      <div className="absolute inset-[1px] rounded-[0.85rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]" />
      <div className="relative h-5 w-5">
        <div className="absolute left-0 top-0 h-full w-[3px] rounded-full bg-[#7cd9ff]" />
        <div className="absolute right-0 top-0 h-full w-[3px] rounded-full bg-[#7cd9ff]" />
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8f82ff]/70 bg-[#8f82ff]/18" />
      </div>
    </div>
  );
}
