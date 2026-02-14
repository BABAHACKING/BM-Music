import React, { useState } from 'react';
import { Youtube } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import YouTubeResults from '../components/YouTubeResults';

const YouTubePage = () => {
    const [videos, setVideos] = useState([]);

    return (
        <div className="flex flex-col items-center pt-8 px-4 h-full w-full">
            <div className="flex items-center gap-2 mb-8">
                <Youtube color="#FF0000" size={48} />
                <h1 className="text-4xl font-bold text-white">YouTube Search</h1>
            </div>

            <SearchBar onSearchResults={setVideos} />

            <YouTubeResults videos={videos} />
        </div>
    );
};

export default YouTubePage;
