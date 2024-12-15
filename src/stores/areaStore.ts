import { atom } from 'nanostores';

interface AreaStore {
    distance: number;
    activeTags: string[];
}

export const areaStore = atom<AreaStore>({
    distance: 500,
    activeTags: [],
})
