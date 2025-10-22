import { z } from 'zod'

export const inviteUserSchema = z.object({
  name: z.string(),
  email: z.string()
})

export type InviteUser = z.infer<typeof inviteUserSchema>
