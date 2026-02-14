import React, { useState } from 'react';
import { Search, Youtube } from 'lucide-react';
import { youtubeService } from '../services/youtubeService';

const SearchBar = ({ onSearchResults }) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const results = await youtubeService.searchYouTube(query);
            onSearchResults(results);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#1db954] transition-colors" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for songs or videos..."
                    className="block w-full pl-12 pr-4 py-4 bg-[#242424] border-transparent text-white placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:bg-[#2a2a2a] transition-all shadow-lg"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-2 bottom-2 bg-[#1db954] text-black font-bold px-6 rounded-full hover:bg-[#1ed760] disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>
        </div>
    );
};

export default SearchBar;
