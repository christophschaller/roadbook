import { atom } from "nanostores";
import type { PointOfInterest } from "@/types";

export const poiStore = atom<PointOfInterest[]>([]);
