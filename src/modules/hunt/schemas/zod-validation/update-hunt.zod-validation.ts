import { inviteUserSchema } from '@src/modules/users/schemas/endpoints/public/zod-validation/invite-user.public.zod-validation'
import { CONTRACT_TYPE } from '@src/shared/const'
import { z } from 'zod'

export const updateHuntSchema = z.object({
  title: z.string().optional(),
  movingExpected: z.string().optional(),
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
  livingPeople: z.number().optional(),
  livingPets: z.number().optional(),
  type: z.enum(CONTRACT_TYPE).optional()
})

export type UpdateHunt = z.infer<typeof updateHuntSchema>

export const usersInvited = z.object({
  usersInvited: z.array(inviteUserSchema)
})

export type UsersInvited = z.infer<typeof usersInvited>
