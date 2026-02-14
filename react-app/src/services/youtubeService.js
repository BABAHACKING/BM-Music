import axios from 'axios';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

export const youtubeService = {
    searchYouTube: async (query) => {
        if (!query) return [];

        // Check cache
        const cacheKey = `youtube_search_${query}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        try {
            if (!API_KEY) {
                console.warn("YouTube API Key is missing. Returning mock data.");
                return getMockData();
            }

            const response = await axios.get(BASE_URL, {
                params: {
                    part: 'snippet',
                    maxResults: 12,
                    q: query,
                    type: 'video',
                    videoCategoryId: '10',
                    key: API_KEY
                }
            });

            // Save to cache
            sessionStorage.setItem(cacheKey, JSON.stringify(response.data.items));

            return response.data.items;
        } catch (error) {
            console.error("Error fetching YouTube videos:", error);
            throw error;
        }
    }
};

const getMockData = () => [
    {
        id: { videoId: "dQw4w9WgXcQ" },
        snippet: {
            title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
            channelTitle: "Rick Astley",
            thumbnails: { high: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" } }
        }
    },
    {
        id: { videoId: "JGwWNGJdvx8" },
        snippet: {
            title: "Shape of You - Ed Sheeran",
            channelTitle: "Ed Sheeran",
            thumbnails: { high: { url: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg" } }
        }
    }
];
