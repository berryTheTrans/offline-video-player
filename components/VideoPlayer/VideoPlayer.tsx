
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MediaFile, PlayerState } from '../../types';
import Controls from './Controls';

interface VideoPlayerProps {
  video: MediaFile;
  onSidebarToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAddSubtitle: (file: File) => void;
  onSubtitleUrlAdded: (url: string, name: string) => Promise<boolean>;
  hasNext: boolean;
  hasPrev: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, onSidebarToggle, onNext, onPrev, onAddSubtitle, onSubtitleUrlAdded, hasNext, hasPrev 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<number | null>(null);

  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
    isFullscreen: false,
    isPiP: false,
    isControlsVisible: true,
  });

  // Track state in refs for timer logic to avoid stale closures
  const isPlayingRef = useRef(state.isPlaying);
  const isControlsVisibleRef = useRef(state.isControlsVisible);

  useEffect(() => {
    isPlayingRef.current = state.isPlaying;
    isControlsVisibleRef.current = state.isControlsVisible;
  }, [state.isPlaying, state.isControlsVisible]);

  const showControls = useCallback(() => {
    const isFullscreen = !!document.fullscreenElement;

    // 1. If not visible, make it visible immediately
    if (!isControlsVisibleRef.current) {
      setState(s => ({ ...s, isControlsVisible: true }));
    }

    // 2. Clear existing hide timer
    if (hideControlsTimeout.current) {
      window.clearTimeout(hideControlsTimeout.current);
      hideControlsTimeout.current = null;
    }

    // 3. Only set hide timer if in fullscreen AND playing
    // In windowed mode (non-maximum), controls stay visible.
    if (isFullscreen && isPlayingRef.current) {
      hideControlsTimeout.current = window.setTimeout(() => {
        if (document.fullscreenElement && isPlayingRef.current) {
          setState(s => ({ ...s, isControlsVisible: false }));
        }
      }, 3000);
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    // Show controls immediately on play/pause toggle
    showControls();
  };

  const seek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    showControls();
  };

  const handleVolume = (val: number) => {
    if (videoRef.current) {
      videoRef.current.volume = val;
      setState(s => ({ ...s, volume: val, isMuted: val === 0 }));
    }
    showControls();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !state.isMuted;
      videoRef.current.muted = newMuted;
      setState(s => ({ ...s, isMuted: newMuted }));
    }
    showControls();
  };

  const changeRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setState(s => ({ ...s, playbackRate: rate }));
    }
    showControls();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const togglePiP = async () => {
    if (videoRef.current) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setState(s => ({ ...s, isPiP: false }));
      } else {
        await videoRef.current.requestPictureInPicture();
        setState(s => ({ ...s, isPiP: true }));
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setState(s => ({ ...s, isFullscreen: isFull }));
      
      if (!isFull) {
        // Exit Fullscreen: Ensure controls stay visible
        setState(s => ({ ...s, isControlsVisible: true }));
        if (hideControlsTimeout.current) window.clearTimeout(hideControlsTimeout.current);
      } else {
        // Enter Fullscreen: Trigger hide timer if playing
        showControls();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [showControls]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Re-show controls on any key press
      showControls();

      // Skip player shortcuts if an input is focused (e.g. AI panel or search)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch(e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': seek(Math.max(0, state.currentTime - 5)); break;
        case 'ArrowRight': seek(Math.min(state.duration, state.currentTime + 5)); break;
        case 'ArrowUp': e.preventDefault(); handleVolume(Math.min(1, state.volume + 0.1)); break;
        case 'ArrowDown': e.preventDefault(); handleVolume(Math.max(0, state.volume - 0.1)); break;
        case 'KeyF': if(!video.isAudio) toggleFullscreen(); break;
        case 'KeyM': toggleMute(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, video.isAudio, showControls]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => {
      setState(s => ({ ...s, isPlaying: true }));
      // When playback starts, we might want to start the hide timer
      showControls();
    };
    const onPause = () => {
      setState(s => ({ ...s, isPlaying: false, isControlsVisible: true }));
      // Clear hide timer when paused so controls stay visible
      if (hideControlsTimeout.current) window.clearTimeout(hideControlsTimeout.current);
    };
    const onTimeUpdate = () => setState(s => ({ ...s, currentTime: v.currentTime }));
    const onDurationChange = () => setState(s => ({ ...s, duration: v.duration }));

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('durationchange', onDurationChange);

    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('durationchange', onDurationChange);
    };
  }, [video.url, showControls]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) window.clearTimeout(hideControlsTimeout.current);
    };
  }, []);

  const cursorClass = (state.isFullscreen && !state.isControlsVisible) ? 'cursor-none' : 'cursor-default';

  return (
    <div 
      ref={containerRef}
      onMouseMove={showControls}
      onClick={showControls}
      className={`flex flex-col w-full h-full bg-[#050505] overflow-hidden relative transition-all duration-300 ${cursorClass}`}
    >
      <style>{`
        video::cue {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 1.2rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          border-radius: 4px;
        }
      `}</style>
      
      <div className={`flex-1 relative flex items-center justify-center overflow-hidden ${state.isFullscreen ? 'h-full w-full absolute inset-0' : ''}`}>
        {video.isAudio ? (
          <div className="flex flex-col items-center justify-center gap-8 w-full h-full relative">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none"></div>
            
            <div className={`w-64 h-64 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden transition-transform duration-700 ${state.isPlaying ? 'scale-110 shadow-blue-500/10' : 'scale-100'}`}>
               <div className={`absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 transition-opacity duration-1000 ${state.isPlaying ? 'opacity-100' : 'opacity-0'}`}></div>
               <i className={`fa-solid fa-music text-7xl text-white/20 transition-all duration-700 ${state.isPlaying ? 'text-blue-500 animate-pulse' : ''}`}></i>
            </div>
            
            <div className="text-center z-10 space-y-2">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">{video.name}</h2>
              <p className="text-white/40 uppercase tracking-[0.3em] text-xs font-bold">Now Playing Audio</p>
            </div>
          </div>
        ) : (
          <video 
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-contain cursor-pointer"
            onDoubleClick={toggleFullscreen}
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            {video.subtitleUrl && (
              <track 
                key={video.subtitleUrl}
                kind="subtitles" 
                src={video.subtitleUrl} 
                srcLang="en" 
                label={video.subtitleName || "Subtitles"} 
                default 
              />
            )}
          </video>
        )}
      </div>

      {/* Control Bar wrapper */}
      <div 
        className={`
          w-full z-20 transition-all duration-500 ease-in-out
          ${state.isFullscreen 
            ? 'absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md' 
            : 'bg-[#0c0c0c] border-t border-white/5 shadow-[0_-10px_50px_rgba(0,0,0,0.5)]'
          }
          ${(state.isFullscreen && !state.isControlsVisible) 
            ? 'translate-y-full opacity-0 pointer-events-none' 
            : 'translate-y-0 opacity-100 pointer-events-auto'
          }
        `}
      >
        <Controls 
          videoRef={videoRef}
          state={state}
          videoName={video.name}
          isAudio={video.isAudio}
          subtitleName={video.subtitleName}
          onTogglePlay={togglePlay}
          onSeek={seek}
          onVolumeChange={handleVolume}
          onToggleMute={toggleMute}
          onRateChange={changeRate}
          onToggleFullscreen={toggleFullscreen}
          onTogglePiP={togglePiP}
          onNext={onNext}
          onPrev={onPrev}
          onAddSubtitle={onAddSubtitle}
          onSubtitleUrlAdded={onSubtitleUrlAdded}
          hasNext={hasNext}
          hasPrev={hasPrev}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
