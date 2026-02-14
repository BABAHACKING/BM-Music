import React, { useState } from 'react';
import { Search } from 'lucide-react';

const YouTubeSearch = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search YouTube..."
                className="w-full bg-[#242424] text-white rounded-full py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-white/20 transition-all font-medium"
            />
        </form>
    );
};

export default YouTubeSearch;
