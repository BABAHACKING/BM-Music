import React, { useContext } from 'react';
import { Play } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';

const YouTubeResults = ({ videos }) => {
    const { playYouTube } = useContext(PlayerContext);

    if (!videos || videos.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8 pb-24">
            {videos.map((video) => (
                <div
                    key={video.id.videoId}
                    className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all cursor-pointer group"
                    onClick={() => playYouTube(video)}
                >
                    <div className="relative mb-3 aspect-video overflow-hidden rounded">
                        <img
                            src={video.snippet.thumbnails.high.url}
                            alt={video.snippet.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={32} fill="white" className="text-white" />
                        </div>
                    </div>
                    <h3 className="font-bold text-white text-sm line-clamp-2 mb-1" title={video.snippet.title}>
                        {video.snippet.title}
                    </h3>
                    <p className="text-[#a7a7a7] text-xs font-medium">
                        {video.snippet.channelTitle}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default YouTubeResults;
