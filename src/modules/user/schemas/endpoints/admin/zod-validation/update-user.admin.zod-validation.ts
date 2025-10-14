import { z } from 'zod'

import { GENDERS, USER_STATUS } from '../../../consts/shared'

// user data
export const adminUpdateUserSchema = z.object({
  name: z.string().optional(),
  familyName: z.string().optional(),

  accessLevel: z.number().optional(),
  role: z.enum(USER_STATUS).optional(),

  profession: z.string().optional(),
  gender: z.enum(GENDERS).optional(),
  birthDate: z.string()
})
export type AdminUpdateUser = z.infer<typeof adminUpdateUserSchema>
