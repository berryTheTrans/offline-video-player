
import React, { useState, useRef } from 'react';
import { PlayerState } from '../../types';
import ProgressBar from './ProgressBar';
import VolumeSlider from './VolumeSlider';
import AISceneInsights from '../AI/AISceneInsights';
import SubtitleSearch from './SubtitleSearch';

interface ControlsProps {
  state: PlayerState;
  videoName: string;
  isAudio: boolean;
  subtitleName?: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
  onRateChange: (rate: number) => void;
  onToggleFullscreen: () => void;
  onTogglePiP: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAddSubtitle: (file: File) => void;
  onSubtitleUrlAdded: (url: string, name: string) => Promise<boolean>;
  hasNext: boolean;
  hasPrev: boolean;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s]
    .map(v => v < 10 ? "0" + v : v)
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
};

const Controls: React.FC<ControlsProps> = ({ 
  state, videoName, isAudio, subtitleName, videoRef, onTogglePlay, onSeek, onVolumeChange, 
  onToggleMute, onRateChange, onToggleFullscreen, onTogglePiP,
  onNext, onPrev, onAddSubtitle, onSubtitleUrlAdded, hasNext, hasPrev
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showSubSearch, setShowSubSearch] = useState(false);
  const subInputRef = useRef<HTMLInputElement>(null);

  const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleSubFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAddSubtitle(e.target.files[0]);
    }
  };

  return (
    <div className="px-8 py-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <input 
        type="file" 
        ref={subInputRef} 
        className="hidden" 
        accept=".vtt,.srt" 
        onChange={handleSubFile} 
      />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <div className="flex flex-col overflow-hidden">
                <h3 className="text-white text-lg font-bold truncate max-w-xl group relative">
                    {videoName}
                    <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-blue-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </h3>
                <div className="flex gap-3 text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mt-1 items-center">
                    <span className="text-white/60">{formatTime(state.currentTime)}</span>
                    <span className="text-white/20">/</span>
                    <span>{formatTime(state.duration)}</span>
                    {subtitleName && (
                      <span className="ml-4 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md flex items-center gap-1.5 lowercase tracking-normal">
                        <i className="fa-solid fa-closed-captioning text-[8px]"></i>
                        {subtitleName}
                      </span>
                    )}
                </div>
            </div>

            {!isAudio && (
                <div className="flex gap-3">
                  <div className="flex bg-white/5 border border-white/10 rounded-2xl overflow-hidden group">
                    <button 
                        onClick={() => subInputRef.current?.click()}
                        className="p-3 text-white/80 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 border-r border-white/5"
                        title="Import Local Subtitles (.vtt, .srt)"
                    >
                        <i className="fa-solid fa-closed-captioning"></i>
                        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Subs</span>
                    </button>
                    <button 
                        onClick={() => setShowSubSearch(true)}
                        className="p-3 text-white/40 hover:bg-blue-600/20 hover:text-blue-400 transition-all flex items-center"
                        title="Search Subtitles Online"
                    >
                        <i className="fa-solid fa-earth-americas"></i>
                    </button>
                  </div>
                  
                  <button 
                      onClick={() => setShowAI(!showAI)}
                      className={`p-3 rounded-2xl border transition-all flex items-center gap-2 ${showAI ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}
                      title="AI Scene Insights"
                  >
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                      <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">AI Analysis</span>
                  </button>
                </div>
            )}
        </div>

        <div className="mt-2">
            <ProgressBar 
                currentTime={state.currentTime} 
                duration={state.duration} 
                onSeek={onSeek} 
            />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onPrev} 
            disabled={!hasPrev} 
            className={`text-white/60 transition-all ${!hasPrev ? 'opacity-20 cursor-not-allowed' : 'hover:text-white hover:scale-110 active:scale-95'}`}
          >
            <i className="fa-solid fa-backward-step text-xl"></i>
          </button>
          
          <button 
            onClick={onTogglePlay} 
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-2xl active:scale-95 ${state.isPlaying ? 'bg-white text-black' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
          >
            <i className={`fa-solid ${state.isPlaying ? 'fa-pause' : 'fa-play'} text-2xl ml-${state.isPlaying ? '0' : '1'}`}></i>
          </button>
          
          <button 
            onClick={onNext} 
            disabled={!hasNext} 
            className={`text-white/60 transition-all ${!hasNext ? 'opacity-20 cursor-not-allowed' : 'hover:text-white hover:scale-110 active:scale-95'}`}
          >
            <i className="fa-solid fa-forward-step text-xl"></i>
          </button>

          <div className="flex items-center gap-4 group ml-4 bg-white/5 py-2 px-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
            <button onClick={onToggleMute} className="text-white/60 hover:text-white transition-colors">
              <i className={`fa-solid ${state.isMuted ? 'fa-volume-xmark' : (state.volume < 0.5 ? 'fa-volume-low' : 'fa-volume-high')} text-lg`}></i>
            </button>
            <VolumeSlider value={state.volume} onChange={onVolumeChange} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all ${showSettings ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-white/60 hover:text-white'}`}
            >
              <i className="fa-solid fa-gauge-high text-xs opacity-40"></i>
              <span className="text-xs font-black uppercase tracking-widest">{state.playbackRate}x</span>
            </button>
            
            {showSettings && (
              <div className="absolute bottom-full right-0 mb-4 bg-[#111] border border-white/10 rounded-2xl p-2 min-w-[140px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-white/30 font-black border-b border-white/5 mb-1">Playback Speed</div>
                {rates.map(r => (
                  <button
                    key={r}
                    onClick={() => { onRateChange(r); setShowSettings(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${state.playbackRate === r ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                  >
                    {r}x {r === 1 && '(Normal)'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!isAudio && (
            <>
                <button 
                    onClick={onTogglePiP} 
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white/60 hover:text-white transition-all" 
                    title="Picture in Picture"
                >
                    <i className="fa-solid fa-window-restore"></i>
                </button>

                <button 
                    onClick={onToggleFullscreen} 
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white/60 hover:text-white transition-all" 
                    title="Fullscreen"
                >
                    <i className={`fa-solid ${state.isFullscreen ? 'fa-compress' : 'fa-expand'} text-lg`}></i>
                </button>
            </>
          )}
        </div>
      </div>

      {showAI && !isAudio && (
        <AISceneInsights 
          videoRef={videoRef} 
          isOpen={showAI} 
          onClose={() => setShowAI(false)} 
        />
      )}

      {showSubSearch && !isAudio && (
        <SubtitleSearch 
          videoTitle={videoName}
          isOpen={showSubSearch}
          onClose={() => setShowSubSearch(false)}
          onSubtitleUrlAdded={onSubtitleUrlAdded}
        />
      )}
    </div>
  );
};

export default Controls;
