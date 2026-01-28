import { useState } from 'react'
import React from 'react'
import {
  parseLyricsAndChords,
  richTextToPlainText,
  transposeLyricsAndChords,
  getAvailableChords,
  calculateSemitones,
} from '@/utils/lyrics-parser'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Song } from '../data/schema'

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
    ? song.chords
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c)
    : parsed.chords

  // Get base chord - prefer explicitly set baseChord, fallback to first chord found
  const baseChord =
    song.baseChord || (chordsArray.length > 0 ? chordsArray[0] : 'C')

  // Calculate transpose value based on selected chord
  const transposeValue = selectedChord
    ? calculateSemitones(baseChord, selectedChord)
    : 0

  // Get transposed content
  const transposedContent =
    transposeValue === 0
      ? song.lyricAndChords || ''
      : transposeLyricsAndChords(
          song.lyricAndChords || '',
          chordsArray,
          transposeValue
        )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] w-[98vw] max-w-[800px] overflow-y-auto sm:max-h-[85vh] sm:w-[95vw]'>
        <DialogHeader>
          <DialogTitle>
            <div className='text-lg font-semibold'>{song.title}</div>
            {song.artist && (
              <div className='text-muted-foreground text-sm'>
                by {song.artist}
              </div>
            )}
          </DialogTitle>

          <div className='flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:gap-4'>
            <div className='text-muted-foreground text-sm'>
              Original key:{' '}
              <span className='font-mono font-medium'>{baseChord}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>Transpose to:</span>
              <Select value={selectedChord} onValueChange={setSelectedChord}>
                <SelectTrigger className='w-[120px]'>
                  <SelectValue placeholder='Select key' />
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
                  variant='outline'
                  size='sm'
                  onClick={() => setSelectedChord('')}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className='mt-6'>
          <div
            className='prose prose-sm max-w-none overflow-hidden font-mono text-xs leading-relaxed break-all whitespace-pre-line sm:text-sm'
            dangerouslySetInnerHTML={{ __html: transposedContent }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
