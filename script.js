console.log('Baba Music – Initialized');
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
    searchInput: document.querySelector(".search-input"),
    sidebar: document.getElementById("sidebar"),
    overlay: document.getElementById("sidebarOverlay"),
    hamburger: document.getElementById("hamburgerBtn"),
    pbHeart: document.getElementById('playbarHeart')
};

// Navigation
function goToPlaylist(element, url) {
    const img = element.querySelector('img').src;
    const title = element.querySelector('h2').innerText;
    window.location.href = `${url}?img=${encodeURIComponent(img)}&title=${encodeURIComponent(title)}`;
}

// ===== FAVORITES (localStorage) =====
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
    renderFavorites();
    updateHeartButtons();
    // Also update the main My Heart section
    if (typeof renderHeartSection === 'function') renderHeartSection();
}

function renderFavorites() {
    const favList = document.getElementById('favList');
    const favCount = document.getElementById('favCount');
    const favEmpty = document.getElementById('favEmpty');
    const favs = getFavorites();

    if (!favList) return;

    favCount.textContent = favs.length;

    // Clear existing items (keep empty message)
    favList.querySelectorAll('.fav-item').forEach(el => el.remove());

    if (favs.length === 0) {
        favEmpty.style.display = 'block';
        return;
    }

    favEmpty.style.display = 'none';

    favs.forEach(songName => {
        const item = document.createElement('div');
        item.className = 'fav-item';
        item.innerHTML = `
            <span>🎵</span>
            <span class="fav-name">${songName.replace('.mp3', '')}</span>
            <button class="fav-remove" title="Remove from favorites">✕</button>
        `;

        // Click to play
        item.querySelector('.fav-name').addEventListener('click', () => {
            playMusic(songName);
        });

        // Remove button
        item.querySelector('.fav-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(songName);
        });

        favList.appendChild(item);
    });
}

function updateHeartButtons() {
    document.querySelectorAll('.heart-btn').forEach(btn => {
        const songName = btn.dataset.song;
        if (isFavorite(songName)) {
            btn.classList.add('liked');
        } else {
            btn.classList.remove('liked');
        }
    });
}

// ===== UTILITIES =====
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs() {
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
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) sessionStorage.setItem('babaSongsCache', JSON.stringify(data));
            return data || [];
        }

        const response = await fetch('/api/songs');
        const result = await response.json();
        const data = result.data || [];
        if (data.length > 0) sessionStorage.setItem('babaSongsCache', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error("Error fetching songs:", error);
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
    // Once current song can play, preload the next one
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
            console.log('Pre-fetching next track in background:', nextSong.title);
            nextTrackAudio.src = nextSong.audio_url;
            nextTrackAudio.load(); // Start download
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
        } else {
            console.error('Song not found in cloud database:', song);
            return;
        }
    } else if (song && song.audio_url) {
        audioUrl = song.audio_url;
        title = song.title;
    } else {
        console.error('Invalid song object provided to playMusic:', song);
        return;
    }

    // Optimization: Don't reload if already playing this song
    if (currentSong.src === audioUrl && !currentSong.paused) {
        console.log('Already playing:', title);
        return;
    }

    currentSong.src = audioUrl;
    currentSong.preload = "auto"; // Aggressive metadata/initial chunk loading

    currentSong.onerror = () => {
        console.error(`Playback failed for: ${title}. URL: ${audioUrl}`);
        window.babaError?.(`Failed to load: ${title}`);
    };

    if (!pause) {
        currentSong.play().catch(e => {
            console.warn('Autoplay prevented or network error:', e.message);
        });
    }

    if (elements.playBtn) elements.playBtn.src = pause ? "play.svg" : "pause.svg";
    if (elements.songInfo) elements.songInfo.innerHTML = title;
    if (elements.songTime) elements.songTime.innerHTML = "00:00 / 00:00";

    // Update heart in play bar
    updatePlayBarHeart(title);
}

function updatePlayBarHeart(track) {
    const pbHeart = document.getElementById('playbarHeart');
    if (pbHeart) {
        pbHeart.dataset.song = track;
        if (isFavorite(track)) {
            pbHeart.classList.add('liked');
        } else {
            pbHeart.classList.remove('liked');
        }
    }
}

