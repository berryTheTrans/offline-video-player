
import React, { useRef, useState } from 'react';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  return (
    <div 
      className={`
        w-full max-w-2xl p-16 rounded-[2.5rem] border-2 border-dashed transition-all duration-500
        flex flex-col items-center justify-center space-y-8 group
        ${isDragging 
          ? 'border-blue-500 bg-blue-500/10 scale-105 shadow-[0_0_80px_-20px_rgba(59,130,246,0.6)]' 
          : 'border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/5'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
        <i className="fa-solid fa-clapperboard text-4xl text-white"></i>
      </div>
      
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-black tracking-tight text-white">
          Bring your media.
        </h2>
        <p className="text-white/40 text-lg font-medium">
          Drag and drop local <span className="text-white/60">videos</span> or <span className="text-white/60">audio</span> files
        </p>
      </div>

      <button 
        onClick={() => fileInputRef.current?.click()}
        className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-2xl active:scale-95"
      >
        Browse Library
      </button>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple 
        accept="video/*,audio/*" 
        onChange={handleFileInput}
      />

      <div className="flex gap-6 pt-6 text-[10px] text-white/20 uppercase tracking-[0.4em] font-black">
        <span>MP4</span>
        <span>MP3</span>
        <span>WAV</span>
        <span>MKV</span>
      </div>
    </div>
  );
};

export default DropZone;
