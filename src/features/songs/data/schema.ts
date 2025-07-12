import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const songSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.string(),
  label: z.string(),
  lyric: z.string().optional(),
  chords: z.string().optional(),
  lyricAndChords: z.string().optional(),
  baseChord: z.string().optional(),
})

export type Song = z.infer<typeof songSchema>
