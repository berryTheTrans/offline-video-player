
import React from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek }) => {
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-full h-6 flex items-center group cursor-pointer">
      {/* Track */}
      <div className="absolute w-full h-1 bg-white/10 rounded-full overflow-hidden transition-all duration-300 group-hover:h-2">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-500 rounded-full relative"
          style={{ width: `${percentage}%` }}
        >
          {/* Glowing Head */}
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
        </div>
      </div>

      {/* Hidden Input for Scrubbing */}
      <input 
        type="range"
        min="0"
        max={duration || 0}
        step="0.01"
        value={currentTime}
        onChange={(e) => onSeek(parseFloat(e.target.value))}
        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
      />
    </div>
  );
};

export default ProgressBar;
