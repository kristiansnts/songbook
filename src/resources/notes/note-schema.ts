import { z } from 'zod'

export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Note = z.infer<typeof noteSchema>

export const createNoteSchema = noteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateNote = z.infer<typeof createNoteSchema>
