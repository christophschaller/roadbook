import { atom } from 'nanostores';
import { type GeoJSON } from '@we-gold/gpxjs';

interface TrackStore {
    name: string;
    data: GeoJSON | null;
}

export const trackStore = atom<TrackStore>({
    name: '',
    data: null,
});
