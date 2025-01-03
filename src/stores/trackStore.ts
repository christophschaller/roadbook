import { atom } from 'nanostores';
import type { Track } from '@/types'


export const trackStore = atom<Track>({
    name: '',
    data: null,
});
