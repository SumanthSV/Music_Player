import { useState, useRef, useEffect } from 'react';
import type { Song } from '../lib/types';

export const useAudioPlayer = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [volume, setVolumeState] = useState<number>(1);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const playlistRef = useRef<Song[]>(playlist);
  const currentIndexRef = useRef<number | null>(currentIndex);
  const playAtIndexRef = useRef<(i: number) => void>(() => {});
  const audioInitializedRef = useRef(false);

  // ensure audio + analyser initialized (callable from any function)
  const ensureInit = () => {
    if (audioInitializedRef.current) return;

    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    audioRef.current.crossOrigin = 'anonymous';
    audioRef.current.muted = false;
    audioRef.current.volume = 1; // default; updated by volume effect

    audioRef.current.addEventListener('ended', () => {
      if (playlistRef.current.length > 0) {
        const nextIndex = currentIndexRef.current === null ? 0 : (currentIndexRef.current + 1) % playlistRef.current.length;
        playAtIndexRef.current(nextIndex);
      } else {
        setIsPlaying(false);
      }
    });

    audioRef.current.addEventListener('play', () => setIsPlaying(true));
    audioRef.current.addEventListener('pause', () => setIsPlaying(false));
    audioRef.current.addEventListener('volumechange', () => {
      if (audioRef.current) setVolumeState(audioRef.current.volume);
    });

    // Web Audio analyser (optional)
    // try {
    //   type Win = Window & { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    //   const AudioCtx = (window as Win).AudioContext || (window as Win).webkitAudioContext;
    //   if (AudioCtx) {
    //     audioContextRef.current = new AudioCtx();
    //     analyserRef.current = audioContextRef.current.createAnalyser();
    //     analyserRef.current.fftSize = 256;
    //     try {
    //       sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
    //       sourceRef.current.connect(analyserRef.current);
    //       analyserRef.current.connect(audioContextRef.current.destination);

    //       const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    //       const loop = () => {
    //         if (!analyserRef.current) return;
    //         analyserRef.current.getByteTimeDomainData(data);
    //         let sum = 0;
    //         for (let i = 0; i < data.length; i++) {
    //           const v = (data[i] - 128) / 128;
    //           sum += v * v;
    //         }
    //         const rms = Math.sqrt(sum / data.length);
    //         setAudioLevel(Number(rms.toFixed(3)));
    //         rafRef.current = requestAnimationFrame(loop);
    //       };
    //       rafRef.current = requestAnimationFrame(loop);
    //     } catch (err) {
    //       console.warn('Could not create MediaElementSourceNode:', err);
    //     }
    //   }
    // } catch (err) {
    //   console.warn('Web Audio API unavailable:', err);
    // }

    audioInitializedRef.current = true;
  };

  useEffect(() => {
    // initialize audio/analyser resources once
    ensureInit();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (analyserRef.current) analyserRef.current.disconnect();
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioContextRef.current && typeof audioContextRef.current.close === 'function') {
        audioContextRef.current.close().catch(() => {});
      }
      audioInitializedRef.current = false;
    };
  }, []);

  // keep audio element volume in sync with state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const playSong = (song: Song) => {
    ensureInit();
    if (!audioRef.current) return;

    if (audioRef.current.src) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    audioRef.current.src = song.audio_url;
    // ensure crossOrigin and volume are set
    try {
      audioRef.current.crossOrigin = 'anonymous';
    } catch (err) {
      console.warn('Failed to set crossOrigin on audio element', err);
    }
    audioRef.current.muted = false;
    audioRef.current.volume = volume;
    // ensure media is loaded before play
    try {
      audioRef.current.load();
    } catch {
      // ignore load errors
    }
    // resume audio context if suspended (browsers require user gesture)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }
    const playPromise = audioRef.current.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch((err) => {
        console.error('Audio play() failed:', err, 'src=', audioRef.current?.src);
      });
    }
    setCurrentSong(song);
    // if song exists in current playlist, update index
    const idx = playlist.findIndex((s) => s.audio_url === song.audio_url || s.title === song.title);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
  };

  const pause = () => {
    ensureInit();
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resume = () => {
    ensureInit();
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const setPlaylistSongs = (songs: Song[], startIndex: number | null = null) => {
    setPlaylist(songs);
    if (startIndex !== null && songs[startIndex]) {
      setCurrentIndex(startIndex);
      playSong(songs[startIndex]);
    }
  };

  const playAtIndex = (index: number) => {
    if (playlist[index]) {
      setCurrentIndex(index);
      playSong(playlist[index]);
    }
  };
  // keep ref to playAtIndex so event listeners can call it without stale closures
  playAtIndexRef.current = playAtIndex;

  const next = () => {
    if (playlist.length === 0) return;
    const nextIndex = currentIndex === null ? 0 : (currentIndex + 1) % playlist.length;
    playAtIndex(nextIndex);
  };

  const previous = () => {
    if (playlist.length === 0) return;
    const prevIndex = currentIndex === null ? 0 : (currentIndex - 1 + playlist.length) % playlist.length;
    playAtIndex(prevIndex);
  };

  const setVolume = (v: number) => {
    const vol = Math.max(0, Math.min(1, v));
    ensureInit();
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setVolumeState(vol);
  };

  const seekBy = (seconds: number) => {
    ensureInit();
    if (audioRef.current && typeof audioRef.current.currentTime === 'number') {
      audioRef.current.currentTime = Math.max(0, Math.min((audioRef.current.duration || Infinity), audioRef.current.currentTime + seconds));
    }
  };

  const setPosition = (seconds: number) => {
    ensureInit();
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration || seconds, seconds));
    }
  };

  const getCurrentTime = () => {
    return audioRef.current ? audioRef.current.currentTime : 0;
  };

  const getDuration = () => {
    return audioRef.current ? (audioRef.current.duration || 0) : 0;
  };

  return {
    currentSong,
    isPlaying,
    playSong,
    pause,
    resume,
    togglePlayPause,
    playlist,
    setPlaylist: setPlaylistSongs,
    currentIndex,
    next,
    previous,
    volume,
    setVolume,
    audioLevel,
    seekBy,
    setPosition,
    getCurrentTime,
    getDuration,
  };
};