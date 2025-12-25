
import React, { useRef } from 'react';
import { MediaFile } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: MediaFile[];
  currentIndex: number;
  onSelectVideo: (index: number) => void;
  onRemoveVideo: (id: string) => void;
  onAddFiles: (files: File[]) => void;
  onClearPlaylist: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, onClose, playlist, currentIndex, onSelectVideo, onRemoveVideo, onAddFiles, onClearPlaylist 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAddFiles(Array.from(e.target.files));
    }
  };

  return (
    <div 
      className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-[#0c0c0c]/80 backdrop-blur-3xl border-r border-white/5 transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) shadow-[50px_0_100px_-20px_rgba(0,0,0,0.5)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple 
        accept="video/*,audio/*" 
        onChange={handleFileChange}
      />

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Library
            </h2>
            <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black mt-1">
              {playlist.length} items collected
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
            <i className="fa-solid fa-chevron-left text-sm"></i>
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-8 pb-4 flex gap-2">
            <button 
                onClick={handleAddClick} 
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white"
            >
                <i className="fa-solid fa-plus mr-2"></i> Add
            </button>
            <button 
                onClick={onClearPlaylist}
                className="p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-2xl text-red-500/40 hover:text-red-500 transition-all"
                title="Clear Library"
            >
                <i className="fa-solid fa-trash-can"></i>
            </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3">
          {playlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-6">
              <i className="fa-solid fa-compact-disc text-6xl animate-spin-slow"></i>
              <p className="text-xs font-black uppercase tracking-[0.4em]">Empty Shelf</p>
            </div>
          ) : (
            playlist.map((video, idx) => (
              <div
                key={video.id}
                className={`
                  group relative flex items-center gap-4 w-full p-4 rounded-3xl transition-all border
                  ${currentIndex === idx 
                    ? 'bg-blue-600/10 border-blue-500/40 shadow-xl' 
                    : 'bg-white/2 hover:bg-white/5 border-transparent'}
                `}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${currentIndex === idx ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/20'}`}>
                    <i className={`fa-solid ${video.isAudio ? 'fa-music' : 'fa-film'}`}></i>
                </div>

                <button
                  onClick={() => onSelectVideo(idx)}
                  className="flex-1 text-left flex flex-col gap-1 overflow-hidden"
                >
                  <span className={`text-sm font-bold truncate transition-colors ${currentIndex === idx ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>
                    {video.name}
                  </span>
                  <span className="text-[9px] text-white/20 uppercase tracking-widest font-black">
                    {(video.size / (1024 * 1024)).toFixed(1)} MB • {video.type.split('/')[1]}
                  </span>
                </button>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveVideo(video.id);
                  }}
                  className="p-2 text-white/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <i className="fa-solid fa-xmark text-xs"></i>
                </button>

                {currentIndex === idx && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-10 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-10 text-[9px] text-white/10 uppercase tracking-[0.5em] text-center font-black">
            VividPlayer
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
