import React, { useContext } from 'react';
import { Play } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';

const SongItem = ({ name, desc, id, image }) => {
    const { playWithId } = useContext(PlayerContext);

    return (
        <div onClick={() => playWithId(id)} className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff2b] flex items-center gap-4 transition-all group">
            <div className="relative">
                <img className="rounded w-10 h-10 object-cover" src={image} alt={name} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                    <Play size={16} fill="white" className="text-white" />
                </div>
            </div>
            <div className="flex flex-col">
                <p className="font-bold mb-1 text-sm text-white">{name}</p>
                <p className="text-slate-200 text-xs">{desc}</p>
            </div>
        </div>
    );
};

export default SongItem;
