
import React, { useState, useRef } from 'react';
import { describeScene } from '../../services/geminiService';

interface AISceneInsightsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isOpen: boolean;
  onClose: () => void;
}

const AISceneInsights: React.FC<AISceneInsightsProps> = ({ videoRef, isOpen, onClose }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const analyzeCurrentFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = dataUrl.split(',')[1];

      try {
        const result = await describeScene(base64);
        setAnalysis(result);
      } catch (err) {
        setAnalysis("Could not analyze the scene. Check your API key.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <div className="absolute right-8 top-24 bottom-24 w-96 z-50 flex flex-col pointer-events-auto">
      <div className="flex-1 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <i className="fa-solid fa-wand-magic-sparkles text-blue-400"></i>
            </div>
            <h3 className="font-bold text-white">Scene Insights</h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-white/5">
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
              {!analysis && !isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center text-white/20">
                  <i className="fa-solid fa-image text-4xl"></i>
                </div>
              )}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                   <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                   <p className="text-xs text-blue-400 font-bold uppercase tracking-widest animate-pulse">AI is thinking...</p>
                </div>
              )}
            </div>

            <button 
              onClick={analyzeCurrentFrame}
              disabled={isAnalyzing}
              className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 shadow-xl"
            >
              <i className="fa-solid fa-camera"></i>
              Analyze Current Moment
            </button>
          </div>

          {analysis && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                <span>Gemini Analysis</span>
                <div className="h-[1px] flex-1 bg-white/5"></div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                "{analysis}"
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 text-center bg-black/40">
           <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">
            Powered by Google Gemini
           </p>
        </div>
      </div>
    </div>
  );
};

export default AISceneInsights;
