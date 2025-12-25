
import React from 'react';

interface VolumeSliderProps {
  value: number;
  onChange: (val: number) => void;
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-0 group-hover:w-24 h-8 flex items-center transition-all duration-500 overflow-hidden">
      <div className="relative w-full h-1.5 bg-white/10 rounded-full ml-2">
        <div 
          className="h-full bg-white rounded-full"
          style={{ width: `${value * 100}%` }}
        ></div>
        <input 
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default VolumeSlider;
