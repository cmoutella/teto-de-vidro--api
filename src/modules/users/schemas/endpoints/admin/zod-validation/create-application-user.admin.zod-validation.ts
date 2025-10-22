import { z } from 'zod'

export const createApplicationSchema = z.object({
  name: z.string(),
  email: z.string()
})

export type CreateApplication = z.infer<typeof createApplicationSchema>
