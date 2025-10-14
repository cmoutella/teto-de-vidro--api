import type { UserRole } from '@src/modules/users/schemas/models/user.interface'

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthenticatedUser {
  id: string
  email: string
  accessLevel: number
  role: UserRole
}
