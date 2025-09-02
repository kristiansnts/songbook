import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Song } from '@/types/song';
import { cn } from '@/lib/utils';
import { KEYS, transposeStoredChords } from '@/lib/transpose-utils';

interface SongViewerProps {
  song: Song;
}

export function SongViewer({ song }: SongViewerProps) {
  const [selectedKey, setSelectedKey] = useState(song.base_chord || 'C');
  const lyricsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to lyrics section on load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (lyricsRef.current) {
        lyricsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const memoizedTransposedContent = useCallback(() => {
    // Transpose chords in the stored styled format
    return transposeStoredChords(
      song.lyrics_and_chords, 
      song.base_chord || 'C', 
      selectedKey
    );
  }, [song.lyrics_and_chords, song.base_chord, selectedKey]);

  return (
    <div className="w-full max-w-3xl mx-auto px-3 py-4 space-y-4">
      {/* Compact Header Section */}
      <div className="space-y-1">
        <h1 className="text-lg md:text-xl font-bold text-gray-900">{song.title}</h1>
        <p className="text-sm md:text-base text-gray-600">{song.artist}</p>
      </div>

      {/* Compact Key Selector Grid */}
      <div className="grid grid-cols-6 gap-2 max-w-xs">
        {KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setSelectedKey(key)}
            className={cn(
              "h-8 w-8 rounded-lg text-sm font-semibold transition-colors",
              selectedKey === key 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            )}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Compact Lyrics Section - More space for lyrics */}
      <div ref={lyricsRef}>
        {song.lyrics_and_chords && song.lyrics_and_chords.trim() !== '' ? (
          <div 
            key={selectedKey}
            className="prose-sm max-w-none text-sm md:text-base leading-normal"
            dangerouslySetInnerHTML={{ __html: memoizedTransposedContent() }}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No lyrics and chords available for this song.</p>
          </div>
        )}
      </div>
    </div>
  );
}
