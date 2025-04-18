import type { LucideIcon } from "lucide-react";

// --- static ---
export interface ResourceCategory {
    name: string;
    id: string;
    description?: string;
    icon: LucideIcon;
    // active: boolean;
    osmTags: string[][];
}

export interface Resource {
    name: string;
    id: string;
    icon: LucideIcon;
    color: [number, number, number];
    // active: boolean;
    // distance: number;
    minDistance: number;
    maxDistance: number;
    categories: Record<string, ResourceCategory>;
}


// --- user specific ---
export interface ResourceCategoryState {
    active: boolean
}

export interface ResourceState {
    active: boolean;
    distance: number;
    categoryStates: Record<string, ResourceCategoryState>;
}


// --- combined views ---
export interface ResourceCategoryView extends ResourceCategory {
    active: boolean;
}

export interface ResourceView extends Resource {
    active: boolean;
    distance: number;
    categories: Record<string, ResourceCategoryView>;
}
