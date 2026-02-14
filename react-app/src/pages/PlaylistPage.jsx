import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import SongItem from '../components/SongItem';
import { songs } from '../data/songs';
import { PlayerContext } from '../context/PlayerContext';

const PlaylistPage = () => {
    const { id } = useParams();
    const { playWithId } = useContext(PlayerContext);

    // In a real app we'd fetch based on ID, for now we just show all songs
    const playlist = {
        title: "Happy Hits!",
        description: "Hits to boost your mood and fill you with happiness",
        image: "https://i.scdn.co/image/ab67706f0000000249a1ed33d2ca64e6a5d0e550",
        totalSongs: songs.length,
        duration: "about 1 hr"
    };

    return (
        <div className="flex flex-col gap-8 pb-32">
            {/* Playlist Header */}
            <div className="flex flex-col md:flex-row gap-6 p-6 items-end bg-gradient-to-b from-[#131313] to-transparent">
                <img
                    src={playlist.image}
                    alt={playlist.title}
                    className="w-[200px] h-[200px] shadow-2xl rounded"
                />
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-bold uppercase">Playlist</p>
                    <h1 className="text-5xl md:text-7xl font-bold text-white">{playlist.title}</h1>
                    <p className="text-[#b3b3b3] mt-2">{playlist.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="font-bold text-white">Spotify</span>
                        <span>• {playlist.totalSongs} songs, {playlist.duration}</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="px-6 flex items-center gap-6">
                <button
                    onClick={() => playWithId(0)}
                    className="w-14 h-14 bg-[#1db954] rounded-full flex items-center justify-center hover:scale-105 hover:bg-[#1ed760] transition-all">
                    <Play size={28} fill="black" className="text-black ml-1" />
                </button>
            </div>

            {/* Song List */}
            <div className="px-6">
                <div className="grid grid-cols-[16px_4fr_1fr] p-2 text-[#b3b3b3] border-b border-[#333] mb-4 text-sm uppercase">
                    <span>#</span>
                    <span>Title</span>
                </div>
                {songs.map((song, index) => (
                    <SongItem
                        key={index}
                        name={song.title}
                        desc={song.artist}
                        id={index}
                        image={song.img}
                    />
                ))}
            </div>
        </div>
    );
};

export default PlaylistPage;
