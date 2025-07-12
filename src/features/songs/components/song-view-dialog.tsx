import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Song } from '../data/schema'
import { parseLyricsAndChords, richTextToPlainText, transposeLyricsAndChords, getAvailableChords, transposeChord, calculateSemitones } from '@/utils/lyrics-parser'
import React from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  song: Song | null
}

export function SongViewDialog({ open, onOpenChange, song }: Props) {
  const [selectedChord, setSelectedChord] = useState<string>('')
  
  // Reset selected chord when song changes
  React.useEffect(() => {
    if (song?.id) {
      setSelectedChord('')
    }
  }, [song?.id])
  
  if (!song) return null

  const availableChords = getAvailableChords()
  
  // Parse the song data
  const plainText = richTextToPlainText(song.lyricAndChords || '')
  const parsed = parseLyricsAndChords(plainText)
  
  // Get chords array - prefer stored chords, fallback to parsed
  const chordsArray = song.chords 
    ? song.chords.split(',').map(c => c.trim()).filter(c => c)
    : parsed.chords
  
  // Get base chord - prefer explicitly set baseChord, fallback to first chord found
  const baseChord = song.baseChord || (chordsArray.length > 0 ? chordsArray[0] : 'C')
  
  // Calculate transpose value based on selected chord
  const transposeValue = selectedChord ? calculateSemitones(baseChord, selectedChord) : 0
  
  // Get transposed content
  const transposedContent = transposeValue === 0 
    ? song.lyricAndChords || ''
    : transposeLyricsAndChords(song.lyricAndChords || '', chordsArray, transposeValue)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] sm:w-[95vw] max-w-[800px] max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="text-lg font-semibold">{song.title}</div>
            {song.artist && (
              <div className="text-sm text-muted-foreground">by {song.artist}</div>
            )}
          </DialogTitle>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-2">
            <div className="text-sm text-muted-foreground">
              Original key: <span className="font-mono font-medium">{baseChord}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Transpose to:</span>
              <Select
                value={selectedChord}
                onValueChange={setSelectedChord}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select key" />
                </SelectTrigger>
                <SelectContent>
                  {availableChords.map((chord) => (
                    <SelectItem key={chord.value} value={chord.value}>
                      {chord.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedChord && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedChord('')}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-6">
          <div 
            className="prose prose-sm max-w-none font-mono whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{ __html: transposedContent }}
          />
        </div>
        
        {chordsArray.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="text-sm font-medium mb-2">Chords used:</div>
            <div className="flex flex-wrap gap-2">
              {chordsArray.map((chord, index) => {
                const transposedChord = transposeValue === 0 
                  ? chord 
                  : transposeChord(chord, transposeValue)
                return (
                  <span key={index} className="px-2 py-1 bg-muted rounded text-sm font-mono">
                    {transposedChord}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}