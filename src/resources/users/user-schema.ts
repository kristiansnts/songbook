import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  role: z.enum(['admin', 'member', 'guest']).default('member'),
  status: z.enum(['active', 'pending', 'request', 'suspend']).default('active'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type User = z.infer<typeof userSchema>

export const createUserSchema = userSchema.omit({
  id: true,
  password: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateUser = z.infer<typeof createUserSchema>

export const updateUserSchema = userSchema.partial().omit({
  id: true,
  password: true,
  createdAt: true,
  updatedAt: true,
})

export type UpdateUser = z.infer<typeof updateUserSchema>
