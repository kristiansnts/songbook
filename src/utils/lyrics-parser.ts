export interface ParsedSong {
  lyricsAndChords: string
  lyrics: string
  chords: string[]
}

/**
 * Parses lyrics and chords text to extract different components
 * Input format example:
 * D              G
 * Bapa, Engkau Sungguh Baik
 *          F#m  Bm  E         A
 * Kasih-Mu Melimpah   Di Hidupku
 */
export function parseLyricsAndChords(input: string): ParsedSong {
  if (!input.trim()) {
    return {
      lyricsAndChords: '',
      lyrics: '',
      chords: [],
    }
  }

  const lines = input.split('\n')
  const lyricsLines: string[] = []
  const chordsSet = new Set<string>()

  let i = 0
  while (i < lines.length) {
    const currentLine = lines[i].trim()
    const nextLine = lines[i + 1]?.trim() || ''

    // Check if current line contains mainly chords (no lowercase letters or common words)
    const isChordLine = isLikelyChordLine(currentLine)

    if (isChordLine && nextLine && !isLikelyChordLine(nextLine)) {
      // This is a chord line followed by a lyrics line
      extractChordsFromLine(currentLine, chordsSet)
      lyricsLines.push(nextLine)
      i += 2 // Skip both lines
    } else if (!isChordLine && currentLine) {
      // This is a lyrics line without chords above it
      lyricsLines.push(currentLine)
      i += 1
    } else if (isChordLine) {
      // Standalone chord line
      extractChordsFromLine(currentLine, chordsSet)
      i += 1
    } else {
      // Empty line or other
      if (currentLine === '') {
        lyricsLines.push('')
      }
      i += 1
    }
  }

  return {
    lyricsAndChords: input,
    lyrics: lyricsLines.join('\n').trim(),
    chords: Array.from(chordsSet).sort(),
  }
}

/**
 * Determines if a line is likely to contain chords
 */
function isLikelyChordLine(line: string): boolean {
  if (!line.trim()) return false

  // Remove spaces and check if it contains chord-like patterns
  const words = line.trim().split(/\s+/)

  // If line has more than 6 words, it's probably lyrics
  if (words.length > 6) return false

  // Check if most words look like chords
  const chordLikeWords = words.filter((word) => isLikelyChord(word))

  // If more than half the words are chord-like, consider it a chord line
  return chordLikeWords.length > words.length / 2
}

/**
 * Determines if a word is likely to be a chord
 */
function isLikelyChord(word: string): boolean {
  if (!word) return false

  // Common chord patterns
  const chordPattern =
    /^[A-G][#b]?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G][#b]?)?$/

  // Also check for simple patterns like A, Bb, C#m, etc.
  const simpleChordPattern = /^[A-G][#b]?m?$/

  return chordPattern.test(word) || simpleChordPattern.test(word)
}

/**
 * Extracts individual chords from a chord line
 */
function extractChordsFromLine(line: string, chordsSet: Set<string>): void {
  const words = line.trim().split(/\s+/)

  words.forEach((word) => {
    if (isLikelyChord(word)) {
      chordsSet.add(word)
    }
  })
}

/**
 * Converts HTML from rich text editor to plain text
 */
export function richTextToPlainText(html: string): string {
  // Remove HTML tags and decode entities
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Decode ampersands
    .replace(/&lt;/g, '<') // Decode less than
    .replace(/&gt;/g, '>') // Decode greater than
    .replace(/&quot;/g, '"') // Decode quotes
    .trim()
}

/**
 * Basic chord transposition
 */
export function transposeChord(chord: string, semitones: number): string {
  const notes = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ]
  const flats = [
    'C',
    'Db',
    'D',
    'Eb',
    'E',
    'F',
    'Gb',
    'G',
    'Ab',
    'A',
    'Bb',
    'B',
  ]

  // Extract root note and suffix
  const match = chord.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return chord

  const [, rootNote, suffix] = match

  // Find current position
  let currentIndex = notes.indexOf(rootNote)
  if (currentIndex === -1) {
    currentIndex = flats.indexOf(rootNote)
  }
  if (currentIndex === -1) return chord

  // Calculate new position
  const newIndex = (currentIndex + semitones + 12) % 12

  // Use sharps for positive transposition, flats for negative
  const newRoot = semitones >= 0 ? notes[newIndex] : flats[newIndex]

  return newRoot + suffix
}

/**
 * Transpose all chords in HTML content
 */
export function transposeLyricsAndChords(
  html: string,
  chordsArray: string[],
  semitones: number
): string {
  let transposedHtml = html

  // Create a mapping of original chords to transposed chords
  const chordMap = new Map<string, string>()
  chordsArray.forEach((chord) => {
    chordMap.set(chord, transposeChord(chord, semitones))
  })

  // Replace each chord in the HTML content
  chordMap.forEach((transposedChord, originalChord) => {
    // Create a regex that matches the chord as a whole word
    const regex = new RegExp(`\\b${escapeRegex(originalChord)}\\b`, 'g')
    transposedHtml = transposedHtml.replace(regex, transposedChord)
  })

  return transposedHtml
}

/**
 * Helper function to escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Get available transposition options for a song
 */
export function getTransposeOptions(): Array<{ label: string; value: number }> {
  return [
    { label: 'Original', value: 0 },
    { label: '+1 (Half step up)', value: 1 },
    { label: '+2 (Whole step up)', value: 2 },
    { label: '+3', value: 3 },
    { label: '+4', value: 4 },
    { label: '+5', value: 5 },
    { label: '+6 (Tritone)', value: 6 },
    { label: '-6 (Tritone)', value: -6 },
    { label: '-5', value: -5 },
    { label: '-4', value: -4 },
    { label: '-3', value: -3 },
    { label: '-2 (Whole step down)', value: -2 },
    { label: '-1 (Half step down)', value: -1 },
  ]
}

/**
 * Get all available chords for transposition
 */
export function getAvailableChords(): Array<{ label: string; value: string }> {
  return [
    { label: 'C', value: 'C' },
    { label: 'C#/Db', value: 'C#' },
    { label: 'D', value: 'D' },
    { label: 'D#/Eb', value: 'D#' },
    { label: 'E', value: 'E' },
    { label: 'F', value: 'F' },
    { label: 'F#/Gb', value: 'F#' },
    { label: 'G', value: 'G' },
    { label: 'G#/Ab', value: 'G#' },
    { label: 'A', value: 'A' },
    { label: 'A#/Bb', value: 'A#' },
    { label: 'B', value: 'B' },
  ]
}

/**
 * Calculate semitones between two chords
 */
export function calculateSemitones(fromChord: string, toChord: string): number {
  const notes = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ]
  const flats = [
    'C',
    'Db',
    'D',
    'Eb',
    'E',
    'F',
    'Gb',
    'G',
    'Ab',
    'A',
    'Bb',
    'B',
  ]

  // Extract root note from chord
  const fromRoot = fromChord.match(/^([A-G][#b]?)/)?.[1] || fromChord
  const toRoot = toChord.match(/^([A-G][#b]?)/)?.[1] || toChord

  // Find positions
  let fromIndex = notes.indexOf(fromRoot)
  if (fromIndex === -1) fromIndex = flats.indexOf(fromRoot)

  let toIndex = notes.indexOf(toRoot)
  if (toIndex === -1) toIndex = flats.indexOf(toRoot)

  if (fromIndex === -1 || toIndex === -1) return 0

  // Calculate semitones difference
  let semitones = toIndex - fromIndex
  if (semitones > 6) semitones -= 12
  if (semitones < -6) semitones += 12

  return semitones
}
