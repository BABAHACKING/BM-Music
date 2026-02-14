import React from 'react';
import PlaylistCard from '../components/PlaylistCard';

const playlists = [
    {
        id: 1,
        title: "Happy Hits!",
        description: "Hits to boost your mood and fill you with happiness",
        image: "https://i.scdn.co/image/ab67706f0000000249a1ed33d2ca64e6a5d0e550"
    },
    {
        id: 2,
        title: "Arjit Singh Hits",
        description: "Best songs of Arjit Singh",
        image: "/assets/arjit hits.png"
    },
    {
        id: 3,
        title: "Top 50 - Global",
        description: "Your daily update of the most played tracks",
        image: "/assets/glory.jpg"
    }
];

const HomePage = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6 text-white">Spotify Playlists</h1>
            <div className="flex flex-wrap gap-4 overflow-auto max-h-[70vh]">
                {playlists.map((playlist) => (
                    <PlaylistCard
                        key={playlist.id}
                        id={playlist.id}
                        title={playlist.title}
                        description={playlist.description}
                        image={playlist.image}
                    />
                ))}
            </div>
        </div>
    );
};

export default HomePage;
