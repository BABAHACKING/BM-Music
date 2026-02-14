/**
 * Shared Playback Utilities for Baba Music
 * Standardizes Speed & Perceived Performance
 */

// 1. Song Metadata Cache (Session Storage)
export async function getSongsCached(supabaseClient) {
    const cached = sessionStorage.getItem('babaSongsCache');
    if (cached) {
        console.log('Using cached song data ⚡');
        return JSON.parse(cached);
    }

    try {
        if (supabaseClient) {
            console.log('Fetching fresh cloud metadata...');
            const { data, error } = await supabaseClient
                .from('songs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) sessionStorage.setItem('babaSongsCache', JSON.stringify(data));
            return data || [];
        }
        return [];
    } catch (err) {
        console.error('Cache fetching failed:', err);
        return [];
    }
}

// 2. Universal Buffering Listeners
export function setupBufferingEvents(audioObj, playbarId = 'playbar') {
    const playbar = document.getElementById(playbarId);

    audioObj.onwaiting = () => {
        playbar?.classList.add('buffering');
        window.babaLog?.('Buffering cloud stream...');
    };

    audioObj.onplaying = () => {
        playbar?.classList.remove('buffering');
    };

    audioObj.oncanplay = () => {
        playbar?.classList.remove('buffering');
    };

    audioObj.onerror = () => {
        playbar?.classList.remove('buffering');
        window.babaError?.('Cloud streaming error');
    };
}

// 3. Smart Preloading Logic
export function preloadNext(songs, currentIndex, nextAudioObj) {
    if (!songs || songs.length === 0) return;
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];

    if (nextSong && nextSong.audio_url) {
        console.log('Pre-fetching next track:', nextSong.title);
        nextAudioObj.src = nextSong.audio_url;
        nextAudioObj.preload = "auto";
    }
}
