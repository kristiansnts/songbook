import { z } from 'zod'

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
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Song = z.infer<typeof songSchema>

export const createSongSchema = songSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateSong = z.infer<typeof createSongSchema>
