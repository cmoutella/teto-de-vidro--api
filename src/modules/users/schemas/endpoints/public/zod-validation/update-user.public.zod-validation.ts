import { z } from 'zod'

import { GENDERS, USER_STATUS } from '../../../consts/shared'

// user data
export const updateUserSchema = z.object({
  name: z.string().optional(),
  familyName: z.string().optional(),

  profession: z.string().optional(),
  gender: z.enum(GENDERS).optional(),
  birthDate: z.string().optional(),

  welcomeCompleted: z.boolean().optional()
})
export type UpdateUser = z.infer<typeof updateUserSchema>

export const initialUpdateUserSchema = z.object({
  cpf: z.string(),
  birthDate: z.string()
})
export type InitialUpdateUser = z.infer<typeof initialUpdateUserSchema>

// password
export const updateUserPasswordSchema = z.object({
  password: z.string()
})

export type UpdateUserPassword = z.infer<typeof updateUserPasswordSchema>

// user email
export const updateUserEmailSchema = z.object({
  email: z.string()
})
export type UpdateEmail = z.infer<typeof updateUserEmailSchema>

// user access level
export const updateUserAccessSchema = z.object({
  accessLevel: z.number().optional(),
  role: z.enum(USER_STATUS).optional()
})
export type UpdateLevel = z.infer<typeof updateUserAccessSchema>

// change password
export const changePasswordSchema = z.object({
  password: z.string()
})
export type ChangePassword = z.infer<typeof changePasswordSchema>
