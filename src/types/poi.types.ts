import type { LucideIcon } from "lucide-react";

export interface OverpassNode {
  id: number;
  lat: number;
  lon: number;
  tags: { [key: string]: string };
  type: string;
}

export interface PointOfInterest extends OverpassNode {
  name?: string;
  icon?: LucideIcon;
  color?: [number, number, number];
  address?: string;
  url?: string;
  trackDistance?: number; // distance to nearest point on track for filtering
  category?: string;
}

export interface Pois {
  pois: PointOfInterest[] | null;
}

export interface Category {
  name: string;
  id: string;
  description?: string;
  icon: LucideIcon;
  active: boolean;
  tags: string[][];
}

export interface PoiType {
  name: string;
  id: string;
  icon: LucideIcon;
  color: [number, number, number];
  active: boolean;
  distance: number;
  minDistance: number;
  maxDistance: number;
  categories: { [key: string]: Category };
}
