import { z } from 'zod'

export const tagSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Tag = z.infer<typeof tagSchema>

export const createTagSchema = tagSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateTag = z.infer<typeof createTagSchema>
