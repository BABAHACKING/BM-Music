console.log('Arijit Hits Playlist');
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
            console.log('Fetching fresh cloud metadata...');
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

async function main() {
    songs = await getAllSongs();

    // Filter for Arijit songs if possible, or just show all for now
    // (In a real app, you'd filter by artist === 'Arijit Singh')
    const arijitSongs = songs.filter(s => s.artist?.includes('Arijit') || s.title?.includes('Kesariya') || s.title?.includes('Deva'));
    const displaySongs = arijitSongs.length > 0 ? arijitSongs : songs;

    if (displaySongs.length > 0) {
        playMusic(displaySongs[0], true);
    }

    // Populate playlist songs
    let songUL = document.getElementById("playlistSongs");
    let songNumber = 1;
    songUL.innerHTML = '';
    displaySongs.forEach(song => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="song-number">${songNumber}</span>
            <img class="invert" src="music.svg" style="width:18px;">
            <div class="info" style="flex:1;min-width:0;">
                <div>${song.title}</div>
                <div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:2px;">${song.artist || 'Arijit Singh'}</div>
            </div>
            <div class="playnow">
                <img class="invert" src="play.svg" alt="" style="width:16px;">
            </div>`;
        li.addEventListener("click", () => playMusic(song));
        songUL.appendChild(li);
        songNumber++;
    });

    // Play All
    document.getElementById("playAll").addEventListener("click", () => playMusic(displaySongs[0]));

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
        let index = displaySongs.findIndex(s => s.title === currentTitle);
        if ((index - 1) >= 0) playMusic(displaySongs[index - 1]);
    });

    // Next
    document.getElementById("next").addEventListener("click", () => {
        let currentTitle = document.querySelector(".songsinfo").innerHTML;
        let index = displaySongs.findIndex(s => s.title === currentTitle);
        if ((index + 1) < displaySongs.length) playMusic(displaySongs[index + 1]);
    });

    // Auto-play next
    currentSong.addEventListener("ended", () => {
        let currentTitle = document.querySelector(".songsinfo").innerHTML;
        let index = displaySongs.findIndex(s => s.title === currentTitle);
        if ((index + 1) < displaySongs.length) playMusic(displaySongs[index + 1]);
        else document.getElementById("play").src = "play.svg";
    });

    // Volume
    document.querySelector(".range input").addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
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
