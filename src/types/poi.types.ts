import type { LucideIcon } from "lucide-react"

export interface OverpassNode {
    id: number;
    lat: number;
    lon: number;
    tags: { [key: string]: string };
    type: string
}

export interface PointOfInterest extends OverpassNode {
    name?: string
    icon?: string
    color?: number[]
    address?: string
    url?: string
    trackDistance?: number // distance to nearest point on track for filtering
    category?: string
}

export interface Pois {
    pois: PointOfInterest[] | null
}

export interface Category {
    name: string,
    id: string,
    icon?: LucideIcon,
    active: boolean,
    tags: string[][]
}
