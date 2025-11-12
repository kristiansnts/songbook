export const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];

// Handle enharmonic equivalents
export const normalizeKey = (key: string): string => {
  const enharmonic: Record<string, string> = {
    'Db': 'C#',
    'Eb': 'D#', 
    'Gb': 'F#',
    'Ab': 'G#',
    'A#': 'Bb',
    'E#': 'F', // Added for robustness with C# major scale
    'B#': 'C'  // Added for robustness with C# major scale
  };
  return enharmonic[key] || key;
};

// Diatonic chords for each major key (using KEYS array names for consistency)
export const DIATONIC_CHORDS: Record<string, string[]> = {
  // Major keys
  'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
  'C#': ['C#', 'D#m', 'E#m', 'F#', 'G#', 'A#m', 'B#dim'], // E# is F, B# is C
  'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
  'D#': ['D#', 'Fm', 'Gm', 'G#', 'A#', 'Cm', 'Ddim'], // Corresponds to Eb Major
  'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
  'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
  'F#': ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'], // Corresponds to Gb Major
  'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
  'G#': ['G#', 'A#m', 'B#m', 'C#', 'D#', 'Fm', 'Gdim'], // Corresponds to Ab Major
  'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
  'Bb': ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'],
  'B': ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
  
  // Minor keys (natural minor scale)
  'Cm': ['Cm', 'Ddim', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb'],
  'Dm': ['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C'],
  'Em': ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D'],
  'Fm': ['Fm', 'Gdim', 'Ab', 'Bbm', 'Cm', 'Db', 'Eb'],
  'Gm': ['Gm', 'Adim', 'Bb', 'Cm', 'Dm', 'Eb', 'F'],
  'Am': ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'],
  'Bm': ['Bm', 'C#dim', 'D', 'Em', 'F#m', 'G', 'A'],
};

// Chord transposition logic (Diatonic Transposition)
export const transposeChord = (chord: string, fromKey: string, toKey: string): string => {
  if (fromKey === toKey) return chord;
  
  const normalizedFromKey = normalizeKey(fromKey);
  const normalizedToKey = normalizeKey(toKey);
  
  const originalScaleChords = DIATONIC_CHORDS[normalizedFromKey];
  const targetScaleChords = DIATONIC_CHORDS[normalizedToKey];
  
  if (!originalScaleChords || !targetScaleChords) {
    console.warn(`Diatonic chords not defined for base key: ${normalizedFromKey} or target key: ${normalizedToKey}. Cannot perform diatonic transposition for chord: ${chord}.`);
    return chord;
  }
  
  // Handle slash chords (e.g., D/F#) recursively.
  if (chord.includes('/')) {
    const [mainChord, bassNote] = chord.split('/');
    const transposedMain = transposeChord(mainChord, fromKey, toKey); 
    const transposedBass = transposeChord(bassNote, fromKey, toKey); 
    return `${transposedMain}/${transposedBass}`;
  }
  
  // Extract chord root (e.g., 'G' from 'Gmaj7', 'D#' from 'D#m')
  const rootMatch = chord.match(/^([A-G][#b]?)/);
  if (!rootMatch) {
    return chord;
  }
  
  const chordRoot = rootMatch[1];
  const chordSuffix = chord.slice(chordRoot.length);
  
  let currentChordRootIndex = -1;
  for (let i = 0; i < originalScaleChords.length; i++) {
    const scaleChordRoot = originalScaleChords[i].match(/^([A-G][#b]?)/)?.[1];
    if (scaleChordRoot && normalizeKey(scaleChordRoot) === normalizeKey(chordRoot)) {
      currentChordRootIndex = i;
      break;
    }
  }

  if (currentChordRootIndex === -1) {
    return chord;
  }
  
  const transposedRootWithQuality = targetScaleChords[currentChordRootIndex];
  const transposedRootMatch = transposedRootWithQuality.match(/^([A-G][#b]?)/);
  const finalTransposedRoot = transposedRootMatch ? transposedRootMatch[1] : transposedRootWithQuality;

  return finalTransposedRoot + chordSuffix;
};

// Function to transpose chords in the stored styled format
export const transposeStoredChords = (htmlContent: string, fromKey: string, toKey: string): string => {
  if (fromKey === toKey) {
    // Update data-key attribute even if no transposition
    return htmlContent.replace(/data-key="[^"]*"/, `data-key="${toKey}"`);
  }

  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Find all spans with class "c" (chord spans) and transpose their text content
  const chordSpans = tempDiv.querySelectorAll('span.c');
  chordSpans.forEach((span) => {
    const originalChord = span.textContent || '';
    const transposedChord = transposeChord(originalChord, fromKey, toKey);
    span.textContent = transposedChord;
  });
  
  // Update the data-key attribute to reflect the current key
  const preElement = tempDiv.querySelector('pre[data-key]');
  if (preElement) {
    preElement.setAttribute('data-key', toKey);
  }
  
  return tempDiv.innerHTML;
};