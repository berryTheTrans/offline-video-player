
import React, { useState, useEffect } from 'react';
import { findSubtitles, SubtitleResult } from '../../services/geminiService';

interface SubtitleSearchProps {
  videoTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSubtitleUrlAdded: (url: string, name: string) => Promise<boolean>;
}

const SubtitleSearch: React.FC<SubtitleSearchProps> = ({ videoTitle, isOpen, onClose, onSubtitleUrlAdded }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ text: string; sources: SubtitleResult[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingDirect, setLoadingDirect] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      search();
    }
  }, [isOpen, videoTitle]);

  const search = async () => {
    setLoading(true);
    setErrorMsg(null);
    const data = await findSubtitles(videoTitle);
    setResults(data);
    setLoading(false);
  };

  const handleDirectLoad = async (url: string, title: string) => {
    setLoadingDirect(url);
    setErrorMsg(null);
    const success = await onSubtitleUrlAdded(url, title);
    if (success) {
      onClose();
    } else {
      setErrorMsg("Could not load directly (CORS). Please download and drag the file into the player.");
    }
    setLoadingDirect(null);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-8 pointer-events-none">
      <div className="w-full max-w-xl bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col pointer-events-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center">
              <i className="fa-solid fa-cloud-arrow-down text-blue-400"></i>
            </div>
            <div>
              <h3 className="font-bold text-white leading-tight">Online Subtitles</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">AI-Powered Search</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 max-h-[60vh]">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-xs font-bold animate-in slide-in-from-top-2">
               <i className="fa-solid fa-circle-exclamation mr-2"></i>
               {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-blue-400 uppercase tracking-[0.2em] animate-pulse">Searching the web...</p>
                <p className="text-xs text-white/20 mt-2 font-medium">Looking for matches for: {videoTitle}</p>
              </div>
            </div>
          ) : results ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-sm text-white/70 leading-relaxed italic">
                  "{results.text}"
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black pl-1">Found Sources</h4>
                {results.sources.length > 0 ? (
                  results.sources.map((source, i) => (
                    <div 
                      key={i}
                      className="group flex items-center justify-between p-4 bg-white/2 border border-white/5 hover:border-white/10 rounded-2xl transition-all"
                    >
                      <div className="flex flex-col gap-1 overflow-hidden flex-1">
                        <span className="text-sm font-bold text-white/80 truncate">
                          {source.title}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                             {source.source}
                           </span>
                           {source.isDirectLink && (
                             <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 text-[8px] rounded-md font-black uppercase tracking-widest">Direct File</span>
                           )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {source.isDirectLink && (
                          <button 
                            onClick={() => handleDirectLoad(source.url, source.title)}
                            disabled={!!loadingDirect}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase rounded-xl transition-all disabled:opacity-50"
                          >
                            {loadingDirect === source.url ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Load Now'}
                          </button>
                        )}
                        <a 
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all"
                          title="Open Link"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-white/20">
                    <i className="fa-solid fa-magnifying-glass text-2xl mb-3 block"></i>
                    <p className="text-xs font-bold uppercase tracking-widest">No direct links found</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="p-6 bg-black/40 border-t border-white/5 text-center">
          <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-black">
            Download the subtitle file and drag it into the player if loading fails
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubtitleSearch;
