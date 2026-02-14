import { createContext, useEffect, useRef, useState } from "react";
import { songs } from "../data/songs";

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
    const audioRef = useRef(null);
    const seekBg = useRef();
    const seekBar = useRef();

    // Default to the first song if available, otherwise null
    const [track, setTrack] = useState(songs && songs.length > 0 ? songs[0] : null);
    const [playStatus, setPlayStatus] = useState(false);
    const [time, setTime] = useState({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 }
    });

    const [isYouTube, setIsYouTube] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState(null);

    // Initialize Audio separately to handle potential null track
    useEffect(() => {
        if (!audioRef.current && track && track.src) {
            audioRef.current = new Audio(track.src);
        }
    }, [track]);

    const play = () => {
        if (isYouTube) {
            setPlayStatus(true);
        } else if (audioRef.current) {
            audioRef.current.play();
            setPlayStatus(true);
        }
    }

    const pause = () => {
        if (isYouTube) {
            setPlayStatus(false);
        } else if (audioRef.current) {
            audioRef.current.pause();
            setPlayStatus(false);
        }
    }

    const playWithId = async (id) => {
        if (!songs[id]) return;
        setIsYouTube(false);
        setYoutubeUrl(null);
        await setTrack(songs[id]);
        if (audioRef.current) {
            audioRef.current.src = songs[id].src;
            await audioRef.current.play();
            setPlayStatus(true);
        }
    }

    const playYouTube = (video) => {
        setIsYouTube(true);
        setYoutubeUrl(`https://www.youtube.com/watch?v=${video.id.videoId}`);
        setTrack({
            title: video.snippet.title,
            artist: video.snippet.channelTitle,
            img: video.snippet.thumbnails.high.url
        });
        if (audioRef.current) audioRef.current.pause();
        setPlayStatus(true);
    }

    const previous = async () => {
        if (isYouTube || !track) return;
        const currentIndex = songs.findIndex(song => song.title === track.title);
        if (currentIndex > 0) {
            await setTrack(songs[currentIndex - 1]);
            playWithId(currentIndex - 1);
        }
    }

    const next = async () => {
        if (isYouTube || !track) return;
        const currentIndex = songs.findIndex(song => song.title === track.title);
        if (currentIndex < songs.length - 1) {
            await setTrack(songs[currentIndex + 1]);
            playWithId(currentIndex + 1);
        }
    }

    const seekSong = async (e) => {
        if (!isYouTube && audioRef.current && seekBg.current) {
            audioRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audioRef.current.duration)
        }
    }

    useEffect(() => {
        if (!isYouTube && track && audioRef.current) {
            if (audioRef.current.src !== window.location.origin + track.src && track.src) {
                audioRef.current.src = track.src;
                if (playStatus) {
                    audioRef.current.play();
                }
            }
        }
    }, [track, isYouTube]);

    useEffect(() => {
        if (!isYouTube && audioRef.current) {
            audioRef.current.ontimeupdate = () => {
                if (seekBar.current) {
                    seekBar.current.style.width = (Math.floor(audioRef.current.currentTime / audioRef.current.duration * 100)) + "%";
                }
                setTime({
                    currentTime: {
                        second: Math.floor(audioRef.current.currentTime % 60),
                        minute: Math.floor(audioRef.current.currentTime / 60)
                    },
                    totalTime: {
                        second: Math.floor(audioRef.current.duration % 60),
                        minute: Math.floor(audioRef.current.duration / 60)
                    }
                })
            }
        }
    }, [audioRef, isYouTube]);

    const contextValue = {
        audioRef,
        seekBar,
        seekBg,
        track, setTrack,
        playStatus, setPlayStatus,
        time, setTime,
        play, pause,
        playWithId,
        previous, next,
        seekSong,
        playYouTube,
        isYouTube,
        youtubeUrl
    }

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    )
}

export default PlayerContextProvider;
