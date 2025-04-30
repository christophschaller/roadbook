import type { Rider } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// const colors = [
//   "#1f77b4", // blue
//   "#ff7f0e", // orange
//   "#2ca02c", // green
//   "#d62728", // red
//   "#9467bd", // purple
//   "#e377c2", // pink
//   "#bcbd22", // olive
//   "#17becf", // cyan
// ];

const colors: [number, number, number][] = [
  [147, 103, 189], // purple
  [227, 119, 195], // pink
  [188, 189, 34], // olive
  [23, 190, 207], // cyan
  [31, 119, 180], // blue
  [255, 127, 14], // orange
  [44, 160, 44], // green
  [214, 39, 40], // red
];

function hashStringToIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % max;
}

export function getRiderColor(userName: string): [number, number, number] {
  const index = hashStringToIndex(userName, colors.length);
  return colors[index];
}

export function getRiderLastSeen(rider: Rider): string {
  return new Date(rider.isotst).toLocaleString("en-UK", {
    //year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
