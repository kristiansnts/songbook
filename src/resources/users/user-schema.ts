import { z } from 'zod'
import { UserRoleEnum } from '@/enums/User/UserRoleEnum'
import { UserStatusEnum } from '@/enums/User/UserStatusEnum'

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  role: z.nativeEnum(UserRoleEnum).default(UserRoleEnum.MEMBER),
  status: z.nativeEnum(UserStatusEnum).default(UserStatusEnum.PENDING),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type User = z.infer<typeof userSchema>

export const updateUserSchema = userSchema.partial().omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
})

export type UpdateUser = z.infer<typeof updateUserSchema>
