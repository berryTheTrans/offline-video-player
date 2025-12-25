
import React, { useState, useCallback, useEffect } from 'react';
import { MediaFile } from './types';
import DropZone from './components/FilePicker/DropZone';
import VideoPlayer from './components/VideoPlayer/VideoPlayer';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [playlist, setPlaylist] = useState<MediaFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle files added from DropZone or Sidebar
  const handleFilesAdded = useCallback((files: File[]) => {
    const newFiles: MediaFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      isAudio: file.type.startsWith('audio/')
    }));

    setPlaylist(prev => {
      const newState = [...prev, ...newFiles];
      if (prev.length === 0 && newState.length > 0) {
        setCurrentIndex(0);
      }
      return newState;
    });
  }, []);

  const convertSrtToVtt = (text: string): string => {
    return 'WEBVTT\n\n' + text.replace(/(\d+:\d+:\d+),(\d+)/g, '$1.$2');
  };

  const handleAddSubtitle = useCallback(async (file: File) => {
    if (currentIndex === -1) return;

    let finalFile = file;
    if (file.name.endsWith('.srt')) {
      const text = await file.text();
      const vttText = convertSrtToVtt(text);
      finalFile = new File([vttText], file.name.replace('.srt', '.vtt'), { type: 'text/vtt' });
    }

    const subUrl = URL.createObjectURL(finalFile);
    setPlaylist(prev => prev.map((item, idx) => 
      idx === currentIndex ? { ...item, subtitleUrl: subUrl, subtitleName: file.name } : item
    ));
  }, [currentIndex]);

  const handleSubtitleUrlAdded = useCallback(async (url: string, name: string) => {
    if (currentIndex === -1) return;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      
      let text = await response.text();
      let blob: Blob;
      
      if (url.toLowerCase().endsWith('.srt') || (!url.toLowerCase().endsWith('.vtt') && text.includes('-->') && !text.includes('WEBVTT'))) {
        text = convertSrtToVtt(text);
        blob = new Blob([text], { type: 'text/vtt' });
      } else {
        blob = new Blob([text], { type: 'text/vtt' });
      }

      const subUrl = URL.createObjectURL(blob);
      setPlaylist(prev => prev.map((item, idx) => 
        idx === currentIndex ? { ...item, subtitleUrl: subUrl, subtitleName: name } : item
      ));
      return true;
    } catch (err) {
      console.error("Failed to load subtitle from URL:", err);
      return false;
    }
  }, [currentIndex]);

  const removeVideo = useCallback((id: string) => {
    setPlaylist(prev => {
      const indexToRemove = prev.findIndex(v => v.id === id);
      if (indexToRemove === -1) return prev;
      
      const newPlaylist = prev.filter(v => v.id !== id);
      if (prev[indexToRemove].url) URL.revokeObjectURL(prev[indexToRemove].url);
      if (prev[indexToRemove].subtitleUrl) URL.revokeObjectURL(prev[indexToRemove].subtitleUrl);

      if (newPlaylist.length === 0) {
        setCurrentIndex(-1);
      } else if (currentIndex === indexToRemove) {
        setCurrentIndex(Math.min(indexToRemove, newPlaylist.length - 1));
      } else if (currentIndex > indexToRemove) {
        setCurrentIndex(currentIndex - 1);
      }
      
      return newPlaylist;
    });
  }, [currentIndex]);

  const clearPlaylist = useCallback(() => {
    playlist.forEach(file => {
      URL.revokeObjectURL(file.url);
      if (file.subtitleUrl) URL.revokeObjectURL(file.subtitleUrl);
    });
    setPlaylist([]);
    setCurrentIndex(-1);
    setIsSidebarOpen(false);
  }, [playlist]);

  const selectVideo = (index: number) => {
    setCurrentIndex(index);
  };

  const currentMedia = currentIndex >= 0 ? playlist[currentIndex] : null;

  useEffect(() => {
    return () => {
      playlist.forEach(file => {
        URL.revokeObjectURL(file.url);
        if (file.subtitleUrl) URL.revokeObjectURL(file.subtitleUrl);
      });
    };
  }, []);

  return (
    <div className="h-screen w-screen flex bg-[#050505] text-white overflow-hidden relative">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        playlist={playlist}
        currentIndex={currentIndex}
        onSelectVideo={selectVideo}
        onRemoveVideo={removeVideo}
        onAddFiles={handleFilesAdded}
        onClearPlaylist={clearPlaylist}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {playlist.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-[#0a0a0a] to-[#111]">
            <DropZone onFilesAdded={handleFilesAdded} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col relative bg-[#050505]">
            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
              {currentMedia && (
                <VideoPlayer 
                  video={currentMedia} 
                  onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                  onNext={() => currentIndex < playlist.length - 1 && setCurrentIndex(currentIndex + 1)}
                  onPrev={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
                  onAddSubtitle={handleAddSubtitle}
                  onSubtitleUrlAdded={handleSubtitleUrlAdded}
                  hasNext={currentIndex < playlist.length - 1}
                  hasPrev={currentIndex > 0}
                />
              )}
            </div>
          </div>
        )}

        {playlist.length > 0 && !isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-6 left-6 z-50 p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/20 transition-all text-white shadow-2xl"
            title="Open Library"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        )}
      </main>
    </div>
  );
};

export default App;
