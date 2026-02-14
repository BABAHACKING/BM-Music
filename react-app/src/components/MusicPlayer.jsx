import React, { useContext, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';
import ReactPlayer from 'react-player';

const MusicPlayer = () => {
    const {
        track, seekBar, seekBg, playStatus, play, pause, time, previous, next, seekSong,
        isYouTube, youtubeUrl, setTime, setPlayStatus
    } = useContext(PlayerContext);

    // Keep ReactPlayer hidden but active
    const playerRef = useRef(null);

    const handleProgress = (state) => {
        if (!isYouTube) return;

        const currentTime = state.playedSeconds;
        const duration = state.loadedSeconds; // or state.playedSeconds / state.played 
        // Better to get duration from playerRef if possible, but let's stick to simple state for now

        if (seekBar.current) {
            seekBar.current.style.width = (state.played * 100) + "%";
        }

        setTime({
            currentTime: {
                second: Math.floor(currentTime % 60),
                minute: Math.floor(currentTime / 60)
            },
            totalTime: {
                second: Math.floor(duration % 60),
                minute: Math.floor(duration / 60) // Approximate
            }
        })
    };

    return (
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-[95vw] sm:w-[70vw] bg-[#e2d9d9] rounded-[30px] p-3 z-50 flex flex-col gap-2">
            {/* Seekbar */}
            <div onClick={seekSong} ref={seekBg} className="w-full h-1 bg-black/20 rounded-full cursor-pointer relative group">
                <div
                    ref={seekBar}
                    className="h-full bg-black rounded-full relative"
                    style={{ width: '0%' }}
                >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
            </div>

            <div className="flex justify-between items-center px-4">
                {/* Song Info */}
                <div className="w-[150px] text-xs sm:text-sm truncate text-black font-medium">
                    {track.title} - {track.artist}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    <SkipBack onClick={previous} size={20} className="cursor-pointer text-black hover:scale-110 transition-transform" />
                    <div
                        onClick={playStatus ? pause : play}
                        className="cursor-pointer text-black hover:scale-110 transition-transform"
                    >
                        {playStatus ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" />}
                    </div>
                    <SkipForward onClick={next} size={20} className="cursor-pointer text-black hover:scale-110 transition-transform" />
                </div>

                {/* Volume & Time */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-black w-16 text-center">
                        {time.currentTime.minute}:{time.currentTime.second.toString().padStart(2, '0')} / {time.totalTime.minute}:{time.totalTime.second.toString().padStart(2, '0')}
                    </span>
                    <div className="hidden sm:flex items-center gap-2">
                        <Volume2 size={16} className="text-black" />
                        <input type="range" min="0" max="100" className="w-16 h-1 bg-black rounded-lg appearance-none cursor-pointer" />
                    </div>
                </div>
            </div>

            {/* Hidden React Player for YouTube */}
            {isYouTube && youtubeUrl && (
                <div className="hidden">
                    <ReactPlayer
                        ref={playerRef}
                        url={youtubeUrl}
                        playing={playStatus}
                        controls={false}
                        onProgress={handleProgress}
                        onEnded={() => setPlayStatus(false)}
                        width="0"
                        height="0"
                    />
                </div>
            )}
        </div>
    );
};

export default MusicPlayer;
