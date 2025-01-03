import { atom } from 'nanostores';
import type { Area } from '@/types';

export const areaStore = atom<Area>({
    distance: 500,
    activeTags: [],
})
