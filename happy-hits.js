console.log('Happy Hits Playlist');
let currentSong = new Audio();
let songs;

// Turbo Optimization: Cached DOM Elements
const elements = {
    songInfo: document.querySelector(".songsinfo"),
    songTime: document.querySelector(".songtime"),
    circle: document.querySelector(".circle"),
    seekbar: document.querySelector(".seekbar"),
    playBtn: document.getElementById("play"),
    playlistSongs: document.getElementById("playlistSongs"),
    searchInput: document.querySelector(".search-input")
};

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getAllSongs() {
    // 1. Check Session Storage for Instant Cache
    const cached = sessionStorage.getItem('babaSongsCache');
    if (cached) {
        console.log('Using cached song data ⚡');
        songs = JSON.parse(cached);
        return songs;
    }

    try {
        if (window.supabaseClient) {
            console.log('Fetching songs from cloud...');
            const { data, error } = await window.supabaseClient
                .from('songs')
                .select('*');
            if (error) throw error;
            if (data) sessionStorage.setItem('babaSongsCache', JSON.stringify(data));
            return data || [];
        }
        const response = await fetch('/api/songs');
        const result = await response.json();
        const data = result.data || [];
        if (data.length > 0) sessionStorage.setItem('babaSongsCache', JSON.stringify(data));
        return data;
    } catch (err) {
        console.error('Error loading songs:', err);
        return [];
    }
}

// Global buffering events
currentSong.onwaiting = () => {
    document.getElementById('playbar')?.classList.add('buffering');
    window.babaLog?.('Buffering cloud stream...');
};
currentSong.onplaying = () => {
    document.getElementById('playbar')?.classList.remove('buffering');
};
currentSong.oncanplay = () => {
    document.getElementById('playbar')?.classList.remove('buffering');
    preloadNextTrack();
};
currentSong.onerror = () => {
    document.getElementById('playbar')?.classList.remove('buffering');
};

// Next Track Buffer (Hidden)
let nextTrackAudio = new Audio();
nextTrackAudio.preload = "auto";

function preloadNextTrack() {
    if (!songs || songs.length === 0) return;
    let currentTitle = elements.songInfo?.innerHTML || "";
    let index = songs.findIndex(s => s.title === currentTitle);
    if (index !== -1 && index < songs.length - 1) {
        const nextSong = songs[index + 1];
        if (nextTrackAudio.src !== nextSong.audio_url) {
            console.log('Pre-fetching next track:', nextSong.title);
            nextTrackAudio.src = nextSong.audio_url;
            nextTrackAudio.load();
        }
    }
}

const playMusic = (song, pause = false) => {
    let audioUrl, title;
    if (typeof song === 'string') {
        const found = songs?.find(s =>
            s.title.toLowerCase() === song.toLowerCase() ||
            s.title.toLowerCase() === song.replace('.mp3', '').toLowerCase() ||
            s.title.toLowerCase().includes(song.replace('.mp3', '').toLowerCase())
        );
        if (found) {
            audioUrl = found.audio_url;
            title = found.title;
            console.log(`Cloud match found: ${title}`);
        } else {
            console.error('Song not found in cloud database:', song);
            if (songs) console.log('Available titles:', songs.map(s => s.title).join(', '));
            return;
        }
    } else if (song && song.audio_url) {
        audioUrl = song.audio_url;
        title = song.title;
    } else {
        console.error('Invalid song object provided to playMusic:', song);
        return;
    }

    currentSong.src = audioUrl;
    currentSong.onerror = () => {
        console.error(`Playback failed for: ${title}. URL: ${audioUrl}`);
    };
    if (!pause) {
        currentSong.play().catch(e => {
            console.error('Playback error:', e.message);
        });
    }
    if (elements.playBtn) elements.playBtn.src = pause ? "play.svg" : "pause.svg";
    if (elements.songInfo) elements.songInfo.innerHTML = title;
    if (elements.songTime) elements.songTime.innerHTML = "00:00 / 00:00";
}

// ===== FAVORITES LOGIC (Shared) =====
function getFavorites() {
    return JSON.parse(localStorage.getItem('babaFavorites') || '[]');
}

function saveFavorites(favs) {
    localStorage.setItem('babaFavorites', JSON.stringify(favs));
}

function isFavorite(songName) {
    return getFavorites().includes(songName);
}

function toggleFavorite(songName) {
    let favs = getFavorites();
    if (favs.includes(songName)) {
        favs = favs.filter(f => f !== songName);
    } else {
        favs.push(songName);
    }
    saveFavorites(favs);
}