async function main() {
    try {
        // ===== AUTH CHECK =====
        let session = null;
        try {
            session = await getSession(); // From frontend-auth.js
        } catch (authErr) {
            console.warn('Auth check skipped:', authErr.message);
        }
        const isLoggedIn = !!session || localStorage.getItem('babaLoggedIn') === 'true'; // Fallback to local

        // Update UI based on auth
        const btnSignup = document.getElementById('btnSignup');
        const btnLogin = document.getElementById('btnLogin');
        const btnLogout = document.getElementById('btnLogout');

        if (isLoggedIn) {
            if (btnSignup) btnSignup.style.display = 'none';
            if (btnLogin) btnLogin.style.display = 'none';
            if (btnLogout) btnLogout.style.display = 'inline-block';
            console.log('User is logged in:', session?.user?.email || 'Guest');
        } else {
            if (btnSignup) btnSignup.style.display = 'inline-block';
            if (btnLogin) btnLogin.style.display = 'inline-block';
            if (btnLogout) btnLogout.style.display = 'none';
        }

        // ===== MOBILE AUTH GATEKEEPER =====
        const isMobile = window.innerWidth <= 768; // Tablet or Mobile
        const isLoginPage = window.location.pathname.includes('loging.html');

        if (isMobile && !isLoggedIn && !isLoginPage) {
            console.log('Mobile user not logged in. Redirecting...');
            window.location.replace('loging.html');
            return; // Stop execution
        }

        songs = await getSongs();
        console.log('Songs loaded:', songs.length);
        if (songs.length > 0) {
            playMusic(songs[0], true);
        }

        // Populate sidebar song list with heart buttons
        let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
        songUL.innerHTML = ""; // Clear existing

        songs.forEach(song => {
            // For favorites, use title as key
            const liked = isFavorite(song.title) ? 'liked' : '';
            const li = document.createElement('li');
            li.innerHTML = `
            <img class="invert" src="music.svg">
            <div class="info">
                <div>${song.title}</div>
                <div>${song.artist}</div>
            </div>
            <button class="heart-btn ${liked}" data-song="${song.title}" title="Add to favorites">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path class="heart-outline" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-width="2"/>
                </svg>
            </button>
            <div class="playnow">
                <span>Play</span>
                <img class="invert" src="play.svg" alt="">
            </div>`;

            // Click on specific song
            li.addEventListener('click', (event) => {
                if (event.target.closest('.heart-btn')) return;
                playMusic(song);
            });

            songUL.appendChild(li);
        });

        // Heart button click handlers (delegated or re-attached? we generated dynamic HTML so need to attach)
        // Actually I can attach inside the loop but keeping structure similar to before:
        document.querySelectorAll('.heart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const songName = btn.dataset.song;
                toggleFavorite(songName);
                btn.classList.add('pop');
                setTimeout(() => btn.classList.remove('pop'), 300);
            });
        });

        // Play/Pause toggle
        document.getElementById("play").addEventListener("click", () => {
            if (currentSong.src) { // Check if source is set
                if (currentSong.paused) {
                    currentSong.play();
                    document.getElementById("play").src = "pause.svg";
                } else {
                    currentSong.pause();
                    document.getElementById("play").src = "play.svg";
                }
            }
        });

        // Time update (improved with duration check)
        currentSong.addEventListener("timeupdate", () => {
            const duration = isNaN(currentSong.duration) ? 0 : currentSong.duration;
            const currentTime = currentSong.currentTime;

            document.querySelector(".songtime").innerHTML =
                `${secondsToMinutesSeconds(currentTime)} / ${secondsToMinutesSeconds(duration)}`;

            if (duration > 0) {
                document.querySelector(".circle").style.left = (currentTime / duration) * 100 + "%";
            }
        });

        // Buffered Progress (Visualizing the download)
        currentSong.addEventListener("progress", () => {
            if (currentSong.buffered.length > 0 && currentSong.duration > 0) {
                const bufferedEnd = currentSong.buffered.end(currentSong.buffered.length - 1);
                const duration = currentSong.duration;
                const bufferedPercent = (bufferedEnd / duration) * 100;

                // Update a buffered progress bar (if exists)
                const seekbar = document.querySelector(".seekbar");
                let bufferedBar = seekbar.querySelector(".buffered-bar");
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
                    seekbar.prepend(bufferedBar);
                }
                bufferedBar.style.width = bufferedPercent + "%";
            }
        });

        currentSong.addEventListener("loadedmetadata", () => {
            window.babaLog?.('Metadata Ready 💿');
            // Refresh duration display immediately
            const duration = currentSong.duration;
            document.querySelector(".songtime").innerHTML =
                `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(duration)}`;
        });

        // Seekbar click
        document.querySelector(".seekbar").addEventListener("click", e => {
            const rect = e.target.getBoundingClientRect();
            let percent = (e.clientX - rect.left) / rect.width * 100;
            if (percent < 0) percent = 0;
            if (percent > 100) percent = 100;

            document.querySelector(".circle").style.left = percent + "%";
            if (!isNaN(currentSong.duration)) {
                currentSong.currentTime = (currentSong.duration * percent) / 100;
            }
        });

        // Previous button
        if (document.getElementById("privious")) {
            document.getElementById("privious").addEventListener("click", () => {
                let currentTitle = elements.songInfo?.innerHTML || "";
                let index = songs.findIndex(s => s.title === currentTitle);
                if ((index - 1) >= 0) {
                    playMusic(songs[index - 1]);
                }
            });
        }

        // Next button
        if (document.getElementById("next")) {
            document.getElementById("next").addEventListener("click", () => {
                let currentTitle = elements.songInfo?.innerHTML || "";
                let index = songs.findIndex(s => s.title === currentTitle);

                if ((index + 1) < songs.length) {
                    playMusic(songs[index + 1]);
                }
            });
        }

        // Volume control
        document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
            currentSong.volume = parseInt(e.target.value) / 100;
        });

        // Search functionality with Debounce (Optimization)
        let searchTimeout;
        elements.searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchQuery = e.target.value.toLowerCase();
                const songItems = document.querySelector(".songlist").getElementsByTagName("li");
                Array.from(songItems).forEach(item => {
                    const songName = item.querySelector(".info").firstElementChild.innerHTML.toLowerCase();
                    item.style.display = songName.includes(searchQuery) ? "flex" : "none";
                });
            }, 150); // 150ms debounce
        });

        // Auto-play next song when current ends
        currentSong.addEventListener("ended", () => {
            let currentTitle = document.querySelector(".songsinfo").innerHTML;
            let index = songs.findIndex(s => (s.title === currentTitle || s === currentTitle));
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1]);
            } else {
                document.getElementById("play").src = "play.svg";
            }
        });

        // ===== SIDEBAR TOGGLE (mobile) =====
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("sidebarOverlay");
        const hamburger = document.getElementById("hamburgerBtn");

        if (hamburger) {
            hamburger.addEventListener("click", () => {
                sidebar.classList.toggle("open");
                overlay.classList.toggle("active");
            });
        }

        if (overlay) {
            overlay.addEventListener("click", () => {
                sidebar.classList.remove("open");
                overlay.classList.remove("active");
            });
        }

        // ===== PLAY BAR HEART =====
        const pbHeart = document.getElementById('playbarHeart');
        if (pbHeart) {
            pbHeart.addEventListener('click', () => {
                const songName = pbHeart.dataset.song;
                if (songName) {
                    toggleFavorite(songName);
                    pbHeart.classList.add('pop');
                    setTimeout(() => pbHeart.classList.remove('pop'), 300);
                }
            });
        }

        // ===== AUDIO VISUALIZER =====
        let audioCtx;
        let analyser;
        let source;
        let canvas = document.getElementById('visualizer');
        let canvasCtx = canvas.getContext('2d');
        let isVizRunning = false;
        let animationId;

        function initVisualizer() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioCtx.createAnalyser();
                source = audioCtx.createMediaElementSource(currentSong);
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                analyser.fftSize = 256;
            }
        }

        function drawVisualizer() {
            if (!isVizRunning) return;

            animationId = requestAnimationFrame(drawVisualizer);
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;

            canvasCtx.clearRect(0, 0, canvas.width, canvas.height); // Clear only, no background fill

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 1.5; // Scale down height

                // Gradient color based on frequency
                const r = barHeight + (25 * (i / bufferLength));
                const g = 250 * (i / bufferLength);
                const b = 50;

                canvasCtx.fillStyle = `rgb(${r},${g},${b})`;
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        }

        const vizToggle = document.getElementById('vizToggle');
        if (vizToggle) {
            vizToggle.addEventListener('click', () => {
                if (!audioCtx) {
                    // Initialize on first click
                    initVisualizer();
                }
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }

                if (isVizRunning) {
                    isVizRunning = false;
                    cancelAnimationFrame(animationId);
                    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                    vizToggle.classList.remove('active');
                } else {
                    isVizRunning = true;
                    drawVisualizer();
                    vizToggle.classList.add('active');
                }
            });
        }

        // Initialize render of favorites
        renderFavorites();
        if (songs && songs.length > 0) {
            updatePlayBarHeart(songs[0].title || songs[0]);
        }

    } catch (err) {
        console.error('❌ main() crashed:', err);
    }
}

main();