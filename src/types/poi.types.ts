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
    address?: string
    url?: string
    trackDistance?: number // distance to nearest point on track for filtering
    categories?: string[] // string concatenation of OverpassNode.tags for filtering
}

export interface Pois {
    pois: PointOfInterest[] | null
}

export interface Category {
    name: string,
    icon?: LucideIcon,
    active: boolean,
    tags: string[][]
}
