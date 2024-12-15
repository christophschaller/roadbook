import { atom } from 'nanostores';

interface OverpassNode {
    id: number;
    lat: number;
    lon: number;
    tags: { [key: string]: string };
    type: string
}

export interface Poi extends OverpassNode {
    name?: string
    icon?: string
    address?: string
    url?: string
    trackDistance?: number // distance to nearest point on track for filtering
    categories?: string[] // string concatenation of OverpassNode.tags for filtering
}

interface PoiStore {
    pois: Poi[] | null
}

export const poiStore = atom<PoiStore>({
    pois: null
})
