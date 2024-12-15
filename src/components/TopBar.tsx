import React from 'react';
import { useStore } from '@nanostores/react';
import { trackStore } from '../stores/trackStore';

const TopBar: React.FC = () => {
    const track = useStore(trackStore);

    return (
        <div className="bg-gray-800 text-white p-4">
            <h1 className="text-lg font-bold">
                {track.name ? `Track: ${track.name}` : 'No Track Loaded'}
            </h1>
        </div>
    );
};

export default TopBar;
