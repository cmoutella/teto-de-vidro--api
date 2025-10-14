import { z } from 'zod'

import { GENDERS, USER_STATUS } from '../../../consts/shared'

export const adminCreateUserSchema = z.object({
  name: z.string(),
  familyName: z.string().optional(),
  cpf: z.string().optional(),
  email: z.string(),

  accessLevel: z.number(),
  role: z.enum(USER_STATUS),

  profession: z.string().optional(),
  gender: z.enum(GENDERS).optional(),
  birthDate: z.string().optional()
})

export type AdminCreateUser = z.infer<typeof adminCreateUserSchema>
