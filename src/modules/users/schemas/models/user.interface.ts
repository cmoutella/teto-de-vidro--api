export type UserRole =
  | 'beta'
  | 'guest'
  | 'regular'
  | 'tester'
  | 'admin'
  | 'master'
  | 'app'

export type Gender = 'male' | 'female' | 'neutral'

export interface InterfaceUser {
  id?: string

  // identify user
  name: string
  familyName?: string
  cpf?: string
  email: string

  // access
  accessLevel: number
  role: UserRole

  // user profiling
  profession?: string
  gender?: Gender
  birthDate?: string

  // user settings
  password?: string

  // history
  createdAt: string
  updatedAt: string
  welcomeCompleted: boolean
  lastLogin?: string
}

// returned on public routes
export type PublicInterfaceUser = Omit<InterfaceUser, 'password'>
