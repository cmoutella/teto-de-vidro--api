import { z } from 'zod'

import { GENDERS, USER_STATUS } from './shared'

export const createUserSchema = z.object({
  name: z.string(),
  familyName: z.string(),
  cpf: z.string(),
  email: z.string(),

  accessLevel: z.number().optional(),
  role: z.enum(USER_STATUS).optional(),

  profession: z.string().optional(),
  gender: z.enum(GENDERS).optional(),
  birthDate: z.string(),

  password: z.string()
})

export type CreateUser = z.infer<typeof createUserSchema>
