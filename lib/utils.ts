import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shows " #4" only when a jersey number is known (uploaded headband logs often have none)
export function jerseyLabel(jerseyNumber?: number) {
  return jerseyNumber ? ` #${jerseyNumber}` : "";
}

// Short badge text: the jersey number when known, otherwise the athlete's initials
export function athleteBadge(playerName: string, jerseyNumber?: number) {
  if (jerseyNumber) {
    return `#${jerseyNumber}`;
  }
  const initials = playerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "?";
}
