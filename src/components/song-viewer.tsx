import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Song } from '@/types/song';
import { cn } from '@/lib/utils';
import { KEYS, transposeStoredChords } from '@/lib/transpose-utils';
import { ChordSwitcher } from '@/components/ui/chord-switcher';

interface SongViewerProps {
  song: Song;
}

export function SongViewer({ song }: SongViewerProps) {
  const [selectedKey, setSelectedKey] = useState(song.base_chord || 'C');
  const [showChords, setShowChords] = useState(true);
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
    let content = transposeStoredChords(
      song.lyrics_and_chords,
      song.base_chord || 'C',
      selectedKey
    );

    // Apply chord visibility using CSS
    if (!showChords) {
      // Enhanced CSS to hide chords and slash characters properly
      const style = `
        <style>
          .c { display: none !important; }
          /* Hide slash characters that appear before or after chord spans */
          .lyrics-content *:has(.c) .c + *:not(.c):not(br):not(div) {
            display: none !important;
          }
          /* Hide standalone slash characters */
          .lyrics-content span:not(.c):empty + span:not(.c)[title*="/"],
          .lyrics-content span:not(.c):contains("/") {
            display: none !important;
          }
          /* More specific targeting of slash characters */
          .lyrics-content {
            --chord-display: none !important;
          }
          .lyrics-content .c,
          .lyrics-content .c + span:not(.c):not([class]) {
            display: var(--chord-display) !important;
          }
        </style>
      `;
      content = style + content;

      // Additional processing: Remove slash characters that are typically part of chord notation
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;

      // Find and remove text nodes that contain only "/" or are slash-related
      const walker = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      const textNodesToRemove: Text[] = [];
      let node;
      while (node = walker.nextNode()) {
        const textNode = node as Text;
        if (textNode.textContent && textNode.textContent.trim() === '/') {
          textNodesToRemove.push(textNode);
        }
      }

      textNodesToRemove.forEach(textNode => {
        if (textNode.parentNode) {
          textNode.parentNode.removeChild(textNode);
        }
      });

      content = tempDiv.innerHTML;
    }

    return content;
  }, [song.lyrics_and_chords, song.base_chord, selectedKey, showChords]);

  return (
    <div className="w-full max-w-3xl mx-auto px-3 py-4 space-y-4">
      {/* Compact Header Section */}
      <div className="space-y-1">
        <h1 className="text-lg md:text-xl font-bold text-foreground">{song.title}</h1>
        <p className="text-sm md:text-base text-muted-foreground">{Array.isArray(song.artist) ? song.artist.join(', ') : song.artist}</p>
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
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Chord Switcher */}
      <ChordSwitcher
        showChords={showChords}
        onToggle={setShowChords}
      />

      {/* Compact Lyrics Section - More space for lyrics */}
      <div ref={lyricsRef}>
        {song.lyrics_and_chords && song.lyrics_and_chords.trim() !== '' ? (
          <div 
            key={selectedKey}
            className="prose-sm max-w-none text-sm md:text-base leading-normal"
            dangerouslySetInnerHTML={{ __html: memoizedTransposedContent() }}
          />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">No lyrics and chords available for this song.</p>
          </div>
        )}
      </div>
    </div>
  );
}
