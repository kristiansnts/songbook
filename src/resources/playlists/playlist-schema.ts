import { z } from 'zod'

export const playlistSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Playlist = z.infer<typeof playlistSchema>

export const createPlaylistSchema = playlistSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreatePlaylist = z.infer<typeof createPlaylistSchema>
