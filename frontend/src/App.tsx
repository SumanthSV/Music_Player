import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSongs } from './lib/api';
import type { Song } from './lib/types';
import { findBestMatch } from './lib/songMatcher';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { SpeakerAnimation } from './components/SpeakerAnimation';
import { AmbientBackground } from './components/AmbientBackground';
import { VoiceControl } from './components/VoiceControl';
import { Toast } from './components/Toast';
import Loading from './components/Loading';

function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  // const [isMusyMode, setIsMusyMode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { currentSong, isPlaying, playSong, setPlaylist, next, previous, volume, setVolume, currentIndex, togglePlayPause, audioLevel, seekBy, setPosition, pause, resume } = useAudioPlayer();

  // refs controlling mic-driven pause/resume behavior
  const micPausedRef = useRef<boolean>(false);
  const resumeAfterCommandRef = useRef<boolean>(false);

  // Use refs to avoid unnecessary callback recreations while still accessing current state
  const songsRef = useRef(songs);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    songsRef.current = songs;
  }, [songs]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const handleVoiceResult = useCallback((text: string) => {
    // text is already lowercased by the hook
    const t = text.trim();
    console.log('Voice command:', t);
    // default: resume after command unless command explicitly pauses
    resumeAfterCommandRef.current = true;

    // play/pause
    if (/\bpause\b/.test(t)) {
      setToast({ message: 'Paused', type: 'success' });
      if (isPlayingRef.current) togglePlayPause();
      resumeAfterCommandRef.current = false;
      return;
    }

    if (/\b(play)\b/.test(t)) {
      setToast({ message: 'Playing', type: 'success' });
      if (!isPlayingRef.current) togglePlayPause();
      resumeAfterCommandRef.current = true;
      return;
    }

    // next / previous
    if (/\b(next|skip)\b/.test(t)) {
      next();
      setToast({ message: 'Next track', type: 'success' });
      resumeAfterCommandRef.current = true;
      return;
    }

    if (/\b(prev|previous|back)\b/.test(t)) {
      previous();
      setToast({ message: 'Previous track', type: 'success' });
      resumeAfterCommandRef.current = true;
      return;
    }

    // volume up/down
    if (/volume up|increase volume|louder|turn up/.test(t)) {
      setVolume(Math.min(1, volume + 0.1));
      setToast({ message: `Volume: ${Math.round(Math.min(1, volume + 0.1) * 100)}%`, type: 'success' });
      resumeAfterCommandRef.current = true;
      return;
    }

    if (/volume down|decrease volume|quieter|turn down/.test(t)) {
      setVolume(Math.max(0, volume - 0.1));
      setToast({ message: `Volume: ${Math.round(Math.max(0, volume - 0.1) * 100)}%`, type: 'success' });
      resumeAfterCommandRef.current = true;
      return;
    }

    // seek forward/back
    const seekForwardMatch = t.match(/(?:forward|ahead|skip forward)\s*(\d+)?\s*(?:seconds|sec|s)?/);
    if (seekForwardMatch) {
      const n = seekForwardMatch[1] ? Number(seekForwardMatch[1]) : 10;
      seekBy(n);
      setToast({ message: `Seek +${n}s`, type: 'success' });
      resumeAfterCommandRef.current = true;
      return;
    }

    const seekBackMatch = t.match(/(?:back|backward|rewind|skip back|skip backward)\s*(\d+)?\s*(?:seconds|sec|s)?/);
    if (seekBackMatch) {
      const n = seekBackMatch[1] ? Number(seekBackMatch[1]) : 10;
      seekBy(-n);
      setToast({ message: `Seek -${n}s`, type: 'success' });
      resumeAfterCommandRef.current = true;
      return;
    }

    // seek to specific time like "seek to 1:20" or "go to 90 seconds"
    const toSecMatch = t.match(/(?:seek to|go to|at)\s*(\d+:\d+|\d+)\s*(?:seconds|sec|s)?/);
    if (toSecMatch) {
      const v = toSecMatch[1];
      let secs = 0;
      if (v.includes(':')) {
        const parts = v.split(':').map(Number);
        secs = parts[0] * 60 + (parts[1] || 0);
      } else {
        secs = Number(v);
      }
      setPosition(secs);
      setToast({ message: `Seek to ${secs}s`, type: 'success' });
      resumeAfterCommandRef.current = true;
      return;
    }

    // fallback: try to match a song title
    const match = findBestMatch(t, songsRef.current);
    if (match) {
      playSong(match);
      setToast({ message: `Playing: ${match.title}`, type: 'success' });
      resumeAfterCommandRef.current = true;
    } else {
      setToast({ message: 'Command or song not found', type: 'error' });
      // keep original playback state
      resumeAfterCommandRef.current = true;
    }
  }, [togglePlayPause, next, previous, volume, setVolume, seekBy, setPosition, playSong]);

  const { isListening, isSupported, startListening, stopListening, lastTranscript } = useVoiceRecognition(handleVoiceResult);

  // When listening stops, resume playback only when resumeAfterCommandRef is true
  useEffect(() => {
    if (!isListening && micPausedRef.current) {
      // listening ended
      if (resumeAfterCommandRef.current) {
        // resume playback
        resume();
      }
      micPausedRef.current = false;
      resumeAfterCommandRef.current = false;
    }
  }, [isListening, resume]);

  useEffect(() => {
    let loadingTimer: NodeJS.Timeout | null = null;
    let isMounted = true;

    const load = async () => {
      try {
        // Set a 10-second timeout to show loading toast
        loadingTimer = setTimeout(() => {
          if (isMounted) {
            setToast({ message: 'No songs available on the database', type: 'error' });
          }
        }, 10000);

        const data = await fetchSongs();
        
        // Clear the loading timer if request completes before 10 seconds
        if (loadingTimer) {
          clearTimeout(loadingTimer);
        }

        if (isMounted) {
          setSongs(data || []);
          if (data && data.length > 0) {
            setPlaylist(data);
          }
        }
      } catch (err) {
        console.error('Error fetching songs:', err);
        if (loadingTimer) {
          clearTimeout(loadingTimer);
        }
        if (isMounted) {
          setToast({ message: 'Error loading songs', type: 'error' });
        }
      }
    };

    load();

    return () => {
      isMounted = false;
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
    };
  }, [setPlaylist]);


  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isPlaying) {
        pause();
        micPausedRef.current = true;
      }
      // start listening for a single command; the effect on isListening will
      // resume playback if resumeAfterCommandRef remains true after handling.
      startListening();
    }
  };

  const ambientColors = currentSong?.colors?.length
    ? currentSong.colors
    : ['#0891b2', '#3b82f6', '#6366f1', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      <AmbientBackground colors={ambientColors} />

      {songs.length > 0 ?
      (
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full space-y-12">
          <div className="text-center space-y-2">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              Musy
            </h1>
            <p className="text-gray-400 text-sm">Voice-Controlled Music Player</p>
          </div>

          <div className="flex flex-col items-center gap-8">
            <SpeakerAnimation isPlaying={isPlaying} audioLevel={audioLevel} />

            <div className="flex items-center gap-4">
              <button
                onClick={() => togglePlayPause()}
                className="px-4 py-2 bg-cyan-600 rounded-md hover:bg-cyan-500"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>

            {currentSong? (
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-semibold">{currentSong.title}</h2>
                <p className="text-gray-400">{currentSong.artist}</p>
              </div>
            ):<div className="text-center space-y-1">
                <h2 className="text-2xl font-semibold">Whats your Fav Song</h2>
                <p className="text-gray-400">Artist</p>
              </div>}

            <VoiceControl
              isListening={isListening}
              // isMusyMode={isMusyMode}
              isSupported={isSupported}
              // onToggleMusyMode={handleToggleMusyMode}
              onMicClick={handleMicClick}
            />

            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-gray-400">
                {/* <div>Listening: {isListening ? 'Yes' : 'No'}</div> */}
                {lastTranscript && <div>Heard: {lastTranscript}</div>}
              </div>
            </div>

            <div className="w-full flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => previous()}
                  className="px-3 py-2 bg-gray-800 rounded-md hover:bg-gray-700"
                >
                  Prev
                </button>

                <div className="text-center text-sm">
                  <div className="text-gray-300">Previous</div>
                  <div className="text-white font-medium">
                    {songs.length > 0 && currentIndex !== null
                      ? songs[(currentIndex - 1 + songs.length) % songs.length]?.title
                      : '-'}
                  </div>
                </div>

                <div className="w-6" />

                <div className="text-center text-sm">
                  <div className="text-gray-300">Next</div>
                  <div className="text-white font-medium">
                    {songs.length > 0 && currentIndex !== null
                      ? songs[(currentIndex + 1) % songs.length]?.title
                      : '-'}
                  </div>
                </div>

                <button
                  onClick={() => next()}
                  className="px-3 py-2 bg-gray-800 rounded-md hover:bg-gray-700"
                >
                  Next
                </button>
              </div>

              <div className="w-full flex items-center gap-3 mt-2">
                <label className="text-sm text-gray-300">Volume</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      ):(
        <Loading/>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;