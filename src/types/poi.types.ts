import type { LucideIcon } from "lucide-react";

export interface OverpassNode {
  id: number;
  lat: number;
  lon: number;
  tags: { [key: string]: string };
  type: string;
}

export interface PointOfInterest extends OverpassNode { // TODO: make optionals required
  name?: string;
  icon?: LucideIcon;
  color?: [number, number, number];
  address?: string;
  url?: string;
  trackDistance?: number; // distance to nearest point on track for filtering
  resourceId?: string
  resourceCategoryId?: string;
}
