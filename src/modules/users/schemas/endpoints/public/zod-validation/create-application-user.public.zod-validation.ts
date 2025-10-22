import { z } from 'zod'

export const createApplicationUserSchema = z.object({
  name: z.string(),
  email: z.string(),
  role: z.string(),
  password: z.string()
})

export type CreateApplicationUser = z.infer<typeof createApplicationUserSchema>