async function main() {
    songs = await getAllSongs();

    // Populate playlist songs
    let songUL = document.getElementById("playlistSongs");
    let songNumber = 1;
    songUL.innerHTML = ''; // Clear existing

    for (const song of songs) {
        const songTitle = typeof song === 'string' ? song.replace('.mp3', '') : song.title;
        const songArtist = typeof song === 'string' ? 'Ravi.S' : (song.artist || 'Unknown');
        const liked = isFavorite(songTitle) ? 'liked' : '';
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="song-number">${songNumber}</span>
            <img class="invert" src="music.svg" style="width:18px;">
            <div class="info" style="flex:1;min-width:0;">
                <div>${songTitle}</div>
                <div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:2px;">${songArtist}</div>
            </div>
            <button class="heart-btn ${liked}" data-song="${songTitle}" title="Add to favorites">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path class="heart-outline" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-width="2"/>
                </svg>
            </button>
            <div class="playnow">
                <img class="invert" src="play.svg" alt="" style="width:16px;">
            </div>`;

        // Add click event to LI (play song)
        li.addEventListener('click', (e) => {
            // Don't play if heart button was clicked
            if (e.target.closest('.heart-btn')) return;
            playMusic(song);
        });

        // Add click event to Heart Button
        const heartBtn = li.querySelector('.heart-btn');
        heartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(songTitle); // Use songTitle string
            if (isFavorite(song)) {
                heartBtn.classList.add('liked');
            } else {
                heartBtn.classList.remove('liked');
            }
            heartBtn.classList.add('pop');
            setTimeout(() => heartBtn.classList.remove('pop'), 300);
        });

        songUL.appendChild(li);
        songNumber++;
    }

    // Play first song logic moved to Play All or user interaction
    // playMusic(songs[0], true); // Optional: don't load first song immediately if not desired

    // Play All
    document.getElementById("playAll").addEventListener("click", () => playMusic(songs[0]));

    // Play/Pause
    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("play").src = "pause.svg";
        } else {
            currentSong.pause();
            document.getElementById("play").src = "play.svg";
        }
    });

    // Time update (improved with cached elements)
    currentSong.addEventListener("timeupdate", () => {
        const duration = isNaN(currentSong.duration) ? 0 : currentSong.duration;
        const currentTime = currentSong.currentTime;
        if (elements.songTime) {
            elements.songTime.innerHTML = `${secondsToMinutesSeconds(currentTime)} / ${secondsToMinutesSeconds(duration)}`;
        }
        if (duration > 0 && elements.circle) {
            elements.circle.style.left = (currentTime / duration) * 100 + "%";
        }
    });

    // Buffered Progress
    currentSong.addEventListener("progress", () => {
        if (currentSong.buffered.length > 0 && currentSong.duration > 0) {
            const bufferedEnd = currentSong.buffered.end(currentSong.buffered.length - 1);
            const duration = currentSong.duration;
            const bufferedPercent = (bufferedEnd / duration) * 100;
            if (elements.seekbar) {
                let bufferedBar = elements.seekbar.querySelector(".buffered-bar");
                if (!bufferedBar) {
                    bufferedBar = document.createElement("div");
                    bufferedBar.className = "buffered-bar";
                    bufferedBar.style.position = "absolute";
                    bufferedBar.style.height = "100%";
                    bufferedBar.style.background = "rgba(255, 255, 255, 0.1)";
                    bufferedBar.style.left = "0";
                    bufferedBar.style.top = "0";
                    bufferedBar.style.pointerEvents = "none";
                    bufferedBar.style.borderRadius = "100px";
                    elements.seekbar.prepend(bufferedBar);
                }
                bufferedBar.style.width = bufferedPercent + "%";
            }
        }
    });

    currentSong.addEventListener("loadedmetadata", () => {
        const duration = currentSong.duration;
        if (elements.songTime) {
            elements.songTime.innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(duration)}`;
        }
    });

    // Seekbar
    if (elements.seekbar) {
        elements.seekbar.addEventListener("click", e => {
            const rect = elements.seekbar.getBoundingClientRect();
            let percent = (e.clientX - rect.left) / rect.width * 100;
            if (percent < 0) percent = 0;
            if (percent > 100) percent = 100;
            if (elements.circle) elements.circle.style.left = percent + "%";
            if (!isNaN(currentSong.duration)) {
                currentSong.currentTime = (currentSong.duration * percent) / 100;
            }
        });
    }

    // Previous
    document.getElementById("privious").addEventListener("click", () => {
        let currentTitle = document.querySelector(".songsinfo").innerHTML;
        let index = songs.findIndex(s => (s.title === currentTitle || s === currentTitle));
        if ((index - 1) >= 0) playMusic(songs[index - 1]);
    });

    // Next
    document.getElementById("next").addEventListener("click", () => {
        let currentTitle = document.querySelector(".songsinfo").innerHTML;
        let index = songs.findIndex(s => (s.title === currentTitle || s === currentTitle));
        if ((index + 1) < songs.length) playMusic(songs[index + 1]);
    });

    // Volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Search with Debounce
    if (elements.searchInput) {
        let searchTimeout;
        elements.searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchQuery = e.target.value.toLowerCase();
                const songItems = document.getElementById("playlistSongs").getElementsByTagName("li");
                Array.from(songItems).forEach(item => {
                    const songName = item.querySelector(".info").firstElementChild.innerHTML.toLowerCase();
                    item.style.display = songName.includes(searchQuery) ? "flex" : "none";
                });
            }, 150);
        });
    }

    // Auto-play next
    currentSong.addEventListener("ended", () => {
        let currentTitle = document.querySelector(".songsinfo").innerHTML;
        let index = songs.findIndex(s => (s.title === currentTitle || s === currentTitle));
        if ((index + 1) < songs.length) playMusic(songs[index + 1]);
        else document.getElementById("play").src = "play.svg";
    });

    // Sidebar toggle
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const hamburger = document.getElementById("hamburgerBtn");
    if (hamburger) hamburger.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    });
    if (overlay) overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    });
}

main();
